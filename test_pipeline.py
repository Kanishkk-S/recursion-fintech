"""
Automated Adversarial Test Suite for Fintech Data Ingestion, Normalization, and Reconciliation Pipeline.
"""

from decimal import Decimal
import json
import os
import tempfile
import unittest
from typing import Any, Dict, List, Optional

from pipeline import (
    CurrencyConverter,
    CurrencyNormaliser,
    LedgerReconciler,
    MerchantResolver,
    PythonREPLSandbox,
    TransactionPipeline,
    fetch_transaction_feed,
    get_exchange_rates,
    load_merchant_categories,
    normalize_transaction,
    DEFAULT_INR_EXCHANGE_RATES,
    DEFAULT_EXCHANGE_RATES,
)


class MockAPIClient:
    """Mock API client simulating various network, pagination, and failure scenarios."""

    def __init__(self, pages: Dict[int, Any], fail_attempts: int = 0):
        self.pages = pages
        self.fail_attempts = fail_attempts
        self.call_counts: Dict[int, int] = {}

    def get_transactions(self, page: int = 1) -> Any:
        self.call_counts[page] = self.call_counts.get(page, 0) + 1
        if self.fail_attempts > 0 and self.call_counts[page] <= self.fail_attempts:
            raise ConnectionError("Simulated intermittent connection timeout")
        return self.pages.get(page, [])


class TestCurrencyConverter(unittest.TestCase):
    """Test suite for high-precision currency normalization."""

    def setUp(self):
        self.converter = CurrencyConverter()

    def test_known_foreign_currency_precision(self):
        """Verify exact precision and rounding for USD, EUR, GBP, AED, SGD, etc."""
        # 100 USD @ 83.50 -> 8350.00
        amt, err = self.converter.parse_amount(100.0)
        self.assertFalse(err)
        conv, fallback = self.converter.convert_to_inr(amt, "USD")
        self.assertFalse(fallback)
        self.assertEqual(conv, Decimal("8350.00"))

        # 45.25 EUR @ 90.75 -> 4106.4375 -> 4106.44
        amt, _ = self.converter.parse_amount("45.25")
        conv, _ = self.converter.convert_to_inr(amt, "EUR")
        self.assertEqual(conv, Decimal("4106.44"))

        # 12.333 GBP @ 106.25 -> 1310.38125 -> 1310.38
        amt, _ = self.converter.parse_amount("12.333")
        conv, _ = self.converter.convert_to_inr(amt, "GBP")
        self.assertEqual(conv, Decimal("1310.38"))

        # 150.00 AED @ 22.74 -> 3411.00
        amt, _ = self.converter.parse_amount("150.00")
        conv, _ = self.converter.convert_to_inr(amt, "AED")
        self.assertEqual(conv, Decimal("3411.00"))

    def test_symbol_and_string_sanitization(self):
        """Test sanitizing prefixed symbols, whitespaces, and European formats."""
        test_cases = [
            ("$100.50", "USD", Decimal("100.50")),
            (" 50.00 EUR ", "EUR", Decimal("50.00")),
            ("₹ 1,500.75", "INR", Decimal("1500.75")),
            ("€ 1.234,50", "EUR", Decimal("1234.50")),
            ("-75.20", "INR", Decimal("-75.20")),
            ("0.0", "INR", Decimal("0.00")),
            (0, "INR", Decimal("0")),
        ]
        for raw_str, expected_curr, expected_amt in test_cases:
            inferred_curr = self.converter.sanitize_currency_code(None, raw_str)
            parsed_amt, _ = self.converter.parse_amount(raw_str)
            self.assertEqual(parsed_amt, expected_amt)
            if expected_curr:
                self.assertEqual(inferred_curr, expected_curr)

    def test_defensive_fallbacks_unknown_currency(self):
        """Unknown currency should default to 1.0 fallback and set is_fallback flag."""
        amt, _ = self.converter.parse_amount(500)
        conv, fallback = self.converter.convert_to_inr(amt, "UNKNOWN_CURR")
        self.assertTrue(fallback)
        self.assertEqual(conv, Decimal("500.00"))


class TestMerchantResolver(unittest.TestCase):
    """Test suite for merchant entity resolution & categorization."""

    def setUp(self):
        self.resolver = MerchantResolver()

    def test_ecommerce_categorization(self):
        raw_names = ["AMZN Mktp US*1A2B", "amazon india", "FLIPKART INTERNET", "myntra.com", "Ajio Fashion", "Ebay Global"]
        for name in raw_names:
            self.assertEqual(self.resolver.resolve_category(name), "E-Commerce", f"Failed for {name}")

    def test_food_dining_categorization(self):
        raw_names = ["Swiggy Order #891", "ZOMATO RESTAURANT", "Starbucks Coffee 12", "Mcdonalds Drive-Thru", "Dominos Pizza", "Zepto Quick"]
        for name in raw_names:
            self.assertEqual(self.resolver.resolve_category(name), "Food & Dining", f"Failed for {name}")

    def test_travel_transit_categorization(self):
        raw_names = ["UBER *TRIP 123", "OLA CABS BANGALORE", "IRCTC E-TICKETING", "INDIGO AIRLINES", "MakeMyTrip Flights", "Rapido Bike"]
        for name in raw_names:
            self.assertEqual(self.resolver.resolve_category(name), "Travel & Transit", f"Failed for {name}")

    def test_entertainment_categorization(self):
        raw_names = ["Netflix.com monthly", "Spotify Premium", "Amazon Prime Video", "Disney+ Hotstar", "Apple Services", "YouTube Premium"]
        for name in raw_names:
            self.assertEqual(self.resolver.resolve_category(name), "Entertainment & Subscriptions", f"Failed for {name}")

    def test_unresolved_strings_clean_default(self):
        raw_names = ["Local corner grocery store", "Random Tech Vendor 99", None, "", "   ", "???", "Null"]
        for name in raw_names:
            self.assertEqual(self.resolver.resolve_category(name), "Uncategorized")


class TestIngestionAndPagination(unittest.TestCase):
    """Test suite for feed ingestion, backoff, and pagination."""

    def test_empty_page_returns_empty_list(self):
        client = MockAPIClient(pages={1: []})
        result = fetch_transaction_feed(client, page=1)
        self.assertEqual(result, [])

    def test_none_or_eof_client(self):
        self.assertEqual(fetch_transaction_feed(None), [])
        client = MockAPIClient(pages={})
        self.assertEqual(fetch_transaction_feed(client, page=99), [])

    def test_retry_with_exponential_backoff_success(self):
        # Fails first 2 attempts, succeeds on 3rd attempt
        client = MockAPIClient(
            pages={1: [{"id": "tx_101", "amount": 100, "merchant": "Uber"}]},
            fail_attempts=2
        )
        result = fetch_transaction_feed(client, page=1, max_retries=3, base_delay=0.01)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["id"], "tx_101")
        self.assertEqual(client.call_counts[1], 3)

    def test_retry_exhaustion_returns_empty_list(self):
        # Fails 4 attempts with max_retries=3 -> clean []
        client = MockAPIClient(
            pages={1: [{"id": "tx_101", "amount": 100}]},
            fail_attempts=4
        )
        result = fetch_transaction_feed(client, page=1, max_retries=3, base_delay=0.01)
        self.assertEqual(result, [])

    def test_wrapped_payload_structures(self):
        """Ensure unwrapping of {"data": [...]}, {"transactions": [...]}, etc."""
        client = MockAPIClient(pages={
            1: {"data": [{"txn_id": "t1", "amount": 50}]},
            2: {"transactions": [{"txn_id": "t2", "amount": 75}]},
            3: {"results": [{"txn_id": "t3", "amount": 100}]},
        })
        p1 = fetch_transaction_feed(client, page=1)
        p2 = fetch_transaction_feed(client, page=2)
        p3 = fetch_transaction_feed(client, page=3)
        self.assertEqual(len(p1), 1)
        self.assertEqual(p1[0]["txn_id"], "t1")
        self.assertEqual(len(p2), 1)
        self.assertEqual(p2[0]["txn_id"], "t2")
        self.assertEqual(len(p3), 1)
        self.assertEqual(p3[0]["txn_id"], "t3")


class TestPipelineReconciliationAndEdgeCases(unittest.TestCase):
    """Test suite for end-to-end reconciliation, defensive guards, and fixed schema output."""

    def setUp(self):
        self.pipeline = TransactionPipeline()

    def test_page_count_parity_n_inputs_to_n_outputs(self):
        """Test that N clean inputs map to N normalized records."""
        raw_items = [
            {"id": f"txn_{i}", "amount": 10.0 + i, "currency": "USD", "merchant": "Amazon", "date": "2026-09-01"}
            for i in range(25)
        ]
        results = self.pipeline.process_batch(raw_items)
        self.assertEqual(len(results), 25)
        for res in results:
            self.assertEqual(res["status"], "PROCESSED")
            self.assertEqual(res["category"], "E-Commerce")
            self.assertIsInstance(res["amount_inr"], float)

    def test_schema_field_alias_variations(self):
        """Test resilience to varied schema naming conventions."""
        raw_record = {
            "ref_no": "TXN_ALPHA_99",
            "val": "150.50",
            "curr": "EUR",
            "payee": "Swiggy Bangalore Hub",
            "created_at": "2026-09-02T10:00:00Z"
        }
        res = self.pipeline.normalize_record(raw_record)
        self.assertIsNotNone(res)
        self.assertEqual(res["transaction_id"], "TXN_ALPHA_99")
        self.assertEqual(res["original_amount"], 150.50)
        self.assertEqual(res["original_currency"], "EUR")
        self.assertEqual(res["category"], "Food & Dining")
        self.assertEqual(res["timestamp"], "2026-09-02T10:00:00Z")
        self.assertEqual(res["status"], "PROCESSED")

    def test_malformed_and_missing_keys(self):
        """Handle None, empty dicts, missing amounts/merchants without crashing."""
        self.assertIsNone(self.pipeline.normalize_record({}))
        self.assertIsNone(self.pipeline.normalize_record(None))
        self.assertIsNone(self.pipeline.normalize_record("not a dict"))

        # Missing ID gets deterministically generated and flagged
        res_no_id = self.pipeline.normalize_record({"amount": 100, "merchant": "Uber"})
        self.assertIsNotNone(res_no_id)
        self.assertTrue(res_no_id["transaction_id"].startswith("gen_"))
        self.assertEqual(res_no_id["status"], "FLAGGED")

    def test_idempotency_deduplication(self):
        """Identical transaction IDs should only be ingested once."""
        raw_items = [
            {"id": "DUP_001", "amount": 50, "currency": "INR", "merchant": "Starbucks"},
            {"id": "DUP_001", "amount": 50, "currency": "INR", "merchant": "Starbucks"},
            {"id": "DUP_002", "amount": 120, "currency": "USD", "merchant": "Netflix"},
        ]
        results = self.pipeline.process_batch(raw_items)
        self.assertEqual(len(results), 2)
        ids = [r["transaction_id"] for r in results]
        self.assertEqual(ids, ["DUP_001", "DUP_002"])

    def test_anomaly_detection_negative_and_outliers(self):
        """Negative amounts and extreme outliers must be marked FLAGGED."""
        # Negative amount
        res_neg = self.pipeline.normalize_record({"id": "TX_NEG", "amount": -50.0, "currency": "USD", "merchant": "Refund"})
        self.assertIsNotNone(res_neg)
        self.assertEqual(res_neg["status"], "FLAGGED")
        self.assertEqual(res_neg["original_amount"], -50.0)

        # Extreme outlier (> ₹10,000,000)
        res_outlier = self.pipeline.normalize_record({"id": "TX_OUTLIER", "amount": 500000.0, "currency": "USD", "merchant": "Mega Corp"})
        self.assertIsNotNone(res_outlier)
        self.assertEqual(res_outlier["status"], "FLAGGED")
        self.assertGreater(res_outlier["amount_inr"], 10000000.0)

    def test_fixed_output_schema_guarantee(self):
        """Every record output must strictly match the required dictionary structure and types."""
        raw = {
            "transaction_id": "STRICT_001",
            "amount": "249.99",
            "currency": "usd",
            "merchant": "Spotify Music Subscription",
            "timestamp": "2026-09-02 12:00:00"
        }
        res = self.pipeline.normalize_record(raw)
        self.assertIsNotNone(res)

        expected_keys = {
            "transaction_id",
            "original_amount",
            "original_currency",
            "amount_inr",
            "merchant",
            "category",
            "timestamp",
            "status",
        }
        self.assertEqual(set(res.keys()), expected_keys)
        self.assertIsInstance(res["transaction_id"], str)
        self.assertIsInstance(res["original_amount"], float)
        self.assertIsInstance(res["original_currency"], str)
        self.assertIsInstance(res["amount_inr"], float)
        self.assertIsInstance(res["merchant"], str)
        self.assertIsInstance(res["category"], str)
        self.assertTrue(res["timestamp"] is None or isinstance(res["timestamp"], str))
        self.assertIn(res["status"], ["PROCESSED", "FLAGGED"])


class TestDataSourcesIntegration(unittest.TestCase):
    """Test suite for the 3 official FinTech data sources integration."""

    def test_get_exchange_rates_fallback_on_unreachable_endpoint(self):
        """Verify get_exchange_rates gracefully falls back to DEFAULT_EXCHANGE_RATES."""
        rates = get_exchange_rates("http://invalid.unreachable.domain.test/rates", timeout=0.1)
        self.assertEqual(rates["USD"], DEFAULT_EXCHANGE_RATES["USD"])
        self.assertEqual(rates["INR"], Decimal("1.0"))

    def test_load_merchant_categories_fallback_and_file_loading(self):
        """Test loading categories from custom JSON file and fallback when absent."""
        default_cats = load_merchant_categories("non_existent_categories.json")
        self.assertIsNotNone(default_cats)

        with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
            json.dump({"E-Commerce": ["custom_mart", "super_store"]}, f)
            temp_path = f.name

        try:
            loaded = load_merchant_categories(temp_path)
            self.assertIn("E-Commerce", loaded)
            resolver = MerchantResolver(category_source=loaded)
            self.assertEqual(resolver.resolve_category("custom_mart express"), "E-Commerce")
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    def test_fetch_transaction_feed_with_endpoint_param_fallback(self):
        """Test fetch_transaction_feed accepting optional endpoint parameter without crashing."""
        res = fetch_transaction_feed(endpoint="http://invalid.unreachable.domain.test/feed", max_retries=1, base_delay=0.01)
        self.assertEqual(res, [])

    def test_normalize_transaction_top_level_helper(self):
        """Test normalize_transaction() top-level helper execution and output shape."""
        record = {
            "id": "HELPER_TX_001",
            "amount": "100.00",
            "currency": "USD",
            "merchant": "Amazon UK",
            "timestamp": "2026-09-02T12:00:00Z"
        }
        res = normalize_transaction(record)
        self.assertIsNotNone(res)
        self.assertEqual(res["transaction_id"], "HELPER_TX_001")
        self.assertEqual(res["original_currency"], "USD")
        self.assertEqual(res["category"], "E-Commerce")
        self.assertEqual(res["status"], "PROCESSED")


class TestPurchasedFeaturesAudit(unittest.TestCase):
    """Test suite verifying isolation and integrity of the 3 purchased features (Rule IV)."""

    def test_feature1_python_repl_sandbox_isolation(self):
        """Verify PythonREPLSandbox safely captures errors and executes valid logic."""
        sandbox = PythonREPLSandbox()

        # Valid function execution
        res, err = sandbox.execute_safe(lambda x, y: x * y, 6, 7)
        self.assertIsNone(err)
        self.assertEqual(res, 42)

        # Crashing function execution is trapped safely
        def failing_func():
            raise ZeroDivisionError("Simulated calculation explosion")

        res_err, err_msg = sandbox.execute_safe(failing_func)
        self.assertIsNone(res_err)
        self.assertIn("Simulated calculation explosion", err_msg)

    def test_feature2_currency_normaliser_precision_and_fallback(self):
        """Verify CurrencyNormaliser precision, custom rates, and live API fallback."""
        normaliser = CurrencyNormaliser(exchange_rates={"SGD": 62.30, "AED": 22.74})

        # Precision calculation
        amt, _ = normaliser.parse_amount("10.00")
        inr_val, is_fallback = normaliser.convert_to_inr(amt, "SGD")
        self.assertFalse(is_fallback)
        self.assertEqual(inr_val, Decimal("623.00"))

        # Inferred currency from symbol
        inferred = normaliser.sanitize_currency_code(None, "AED 500")
        self.assertEqual(inferred, "AED")

    def test_feature3_ledger_reconciler_cross_source_matching_and_variances(self):
        """Verify LedgerReconciler cross-batch matching and variance detection."""
        reconciler = LedgerReconciler(tolerance=Decimal("0.05"))

        internal_batch = [
            {"transaction_id": "TX_MATCH_1", "amount_inr": 100.00},
            {"transaction_id": "TX_VARIANCE_1", "amount_inr": 250.00},
            {"transaction_id": "TX_INTERNAL_ONLY", "amount_inr": 50.00},
        ]
        external_batch = [
            {"transaction_id": "TX_MATCH_1", "amount_inr": 100.02},  # Within tolerance
            {"transaction_id": "TX_VARIANCE_1", "amount_inr": 255.50},  # Variance > 0.05
            {"transaction_id": "TX_EXTERNAL_ONLY", "amount_inr": 75.00},
        ]

        report = reconciler.reconcile_records(internal_batch, external_batch)

        self.assertEqual(report["matched_count"], 1)
        self.assertEqual(report["variance_count"], 1)
        self.assertEqual(report["missing_in_external_count"], 1)
        self.assertEqual(report["missing_in_internal_count"], 1)
        self.assertEqual(report["variances"][0]["transaction_id"], "TX_VARIANCE_1")


if __name__ == "__main__":
    unittest.main(verbosity=2)
