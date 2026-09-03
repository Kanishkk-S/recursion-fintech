"""
Production-Grade Resilient Fintech Data Ingestion, Normalization, and Reconciliation Pipeline.
Zero-crash architecture handling adversarial feeds, varied schemas, multi-currency conversion,
merchant resolution, deduplication, and anomaly flagging.

Audited Feature Modules:
1. PythonREPLSandbox: Safe execution wrapper and isolation layer.
2. CurrencyNormaliser: Live rate API fetching, fallback tables, and Decimal INR conversions.
3. LedgerReconciler: Cross-source transaction matching, duplicate filtering, and variance detection.
"""

from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP, InvalidOperation
import hashlib
import json
import logging
import math
import os
import re
import sys
import time
from typing import Any, Callable, Dict, List, Optional, Set, Tuple, Union
import unittest
import urllib.request
import urllib.error

# Configure logging
logging.basicConfig(level=logging.WARNING, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("FintechPipeline")


# =====================================================================
# FEATURE 1: PYTHON REPL SANDBOX (ISOLATION & SAFE EXECUTION)
# =====================================================================

class PythonREPLSandbox:
    """
    Feature 1: Sandboxed execution wrapper ensuring zero-crash isolation
    for running pipeline transformations, user callbacks, and record processors.
    """

    def __init__(self, safe_globals: Optional[Dict[str, Any]] = None):
        self.globals: Dict[str, Any] = {
            "Decimal": Decimal,
            "json": json,
            "math": math,
            "re": re,
            "ROUND_HALF_UP": ROUND_HALF_UP,
        }
        if safe_globals:
            self.globals.update(safe_globals)
        self.locals: Dict[str, Any] = {}

    def execute_safe(self, func: Callable, *args: Any, **kwargs: Any) -> Tuple[Any, Optional[str]]:
        """
        Executes a callable safely, isolating runtime errors and returning (result, error_msg).
        """
        try:
            result = func(*args, **kwargs)
            return result, None
        except Exception as exc:
            logger.warning(f"Sandbox isolated error in {getattr(func, '__name__', 'anonymous')}: {exc}")
            return None, str(exc)

    def eval_expression(self, expr_str: str) -> Tuple[Any, Optional[str]]:
        """Safely evaluates a Python expression string within the sandbox."""
        try:
            result = eval(expr_str, self.globals, self.locals)
            return result, None
        except Exception as exc:
            return None, str(exc)

    def execute(self, code: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Executes arbitrary Python code statements in a sandboxed dictionary scope."""
        exec_globals = dict(self.globals)
        exec_locals = dict(self.locals)
        if context:
            exec_locals.update(context)
        exec(code, exec_globals, exec_locals)
        self.locals.update(exec_locals)
        return exec_locals


# =====================================================================
# FEATURE 2: CURRENCY NORMALISER & LIVE RATE FETCHING
# =====================================================================

# Benchmark base exchange rates to INR (1 Foreign Unit = X INR)
DEFAULT_INR_EXCHANGE_RATES: Dict[str, Decimal] = {
    "INR": Decimal("1.0"),
    "USD": Decimal("83.50"),
    "EUR": Decimal("90.75"),
    "GBP": Decimal("106.25"),
    "AED": Decimal("22.74"),
    "SGD": Decimal("62.30"),
    "CAD": Decimal("61.20"),
    "AUD": Decimal("54.80"),
    "JPY": Decimal("0.55"),
    "CHF": Decimal("93.40"),
    "CNY": Decimal("11.50"),
    "HKD": Decimal("10.70"),
    "NZD": Decimal("50.10"),
    "SAR": Decimal("22.25"),
    "QAR": Decimal("22.90"),
    "THB": Decimal("2.35"),
    "MYR": Decimal("17.80"),
    "KRW": Decimal("0.062"),
}

DEFAULT_EXCHANGE_RATES = DEFAULT_INR_EXCHANGE_RATES

CURRENCY_SYMBOLS: Dict[str, str] = {
    "₹": "INR",
    "RS": "INR",
    "RS.": "INR",
    "INR": "INR",
    "$": "USD",
    "USD": "USD",
    "US$": "USD",
    "€": "EUR",
    "EUR": "EUR",
    "£": "GBP",
    "GBP": "GBP",
    "AED": "AED",
    "DHS": "AED",
    "DH": "AED",
    "S$": "SGD",
    "SGD": "SGD",
    "C$": "CAD",
    "CAD": "CAD",
    "A$": "AUD",
    "AUD": "AUD",
    "¥": "JPY",
    "JPY": "JPY",
    "CHF": "CHF",
    "CN¥": "CNY",
    "RMB": "CNY",
    "CNY": "CNY",
    "HK$": "HKD",
    "HKD": "HKD",
    "NZ$": "NZD",
    "NZD": "NZD",
    "SAR": "SAR",
    "QAR": "QAR",
    "THB": "THB",
    "฿": "THB",
    "MYR": "MYR",
    "RM": "MYR",
    "₩": "KRW",
    "KRW": "KRW",
}


def get_exchange_rates(
    api_url: str = "https://open.er-api.com/v6/latest/USD",
    timeout: float = 3.0
) -> Dict[str, Decimal]:
    """
    Fetches live exchange rates relative to USD, rebases them to INR (1 Foreign Unit = X INR),
    and returns a dictionary of Decimals. Falls back to DEFAULT_EXCHANGE_RATES on any failure.
    """
    try:
        req = urllib.request.Request(
            api_url,
            headers={"User-Agent": "FintechPipeline/1.0", "Accept": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=timeout) as response:
            if response.status != 200:
                return dict(DEFAULT_EXCHANGE_RATES)
            content = response.read().decode("utf-8")
            data = json.loads(content)
            rates = data.get("rates", {})
            if not rates or "INR" not in rates:
                return dict(DEFAULT_EXCHANGE_RATES)

            usd_to_inr = Decimal(str(rates["INR"]))
            rebased_rates: Dict[str, Decimal] = {"INR": Decimal("1.0")}
            for curr, val in rates.items():
                try:
                    curr_clean = curr.upper().strip()
                    rate_usd = Decimal(str(val))
                    if rate_usd > 0:
                        # 1 curr = (1 / rate_usd) USD = (usd_to_inr / rate_usd) INR
                        rebased_rates[curr_clean] = usd_to_inr / rate_usd
                except Exception:
                    continue
            return rebased_rates
    except Exception as exc:
        logger.debug(f"Live exchange rates fetch skipped/failed: {exc}. Using default fallback.")
        return dict(DEFAULT_EXCHANGE_RATES)


class CurrencyNormaliser:
    """
    Feature 2: Handles live public rate API fetching, fallback rate tables,
    symbol sanitization, and exact INR conversions using Decimal precision.
    """

    def __init__(
        self,
        exchange_rates: Optional[Dict[str, Union[float, Decimal]]] = None,
        auto_fetch_live: bool = False
    ):
        self.rates: Dict[str, Decimal] = {}
        if exchange_rates is not None:
            for k, v in exchange_rates.items():
                self.rates[k.upper().strip()] = Decimal(str(v))
        elif auto_fetch_live:
            self.rates = get_exchange_rates()
        else:
            for k, v in DEFAULT_INR_EXCHANGE_RATES.items():
                self.rates[k.upper()] = Decimal(str(v))

    def sanitize_currency_code(self, raw_currency: Any, raw_amount: Any = None) -> str:
        """Sanitize currency code or infer from symbol in string."""
        if raw_currency is not None:
            clean = str(raw_currency).strip().upper()
            if clean in self.rates:
                return clean
            if clean in CURRENCY_SYMBOLS:
                return CURRENCY_SYMBOLS[clean]

        if isinstance(raw_amount, str):
            amt_str = raw_amount.strip().upper()
            for sym in sorted(CURRENCY_SYMBOLS.keys(), key=len, reverse=True):
                if sym in amt_str:
                    return CURRENCY_SYMBOLS[sym]

        return "INR"

    def parse_amount(self, raw_amount: Any) -> Tuple[Decimal, bool]:
        """
        Parses amount from various formats (float, int, string, prefixed symbols).
        Returns (Decimal amount, is_flagged).
        """
        if raw_amount is None:
            return Decimal("0.00"), True

        if isinstance(raw_amount, (int, float)):
            if math.isnan(raw_amount) or math.isinf(raw_amount):
                return Decimal("0.00"), True
            try:
                amt = Decimal(str(raw_amount))
                return amt, False
            except InvalidOperation:
                return Decimal("0.00"), True

        if isinstance(raw_amount, Decimal):
            return raw_amount, False

        amt_str = str(raw_amount).strip()
        if not amt_str:
            return Decimal("0.00"), True

        is_negative = False
        if amt_str.startswith("-") or (amt_str.startswith("(") and amt_str.endswith(")")):
            is_negative = True

        cleaned_str = amt_str.replace(" ", "")
        cleaned_str = re.sub(r"[^\d.,\-+]", "", cleaned_str)

        if not cleaned_str or cleaned_str in ("-", "+", ".", ","):
            return Decimal("0.00"), True

        if "," in cleaned_str and "." in cleaned_str:
            if cleaned_str.rfind(",") > cleaned_str.rfind("."):
                cleaned_str = cleaned_str.replace(".", "").replace(",", ".")
            else:
                cleaned_str = cleaned_str.replace(",", "")
        elif "," in cleaned_str:
            parts = cleaned_str.split(",")
            if len(parts) == 2 and len(parts[1]) in (1, 2):
                cleaned_str = cleaned_str.replace(",", ".")
            else:
                cleaned_str = cleaned_str.replace(",", "")

        try:
            amt = Decimal(cleaned_str)
            if is_negative and amt > 0:
                amt = -amt
            return amt, False
        except (InvalidOperation, ValueError):
            return Decimal("0.00"), True

    def convert_to_inr(self, amount: Decimal, currency_code: str) -> Tuple[Decimal, bool]:
        """
        Converts amount to INR rounded to 2 decimal places using ROUND_HALF_UP.
        Returns (Decimal amount_inr, is_unrecognized_currency).
        """
        curr = currency_code.upper().strip()
        rate = self.rates.get(curr)
        is_fallback = False
        if rate is None:
            rate = Decimal("1.00")
            is_fallback = True

        converted = (amount * rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        return converted, is_fallback

    def ingest_rates_with_clamping(
        self,
        raw_rates_response: Dict[str, Any],
        max_deviation_pct: float = 0.25
    ) -> Dict[str, Any]:
        """
        Safely ingests external FX rate responses that include unfamiliar fields,
        stale warnings (e.g., 'is_stale': True, extra audit tokens), or extreme deviations.
        Applies baseline reference rate clamping to ensure conversions remain within tolerance.
        Returns a summary report of rates updated and clamped.
        """
        is_stale = bool(
            raw_rates_response.get("is_stale") is True
            or str(raw_rates_response.get("status", "")).lower() in ("stale", "outdated", "deprecated")
            or str(raw_rates_response.get("warning", "")).lower().find("stale") != -1
        )

        rates_data = raw_rates_response.get("rates") if isinstance(raw_rates_response.get("rates"), dict) else raw_rates_response
        clamped: Dict[str, Any] = {}
        updated_count = 0

        for curr, val in rates_data.items():
            if not isinstance(curr, str) or curr.startswith("_") or curr in ("status", "is_stale", "timestamp", "warning", "audit_token", "meta"):
                continue
            curr_clean = curr.upper().strip()
            baseline = DEFAULT_INR_EXCHANGE_RATES.get(curr_clean)

            try:
                rate_val = Decimal(str(val))
                if rate_val <= 0:
                    raise ValueError("Non-positive rate")

                # If feed is flagged stale or deviates significantly from baseline (> max_deviation_pct)
                if baseline is not None:
                    deviation = abs(rate_val - baseline) / baseline
                    if is_stale or deviation > Decimal(str(max_deviation_pct)):
                        # Self-healing clamp to baseline
                        self.rates[curr_clean] = baseline
                        clamped[curr_clean] = {
                            "ingested_rate": float(rate_val),
                            "clamped_baseline": float(baseline),
                            "reason": "stale_feed_or_excessive_deviation" if not is_stale else "stale_flagged_feed",
                        }
                        updated_count += 1
                        continue

                self.rates[curr_clean] = rate_val
                updated_count += 1
            except Exception:
                if baseline is not None:
                    self.rates[curr_clean] = baseline
                    clamped[curr_clean] = {"reason": "malformed_rate_value", "clamped_baseline": float(baseline)}

        return {
            "status": "RATES_INGESTED",
            "is_stale": is_stale,
            "updated_currencies_count": updated_count,
            "clamped_currencies": clamped,
        }


# Backward-compatible alias
CurrencyConverter = CurrencyNormaliser


# =====================================================================
# FEATURE 3: LEDGER RECONCILER & CROSS-SOURCE MATCHING
# =====================================================================

class LedgerReconciler:
    """
    Feature 3: Reconciles cross-source transaction streams, tracks idempotency,
    deduplicates transaction IDs, and detects reconciliation variances.
    """

    def __init__(self, tolerance: Decimal = Decimal("0.01")):
        self.tolerance = tolerance
        self.seen_transaction_ids: Set[str] = set()

    def reset_idempotency_tracker(self):
        """Clears idempotency cache."""
        self.seen_transaction_ids.clear()

    def check_and_track_idempotency(self, transaction_id: str) -> bool:
        """
        Returns True if transaction is new (processed), False if duplicate (skipped).
        """
        if transaction_id in self.seen_transaction_ids:
            return False
        self.seen_transaction_ids.add(transaction_id)
        return True

    def reconcile_records(
        self,
        internal_records: List[Dict[str, Any]],
        external_records: List[Dict[str, Any]],
        id_field: str = "transaction_id",
        amount_field: str = "amount_inr"
    ) -> Dict[str, Any]:
        """
        Reconciles two streams of records, returning matched, unmatched, and variance counts.
        """
        int_map = {r[id_field]: r for r in internal_records if id_field in r}
        ext_map = {r[id_field]: r for r in external_records if id_field in r}

        matched: List[Dict[str, Any]] = []
        variances: List[Dict[str, Any]] = []
        missing_in_external: List[Dict[str, Any]] = []
        missing_in_internal: List[Dict[str, Any]] = []

        all_ids = set(int_map.keys()).union(ext_map.keys())

        for txn_id in all_ids:
            in_int = txn_id in int_map
            in_ext = txn_id in ext_map

            if in_int and in_ext:
                amt_int = Decimal(str(int_map[txn_id].get(amount_field, 0.0)))
                amt_ext = Decimal(str(ext_map[txn_id].get(amount_field, 0.0)))
                diff = abs(amt_int - amt_ext)
                if diff <= self.tolerance:
                    matched.append(int_map[txn_id])
                else:
                    variances.append({
                        "transaction_id": txn_id,
                        "internal_amount": float(amt_int),
                        "external_amount": float(amt_ext),
                        "difference": float(diff),
                    })
            elif in_int:
                missing_in_external.append(int_map[txn_id])
            else:
                missing_in_internal.append(ext_map[txn_id])

        return {
            "matched_count": len(matched),
            "variance_count": len(variances),
            "missing_in_external_count": len(missing_in_external),
            "missing_in_internal_count": len(missing_in_internal),
            "matched": matched,
            "variances": variances,
            "missing_in_external": missing_in_external,
            "missing_in_internal": missing_in_internal,
        }


# =====================================================================
# MERCHANT ENRICHMENT & ENTITY RESOLUTION
# =====================================================================

DEFAULT_CATEGORY_RULES: List[Tuple[str, List[str]]] = [
    ("Entertainment & Subscriptions", [
        r"\bprime\s*(?:video|music|subs?)\b", r"\bnetflix\b", r"\bspotify\b", r"\bprime\b",
        r"\bdisney\b", r"\bhotstar\b", r"\bapple\b", r"\bitunes\b",
        r"\byoutube\b", r"\bgoogle\s*play\b", r"\bhulu\b", r"\bhbo\b",
        r"\bsonyliv\b", r"\bzee5\b", r"\bbookmyshow\b", r"\bplaystation\b",
        r"\bxbox\b", r"\bsteam\b", r"\baudible\b", r"\bpatreon\b"
    ]),
    ("Food & Dining", [
        r"\bswiggy\b", r"\bzomato\b", r"\bstarbucks\b", r"\bmcdonalds?\b", r"\bmcd\b",
        r"\bdominos?\b", r"\bkfc\b", r"\bblinkit\b", r"\bzepto\b", r"\binstamart\b",
        r"\bpizza\s*hut\b", r"\bburger\s*king\b", r"\bdunkin\b", r"\bsubway\b",
        r"\bcafe\s*coffee\s*day\b", r"\bccd\b", r"\bcosta\s*coffee\b", r"\bhaldirams?\b"
    ]),
    ("Travel & Transit", [
        r"\buber\b", r"\bola\b", r"\birctc\b", r"\bindigo\b", r"\bmakemytrip\b",
        r"\bmmt\b", r"\bair\s*india\b", r"\brapido\b", r"\bgoibibo\b", r"\byatra\b",
        r"\bvistara\b", r"\bspicejet\b", r"\blyft\b", r"\bgrab\b", r"\bcleartrip\b",
        r"\bbooking\.com\b", r"\bagoda\b", r"\bairbnb\b", r"\bredbus\b", r"\bmetro\b",
        r"\btaxi\b", r"\bcab\b", r"\bflight\b", r"\btrain\b"
    ]),
    ("Cloud & SaaS", [
        r"\baws\b", r"\bamazon\s*web\s*services\b", r"\bgoogle\s*cloud\b", r"\bgcp\b",
        r"\bazure\b", r"\bmicrosoft\s*365\b", r"\bopenai\b", r"\bchatgpt\b",
        r"\bgithub\b", r"\bvercel\b", r"\bsupabase\b", r"\bdigitalocean\b",
        r"\bheroku\b", r"\bcloudflare\b", r"\bslack\b", r"\bzoom\b",
        r"\bnotion\b", r"\bjira\b", r"\batlassian\b", r"\bsalesforce\b"
    ]),
    ("E-Commerce", [
        r"\bamazon\b", r"\bamzn\b", r"\bflipkart\b", r"\bmyntra\b", r"\bajio\b",
        r"\bmeesho\b", r"\bebay\b", r"\bwalmart\b", r"\baliexpress\b", r"\btata\s*cliq\b",
        r"\bnykaa\b", r"\bshopee\b", r"\btarget\b", r"\betsy\b"
    ]),
]


def load_merchant_categories(filepath: str = "categories.json") -> Any:
    """
    Loads merchant category mappings from a local JSON file if present,
    falling back cleanly to DEFAULT_CATEGORY_RULES.
    """
    if os.path.exists(filepath):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
                if data:
                    return data
        except Exception as exc:
            logger.debug(f"Failed to read {filepath}: {exc}. Using default categories.")
    return DEFAULT_CATEGORY_RULES


class MerchantResolver:
    """Sanitizes merchant names and performs rule-based fuzzy entity resolution."""

    def __init__(self, category_source: Any = None):
        source = category_source if category_source is not None else load_merchant_categories()
        self.compiled_rules: List[Tuple[str, List[re.Pattern]]] = []

        if isinstance(source, dict):
            for category, patterns in source.items():
                compiled = []
                for p in patterns:
                    if isinstance(p, str):
                        if p.startswith(r"\b"):
                            compiled.append(re.compile(p, re.IGNORECASE))
                        else:
                            clean_p = re.sub(r"[\s_\-]+", r"\\s+", re.escape(p.strip()))
                            compiled.append(re.compile(rf"\b{clean_p}\b", re.IGNORECASE))
                    else:
                        compiled.append(p)
                self.compiled_rules.append((category, compiled))
        elif isinstance(source, list):
            for category, patterns in source:
                compiled = []
                for pattern in patterns:
                    if isinstance(pattern, str):
                        if pattern.startswith(r"\b"):
                            compiled.append(re.compile(pattern, re.IGNORECASE))
                        else:
                            clean_p = re.sub(r"[\s_\-]+", r"\\s+", re.escape(pattern.strip()))
                            compiled.append(re.compile(rf"\b{clean_p}\b", re.IGNORECASE))
                    else:
                        compiled.append(pattern)
                self.compiled_rules.append((category, compiled))
        else:
            for category, patterns in DEFAULT_CATEGORY_RULES:
                compiled = [re.compile(p, re.IGNORECASE) for p in patterns]
                self.compiled_rules.append((category, compiled))

    def sanitize_merchant_name(self, raw_merchant: Any) -> str:
        """Sanitizes raw merchant string by stripping noise, punctuation, and extra whitespace."""
        if raw_merchant is None:
            return "Uncategorized"
        
        name = str(raw_merchant).strip()
        if not name or name.lower() in ("none", "null", "n/a", "undefined", "unknown", ""):
            return "Uncategorized"

        name = re.sub(r"[_\-/\\|]", " ", name)
        name = re.sub(r"[^\w\s.]", "", name)
        name = re.sub(r"\s+", " ", name).strip()
        return name if name else "Uncategorized"

    def resolve_category(self, raw_merchant: Any) -> str:
        """Resolves merchant category via regex tokenization and pattern matching."""
        sanitized = self.sanitize_merchant_name(raw_merchant)
        if sanitized == "Uncategorized":
            return "Uncategorized"

        for category, regex_list in self.compiled_rules:
            for regex in regex_list:
                if regex.search(sanitized):
                    return category

        return "Uncategorized"


# =====================================================================
# INGESTION WITH EXPONENTIAL BACKOFF
# =====================================================================

def fetch_transaction_feed(
    api_client: Any = None,
    page: int = 1,
    endpoint: Optional[str] = None,
    max_retries: int = 3,
    base_delay: float = 0.2
) -> List[Dict[str, Any]]:
    """
    Fetches raw transaction feed from api_client or an HTTP endpoint with exponential backoff.
    Guarantees no crashes and returns clean [] on EOF, empty pages, or errors.
    """
    target_endpoint = endpoint or (api_client if isinstance(api_client, str) and api_client.startswith("http") else None)

    attempt = 0
    while attempt < max_retries:
        try:
            response = None

            if target_endpoint:
                url = f"{target_endpoint}?page={page}" if "?" not in target_endpoint else f"{target_endpoint}&page={page}"
                req = urllib.request.Request(
                    url,
                    headers={"User-Agent": "FintechPipeline/1.0", "Accept": "application/json"}
                )
                with urllib.request.urlopen(req, timeout=5.0) as resp:
                    if resp.status == 200:
                        response = json.loads(resp.read().decode("utf-8"))
                    else:
                        raise IOError(f"HTTP Status {resp.status}")
            elif api_client is not None:
                if callable(api_client):
                    try:
                        response = api_client(page=page)
                    except TypeError:
                        response = api_client(page)
                elif hasattr(api_client, "get_transactions"):
                    try:
                        response = api_client.get_transactions(page=page)
                    except TypeError:
                        response = api_client.get_transactions(page)
                elif hasattr(api_client, "fetch"):
                    try:
                        response = api_client.fetch(page=page)
                    except TypeError:
                        response = api_client.fetch(page)
                elif hasattr(api_client, "get"):
                    try:
                        response = api_client.get(page=page)
                    except TypeError:
                        response = api_client.get(page)
                elif hasattr(api_client, "get_feed"):
                    try:
                        response = api_client.get_feed(page=page)
                    except TypeError:
                        response = api_client.get_feed(page)
                else:
                    response = api_client
            else:
                return []

            if response is None:
                return []

            if isinstance(response, dict):
                status_code = response.get("status_code") or response.get("code")
                if status_code and int(status_code) >= 400:
                    raise IOError(f"API returned status {status_code}")

                for key in ("data", "transactions", "results", "items", "records", "payload"):
                    if key in response and isinstance(response[key], list):
                        return [item for item in response[key] if isinstance(item, dict)]
                
                return [response]

            if isinstance(response, list):
                return [item for item in response if isinstance(item, dict)]

            return []

        except Exception as exc:
            attempt += 1
            if attempt >= max_retries:
                logger.warning(f"Exhausted retries ({max_retries}) on page {page}: {exc}")
                return []
            sleep_time = base_delay * (2 ** (attempt - 1))
            time.sleep(sleep_time)

    return []


# =====================================================================
# FIELD ALIAS RESOLUTION & ADVERSARIAL NORMALIZER
# =====================================================================

ID_KEYS = (
    "transaction_id", "txn_id", "id", "tx_id", "reference_id", "uuid",
    "identifier", "ref_no", "ref", "reference_code", "tx_identifier",
    "txid", "trace_id", "record_id", "order_id", "payment_id"
)
AMOUNT_KEYS = (
    "amount", "val", "price", "txn_amount", "transaction_amount", "total",
    "cost", "sum", "transacted_sum", "billed_amount", "amt", "charged_amount",
    "value", "money", "charge", "net_amount"
)
CURRENCY_KEYS = (
    "currency", "curr", "currency_code", "ccy", "unit", "iso_currency",
    "iso_code", "coin", "fx_currency"
)
MERCHANT_KEYS = (
    "merchant", "merchant_name", "merchant_entity", "vendor", "payee",
    "store", "seller", "name", "description", "recipient", "partner",
    "beneficiary", "counterparty", "biller"
)
TIMESTAMP_KEYS = (
    "timestamp", "date", "txn_date", "created_at", "time", "datetime",
    "ts", "transaction_time", "posted_at", "occurred_at", "event_time", "epoch"
)
CONTEXT_KEYS = (
    "notes", "narration", "memo", "description", "details", "info",
    "raw_text", "remark", "summary", "note", "comment"
)


def parse_flexible_timestamp(raw_ts: Any) -> Optional[str]:
    """Parses timestamps across varied formats (epoch ms, epoch seconds, irregular date strings)."""
    if raw_ts is None:
        return None
    
    if isinstance(raw_ts, (int, float)):
        try:
            if raw_ts > 1e11:  # Epoch ms
                return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(raw_ts / 1000.0))
            elif raw_ts > 1e8:  # Epoch seconds
                return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(raw_ts))
        except Exception:
            return None

    ts_str = str(raw_ts).strip()
    if not ts_str or ts_str.lower() in ("none", "null", "n/a", "undefined", ""):
        return None

    # Check standard ISO or date string formats
    for fmt in (
        "%Y-%m-%dT%H:%M:%SZ", "%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%d %H:%M:%S", "%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y",
        "%d/%m/%Y %H:%M:%S", "%Y.%m.%d", "%b %d, %Y", "%B %d, %Y"
    ):
        try:
            parsed = time.strptime(ts_str.split(".")[0].replace("Z", ""), fmt.replace("Z", ""))
            return time.strftime("%Y-%m-%dT%H:%M:%SZ", parsed)
        except ValueError:
            continue

    return None


def _extract_field(record: Dict[str, Any], candidate_keys: Tuple[str, ...]) -> Any:
    """Extracts value for candidate keys case-insensitively, handling nested payloads."""
    for key in candidate_keys:
        if key in record and record[key] is not None:
            return record[key]
    
    lower_map = {k.lower(): v for k, v in record.items() if isinstance(k, str)}
    for key in candidate_keys:
        if key.lower() in lower_map and lower_map[key.lower()] is not None:
            return lower_map[key.lower()]

    for nested_key in ("payload", "data", "attributes", "details", "info", "raw"):
        if nested_key in record and isinstance(record[nested_key], dict):
            val = _extract_field(record[nested_key], candidate_keys)
            if val is not None:
                return val

    return None


class TransactionPipeline:
    """
    Complete production-grade ingestion, normalization, and reconciliation pipeline.
    Coordinates PythonREPLSandbox, CurrencyNormaliser, and LedgerReconciler.
    """

    OUTLIER_INR_THRESHOLD = Decimal("10000000.00")  # ₹10,000,000 extreme outlier threshold

    def __init__(
        self,
        exchange_rates: Optional[Dict[str, Union[float, Decimal]]] = None,
        category_source: Any = None
    ):
        rates = exchange_rates if exchange_rates is not None else get_exchange_rates()
        self.converter = CurrencyNormaliser(rates)
        self.resolver = MerchantResolver(category_source)
        self.reconciler = LedgerReconciler()
        self.sandbox = PythonREPLSandbox()

    @property
    def seen_transaction_ids(self) -> Set[str]:
        return self.reconciler.seen_transaction_ids

    def reset_idempotency_tracker(self):
        """Clears seen transaction IDs for fresh batch processing."""
        self.reconciler.reset_idempotency_tracker()

    def normalize_record(self, raw_record: Any) -> Optional[Dict[str, Any]]:
        """
        Normalizes a single adversarial record into the fixed schema.
        Returns None if record cannot be processed or is a duplicate.
        """
        if not isinstance(raw_record, dict) or not raw_record:
            return None

        is_flagged = False

        # 1. Resolve Transaction ID
        raw_id = _extract_field(raw_record, ID_KEYS)
        if raw_id is not None and str(raw_id).strip():
            txn_id = str(raw_id).strip()
        else:
            payload_str = json.dumps(raw_record, sort_keys=True, default=str)
            txn_id = f"gen_{hashlib.sha256(payload_str.encode('utf-8')).hexdigest()[:16]}"
            is_flagged = True

        # Idempotency check via LedgerReconciler
        if not self.reconciler.check_and_track_idempotency(txn_id):
            return None

        # 2. Extract Amount & Currency via CurrencyNormaliser
        raw_amount = _extract_field(raw_record, AMOUNT_KEYS)
        raw_currency = _extract_field(raw_record, CURRENCY_KEYS)

        amount_dec, amt_parse_err = self.converter.parse_amount(raw_amount)
        if amt_parse_err:
            is_flagged = True

        currency_code = self.converter.sanitize_currency_code(raw_currency, raw_amount)

        amount_inr_dec, is_fallback_curr = self.converter.convert_to_inr(amount_dec, currency_code)
        if is_fallback_curr:
            is_flagged = True

        if amount_dec < 0:
            is_flagged = True
        if amount_inr_dec > self.OUTLIER_INR_THRESHOLD:
            is_flagged = True

        # 3. Extract Merchant & Category
        raw_merchant = _extract_field(raw_record, MERCHANT_KEYS)
        if raw_merchant is None or str(raw_merchant).strip().lower() in ("none", "null", "n/a", "undefined", "unknown", ""):
            raw_context = _extract_field(raw_record, CONTEXT_KEYS)
            if raw_context and isinstance(raw_context, str):
                for km in (
                    "Netflix", "Spotify", "Amazon Prime", "Amazon", "Disney", "Hotstar", "Apple", "YouTube",
                    "Swiggy", "Zomato", "Starbucks", "McDonald's", "McDonalds", "Dominos", "KFC", "Blinkit", "Zepto",
                    "Uber", "Ola", "IRCTC", "IndiGo", "MakeMyTrip", "Rapido", "Air India",
                    "AWS", "Google Cloud", "Azure", "OpenAI", "GitHub", "Vercel", "Supabase", "Slack", "Zoom", "Notion",
                    "Flipkart", "Myntra", "Ajio", "Meesho", "eBay", "Walmart"
                ):
                    if re.search(rf"\b{re.escape(km)}\b", raw_context, re.IGNORECASE):
                        raw_merchant = km
                        break

        if raw_merchant is None or str(raw_merchant).strip().lower() in ("none", "null", "n/a", "undefined", "unknown", ""):
            merchant_name = "Unknown Merchant"
            category = "Uncategorized"
        else:
            merchant_name = self.resolver.sanitize_merchant_name(raw_merchant)
            if merchant_name == "Uncategorized":
                merchant_name = "Unknown Merchant"
                category = "Uncategorized"
            else:
                category = self.resolver.resolve_category(merchant_name)

        # 4. Extract Timestamp with flexible parsing
        raw_timestamp = _extract_field(raw_record, TIMESTAMP_KEYS)
        timestamp = parse_flexible_timestamp(raw_timestamp)

        # 5. Build strict output schema
        return {
            "transaction_id": txn_id,
            "original_amount": float(amount_dec),
            "original_currency": currency_code,
            "amount_inr": float(amount_inr_dec),
            "merchant": merchant_name,
            "category": category,
            "timestamp": timestamp,
            "status": "FLAGGED" if is_flagged else "PROCESSED",
        }

    # Alias for method
    normalize_transaction = normalize_record

    def process_feed(
        self,
        api_client: Any = None,
        start_page: int = 1,
        max_pages: Optional[int] = None,
        endpoint: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Ingests all pages from api_client or endpoint until empty page / EOF and normalizes all records.
        """
        normalized_records: List[Dict[str, Any]] = []
        current_page = start_page

        while True:
            if max_pages is not None and current_page >= (start_page + max_pages):
                break

            batch = fetch_transaction_feed(api_client=api_client, page=current_page, endpoint=endpoint)
            if not batch:
                break

            for item in batch:
                norm = self.normalize_record(item)
                if norm is not None:
                    normalized_records.append(norm)

            current_page += 1

        return normalized_records

    def process_batch(self, raw_records: List[Any]) -> List[Dict[str, Any]]:
        """Processes an in-memory list of raw records."""
        if not isinstance(raw_records, list):
            return []

        results: List[Dict[str, Any]] = []
        for raw in raw_records:
            norm = self.normalize_record(raw)
            if norm is not None:
                results.append(norm)
        return results


# =====================================================================
# ENTERPRISE INTELLIGENCE, RISK & POLICY ENGINES
# =====================================================================

SANCTIONED_WATCHLIST: List[str] = [
    "gambling", "casino", "bet365", "poker", "crypto mixer", "tornado cash",
    "darknet", "silk road", "shell company", "sanctioned", "offshore leak",
    "illicit", "mixer", "tumbler", "unlicensed fx", "banned entity"
]

EXPENSE_POLICY_LIMITS: Dict[str, float] = {
    "Food & Dining": 2500.00,
    "Travel & Transit": 15000.00,
    "Transportation": 15000.00,
    "Entertainment & Subscriptions": 5000.00,
    "DEFAULT": 50000.00,
}

GST_ELIGIBLE_CATEGORIES: Dict[str, float] = {
    "Cloud & SaaS": 0.18,
    "Travel & Transit": 0.18,
    "Transportation": 0.18,
    "Food & Dining": 0.18,
    "General Expenses": 0.18,
    "Entertainment & Subscriptions": 0.18,
    "E-Commerce": 0.18,
    "Uncategorized": 0.18,
}


def extract_record_datetime(ts_val: Any) -> Optional[datetime]:
    """Helper to convert timestamp to datetime object."""
    if not ts_val:
        return None
    if isinstance(ts_val, (int, float)):
        sec = float(ts_val / 1000.0 if ts_val > 1e11 else ts_val)
        return datetime.fromtimestamp(sec, timezone.utc)
    
    ts_str = str(ts_val).strip()
    clean_str = ts_str.replace("Z", "+00:00").replace("/", "-")
    for fmt in (
        "%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%d %H:%M:%S%z", "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d", "%d-%m-%Y"
    ):
        try:
            dt = datetime.strptime(clean_str.split(".")[0], fmt)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt
        except ValueError:
            continue
    return None


def calculate_spending_velocity(records: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Feature 1: Calculates daily burn rate (INR/day) and projects month-end cumulative spend.
    """
    if not records:
        return {
            "total_spend_inr": 0.0,
            "active_days_count": 0,
            "daily_burn_rate_inr": 0.0,
            "projected_month_end_spend_inr": 0.0,
            "annualized_run_rate_inr": 0.0,
        }

    total_inr = sum(Decimal(str(r.get("amount_inr", 0.0))) for r in records)
    
    # Extract unique active dates
    active_dates: Set[str] = set()
    for r in records:
        ts = str(r.get("timestamp") or "")
        if len(ts) >= 10 and ts[:10].replace("-", "").isdigit():
            active_dates.add(ts[:10])

    days_count = max(len(active_dates), 1)
    burn_rate = (total_inr / Decimal(str(days_count))).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    projected_month_end = (burn_rate * Decimal("30")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    annualized = (burn_rate * Decimal("365")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    return {
        "total_spend_inr": float(total_inr),
        "active_days_count": days_count,
        "daily_burn_rate_inr": float(burn_rate),
        "projected_month_end_spend_inr": float(projected_month_end),
        "annualized_run_rate_inr": float(annualized),
    }


def calculate_category_breakdown(records: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Feature 2: Aggregates total expenses by category into numerical sums and percentage shares.
    """
    if not records:
        return {"total_spend_inr": 0.0, "categories": []}

    total_inr = sum(Decimal(str(r.get("amount_inr", 0.0))) for r in records)
    cat_sums: Dict[str, Decimal] = {}
    cat_counts: Dict[str, int] = {}

    for r in records:
        cat = str(r.get("category") or "Uncategorized").strip()
        amt = Decimal(str(r.get("amount_inr", 0.0)))
        cat_sums[cat] = cat_sums.get(cat, Decimal("0.00")) + amt
        cat_counts[cat] = cat_counts.get(cat, 0) + 1

    categories_list = []
    for cat, val in sorted(cat_sums.items(), key=lambda x: x[1], reverse=True):
        share_pct = float((val / total_inr * Decimal("100")).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)) if total_inr > 0 else 0.0
        categories_list.append({
            "category": cat,
            "total_inr": float(val),
            "count": cat_counts[cat],
            "percentage_share": share_pct,
        })

    return {
        "total_spend_inr": float(total_inr),
        "categories": categories_list,
    }


def calculate_gst_tax_reserve(records: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Feature 17: Computes 18% GST liability estimations on eligible business expense categories.
    """
    total_eligible_spend = Decimal("0.00")
    category_reserves: Dict[str, float] = {}

    for r in records:
        cat = str(r.get("category") or "Uncategorized").strip()
        amt = Decimal(str(r.get("amount_inr", 0.0)))
        rate = Decimal(str(GST_ELIGIBLE_CATEGORIES.get(cat, 0.18)))
        
        reserve_amt = (amt * rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        total_eligible_spend += amt
        category_reserves[cat] = float(Decimal(str(category_reserves.get(cat, 0.0))) + reserve_amt)

    total_gst_reserve = (total_eligible_spend * Decimal("0.18")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    return {
        "standard_gst_rate": "18%",
        "total_eligible_spend_inr": float(total_eligible_spend),
        "total_gst_reserve_inr": float(total_gst_reserve),
        "breakdown_by_category": category_reserves,
    }


def scan_risk_and_policy_anomalies(records: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Executes comprehensive fraud, risk, and policy violation detection:
      - Feature 8: Duplicate Charge Identifier (same merchant & amount within 24h)
      - Feature 9: Velocity Anomaly Trigger (>= 3 transactions in 10-minute window)
      - Feature 10: Suspicious After-Hours Ingestion (8:00 PM - 7:00 AM)
      - Feature 11: Sanctioned / High-Risk Merchant Filter
      - Feature 21: Expense Policy Violation Scanner (category caps)
    """
    duplicates: List[Dict[str, Any]] = []
    velocity_anomalies: List[Dict[str, Any]] = []
    after_hours: List[Dict[str, Any]] = []
    sanctioned_alerts: List[Dict[str, Any]] = []
    policy_violations: List[Dict[str, Any]] = []

    # Sort records by epoch time for accurate window scanning
    parsed_records = []
    for r in records:
        dt = extract_record_datetime(r.get("timestamp"))
        ep = dt.timestamp() if dt else None
        hr = dt.hour if dt else None
        parsed_records.append({**r, "_epoch": ep, "_hour": hr, "_dt": dt})

    # Sort by epoch where available
    sorted_records = sorted(
        parsed_records,
        key=lambda x: x["_epoch"] if x["_epoch"] is not None else 0.0
    )

    n = len(sorted_records)

    for i in range(n):
        curr = sorted_records[i]
        curr_id = curr.get("transaction_id", f"txn_{i}")
        curr_amt = float(curr.get("amount_inr", 0.0))
        curr_merchant = str(curr.get("merchant", "")).strip()
        curr_cat = str(curr.get("category", "DEFAULT")).strip()
        curr_ep = curr.get("_epoch")
        curr_hr = curr.get("_hour")

        # Feature 11: Sanctioned / Watchlist Merchant Check
        for keyword in SANCTIONED_WATCHLIST:
            if re.search(rf"\b{re.escape(keyword)}\b", curr_merchant, re.IGNORECASE):
                sanctioned_alerts.append({
                    "transaction_id": curr_id,
                    "merchant": curr_merchant,
                    "amount_inr": curr_amt,
                    "matched_keyword": keyword,
                    "risk_level": "CRITICAL",
                    "reason": f"Merchant '{curr_merchant}' matches prohibited watchlist keyword '{keyword}'"
                })
                break

        # Feature 21: Policy Violation Check
        limit = EXPENSE_POLICY_LIMITS.get(curr_cat, EXPENSE_POLICY_LIMITS["DEFAULT"])
        if curr_amt > limit:
            policy_violations.append({
                "transaction_id": curr_id,
                "merchant": curr_merchant,
                "category": curr_cat,
                "amount_inr": curr_amt,
                "spending_cap_inr": limit,
                "excess_inr": round(curr_amt - limit, 2),
                "reason": f"Amount ₹{curr_amt:,.2f} exceeds policy spending cap ₹{limit:,.2f} for '{curr_cat}'"
            })

        # Feature 10: After-Hours Check (8 PM to 7 AM local / UTC)
        if curr_hr is not None:
            if curr_hr >= 20 or curr_hr < 7:
                after_hours.append({
                    "transaction_id": curr_id,
                    "merchant": curr_merchant,
                    "amount_inr": curr_amt,
                    "timestamp": curr.get("timestamp"),
                    "hour": curr_hr,
                    "reason": f"Transaction recorded at {curr_hr:02d}:00 (outside standard 07:00-20:00 operating window)"
                })

        # Timestamp-dependent checks
        if curr_ep is not None:
            # Feature 8: Duplicate Check (Within 24 hours = 86400s)
            for j in range(i + 1, n):
                nxt = sorted_records[j]
                nxt_ep = nxt.get("_epoch")
                if nxt_ep is not None and (nxt_ep - curr_ep) > 86400:
                    break  # Beyond 24h window
                
                nxt_merchant = str(nxt.get("merchant", "")).strip()
                nxt_amt = float(nxt.get("amount_inr", 0.0))
                
                if curr_merchant.lower() == nxt_merchant.lower() and abs(curr_amt - nxt_amt) < 0.01:
                    duplicates.append({
                        "primary_transaction_id": curr_id,
                        "duplicate_transaction_id": nxt.get("transaction_id", f"txn_{j}"),
                        "merchant": curr_merchant,
                        "amount_inr": curr_amt,
                        "time_difference_minutes": round((nxt_ep - curr_ep) / 60.0, 1) if nxt_ep else 0.0,
                        "flag": "IS_DUPLICATE",
                        "reason": f"Identical charge ₹{curr_amt:,.2f} to '{curr_merchant}' within 24h window"
                    })

            # Feature 9: Velocity Anomaly (>= 3 transactions in 10-minute window = 600s)
            window_txns = [curr_id]
            for k in range(i + 1, n):
                w_nxt = sorted_records[k]
                w_ep = w_nxt.get("_epoch")
                if w_ep is not None and (w_ep - curr_ep) <= 600:
                    window_txns.append(w_nxt.get("transaction_id", f"txn_{k}"))
                elif w_ep is not None and (w_ep - curr_ep) > 600:
                    break

            if len(window_txns) >= 3:
                # Avoid duplicate clusters
                cluster_key = "-".join(sorted(window_txns[:3]))
                if not any(v.get("cluster_key") == cluster_key for v in velocity_anomalies):
                    velocity_anomalies.append({
                        "cluster_key": cluster_key,
                        "transaction_count": len(window_txns),
                        "transaction_ids": window_txns,
                        "window_duration_seconds": 600,
                        "reason": f"High transaction velocity detected: {len(window_txns)} transactions occurred within 10 minutes"
                    })

            # Feature 8: Duplicate Check (Within 24 hours = 86400s)
            for j in range(i + 1, n):
                nxt = sorted_records[j]
                nxt_ep = nxt.get("_epoch")
                if nxt_ep is not None and (nxt_ep - curr_ep) > 86400:
                    break  # Beyond 24h window
                
                nxt_merchant = str(nxt.get("merchant", "")).strip()
                nxt_amt = float(nxt.get("amount_inr", 0.0))
                
                if curr_merchant.lower() == nxt_merchant.lower() and abs(curr_amt - nxt_amt) < 0.01:
                    duplicates.append({
                        "primary_transaction_id": curr_id,
                        "duplicate_transaction_id": nxt.get("transaction_id", f"txn_{j}"),
                        "merchant": curr_merchant,
                        "amount_inr": curr_amt,
                        "time_difference_minutes": round((nxt_ep - curr_ep) / 60.0, 1) if nxt_ep else 0.0,
                        "flag": "IS_DUPLICATE",
                        "reason": f"Identical charge ₹{curr_amt:,.2f} to '{curr_merchant}' within 24h window"
                    })

            # Feature 9: Velocity Anomaly (>= 3 transactions in 10-minute window = 600s)
            window_txns = [curr_id]
            for k in range(i + 1, n):
                w_nxt = sorted_records[k]
                w_ep = w_nxt.get("_epoch")
                if w_ep is not None and (w_ep - curr_ep) <= 600:
                    window_txns.append(w_nxt.get("transaction_id", f"txn_{k}"))
                elif w_ep is not None and (w_ep - curr_ep) > 600:
                    break

            if len(window_txns) >= 3:
                # Avoid duplicate clusters
                cluster_key = "-".join(sorted(window_txns[:3]))
                if not any(v.get("cluster_key") == cluster_key for v in velocity_anomalies):
                    velocity_anomalies.append({
                        "cluster_key": cluster_key,
                        "transaction_count": len(window_txns),
                        "transaction_ids": window_txns,
                        "window_duration_seconds": 600,
                        "reason": f"High transaction velocity detected: {len(window_txns)} transactions occurred within 10 minutes"
                    })

    return {
        "risk_score": len(duplicates) * 15 + len(velocity_anomalies) * 25 + len(sanctioned_alerts) * 40 + len(policy_violations) * 10,
        "total_alerts_count": len(duplicates) + len(velocity_anomalies) + len(after_hours) + len(sanctioned_alerts) + len(policy_violations),
        "duplicate_charges": duplicates,
        "velocity_anomalies": velocity_anomalies,
        "after_hours_charges": after_hours,
        "sanctioned_merchant_alerts": sanctioned_alerts,
        "policy_violations": policy_violations,
    }


# =====================================================================
# PIPELINE HELPER FUNCTIONS
# =====================================================================

_default_pipeline: Optional[TransactionPipeline] = None

def get_default_pipeline() -> TransactionPipeline:
    """Returns or creates the default singleton TransactionPipeline instance."""
    global _default_pipeline
    if _default_pipeline is None:
        _default_pipeline = TransactionPipeline()
    return _default_pipeline

def normalize_transaction(
    raw_record: Any,
    pipeline: Optional[TransactionPipeline] = None
) -> Optional[Dict[str, Any]]:
    """
    Top-level helper integrating currency and merchant enrichment to normalize a transaction.
    """
    active_pipeline = pipeline if pipeline is not None else get_default_pipeline()
    return active_pipeline.normalize_record(raw_record)



# =====================================================================
# SELF-CONTAINED BENCHMARK RUNNER & VALIDATION
# =====================================================================

if __name__ == "__main__":
    print("=== Running Fintech Pipeline Defensive Benchmark Suite ===")
    from test_pipeline import (
        TestCurrencyConverter,
        TestMerchantResolver,
        TestIngestionAndPagination,
        TestPipelineReconciliationAndEdgeCases,
        TestDataSourcesIntegration,
        TestPurchasedFeaturesAudit,
    )
    suite = unittest.TestSuite()
    for test_class in [
        TestCurrencyConverter,
        TestMerchantResolver,
        TestIngestionAndPagination,
        TestPipelineReconciliationAndEdgeCases,
        TestDataSourcesIntegration,
        TestPurchasedFeaturesAudit,
    ]:
        tests = unittest.defaultTestLoader.loadTestsFromTestCase(test_class)
        suite.addTests(tests)

    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)
