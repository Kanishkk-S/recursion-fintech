"""
Persistent SQL Database Layer for FinTech Autonomous Agent Transactions.
Supports SQLite storage, Schema Enforcement, CRUD operations, and Initial Feed Seeding.
"""

from datetime import datetime, timezone
import json
import logging
import os
import sqlite3
from typing import Any, Dict, List, Optional

logger = logging.getLogger("FinTechDatabase")

if os.environ.get("VERCEL"):
    DEFAULT_DB_PATH = "/tmp/transactions.db"
else:
    DEFAULT_DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "transactions.db")


def get_connection(db_path: str = DEFAULT_DB_PATH) -> sqlite3.Connection:
    """Returns a SQLite connection with dict-like row access."""
    # Ensure parent dir exists if using custom path
    parent_dir = os.path.dirname(db_path)
    if parent_dir and not os.path.exists(parent_dir):
        try:
            os.makedirs(parent_dir, exist_ok=True)
        except Exception:
            pass
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


def init_db(db_path: str = DEFAULT_DB_PATH):
    """Initializes the transactions table and schema."""
    conn = get_connection(db_path)
    try:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS transactions (
                transaction_id TEXT PRIMARY KEY,
                amount_inr REAL NOT NULL,
                currency TEXT NOT NULL,
                merchant TEXT NOT NULL,
                category TEXT NOT NULL,
                original_amount REAL NOT NULL,
                original_currency TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                status TEXT DEFAULT 'PROCESSED',
                created_at TEXT NOT NULL
            )
        """)
        conn.commit()
    finally:
        conn.close()


def insert_transaction(record: Dict[str, Any], db_path: str = DEFAULT_DB_PATH) -> Dict[str, Any]:
    """
    Inserts or updates a normalized transaction conforming to the strict schema:
    {
        "transaction_id": str,
        "amount_inr": float,
        "currency": str,
        "merchant": str,
        "category": str,
        "original_amount": float,
        "original_currency": str,
        "timestamp": str
    }
    """
    init_db(db_path)
    
    tx_id = str(record.get("transaction_id", "")).strip()
    if not tx_id:
        raise ValueError("transaction_id is required")

    amount_inr = float(record.get("amount_inr", 0.0))
    currency = str(record.get("currency") or record.get("original_currency") or "INR").upper().strip()
    merchant = str(record.get("merchant") or "Unknown Merchant").strip()
    category = str(record.get("category") or "Uncategorized").strip()
    original_amount = float(record.get("original_amount", amount_inr))
    original_currency = str(record.get("original_currency") or currency).upper().strip()
    timestamp = str(record.get("timestamp") or datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"))
    status = str(record.get("status", "PROCESSED"))
    created_at = str(record.get("created_at") or datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"))

    clean_record = {
        "transaction_id": tx_id,
        "amount_inr": amount_inr,
        "currency": currency,
        "merchant": merchant,
        "category": category,
        "original_amount": original_amount,
        "original_currency": original_currency,
        "timestamp": timestamp,
        "status": status,
        "created_at": created_at,
    }

    conn = get_connection(db_path)
    try:
        conn.execute("""
            INSERT INTO transactions (
                transaction_id, amount_inr, currency, merchant, category,
                original_amount, original_currency, timestamp, status, created_at
            ) VALUES (
                :transaction_id, :amount_inr, :currency, :merchant, :category,
                :original_amount, :original_currency, :timestamp, :status, :created_at
            )
            ON CONFLICT(transaction_id) DO UPDATE SET
                amount_inr=excluded.amount_inr,
                currency=excluded.currency,
                merchant=excluded.merchant,
                category=excluded.category,
                original_amount=excluded.original_amount,
                original_currency=excluded.original_currency,
                timestamp=excluded.timestamp,
                status=excluded.status
        """, clean_record)
        conn.commit()
    finally:
        conn.close()

    return clean_record


def list_transactions(limit: int = 200, db_path: str = DEFAULT_DB_PATH) -> List[Dict[str, Any]]:
    """Returns all stored transactions ordered by timestamp descending."""
    init_db(db_path)
    conn = get_connection(db_path)
    try:
        cursor = conn.execute("""
            SELECT transaction_id, amount_inr, currency, merchant, category,
                   original_amount, original_currency, timestamp, status, created_at
            FROM transactions
            ORDER BY timestamp DESC, created_at DESC
            LIMIT ?
        """, (limit,))
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()


def get_transaction(tx_id: str, db_path: str = DEFAULT_DB_PATH) -> Optional[Dict[str, Any]]:
    """Fetches a single transaction by ID."""
    init_db(db_path)
    conn = get_connection(db_path)
    try:
        cursor = conn.execute("""
            SELECT transaction_id, amount_inr, currency, merchant, category,
                   original_amount, original_currency, timestamp, status, created_at
            FROM transactions
            WHERE transaction_id = ?
        """, (tx_id,))
        row = cursor.fetchone()
        return dict(row) if row else None
    finally:
        conn.close()


def update_transaction(tx_id: str, updates: Dict[str, Any], db_path: str = DEFAULT_DB_PATH) -> Optional[Dict[str, Any]]:
    """Updates an existing transaction by transaction_id."""
    existing = get_transaction(tx_id, db_path)
    if not existing:
        return None

    merged = dict(existing)
    for k, v in updates.items():
        if k in merged and k != "transaction_id":
            merged[k] = v

    conn = get_connection(db_path)
    try:
        conn.execute("""
            UPDATE transactions
            SET amount_inr = :amount_inr,
                currency = :currency,
                merchant = :merchant,
                category = :category,
                original_amount = :original_amount,
                original_currency = :original_currency,
                timestamp = :timestamp,
                status = :status
            WHERE transaction_id = :transaction_id
        """, merged)
        conn.commit()
    finally:
        conn.close()

    return get_transaction(tx_id, db_path)


def delete_transaction(tx_id: str, db_path: str = DEFAULT_DB_PATH) -> bool:
    """Deletes a transaction by transaction_id."""
    init_db(db_path)
    conn = get_connection(db_path)
    try:
        cursor = conn.execute("DELETE FROM transactions WHERE transaction_id = ?", (tx_id,))
        conn.commit()
        return cursor.rowcount > 0
    finally:
        conn.close()


def seed_initial_feed(db_path: str = DEFAULT_DB_PATH, force: bool = False):
    """Seeds the database with initial multi-currency transactions if empty."""
    init_db(db_path)
    conn = get_connection(db_path)
    try:
        cursor = conn.execute("SELECT COUNT(*) as cnt FROM transactions")
        count = cursor.fetchone()["cnt"]
        if count > 0 and not force:
            return
    finally:
        conn.close()

    initial_records = [
        {
            "transaction_id": "SEED_TX_001",
            "amount_inr": 20874.17,
            "currency": "USD",
            "merchant": "Amazon US Prime",
            "category": "Entertainment & Subscriptions",
            "original_amount": 249.99,
            "original_currency": "USD",
            "timestamp": "2026-09-01T10:00:00Z",
            "status": "PROCESSED",
        },
        {
            "transaction_id": "SEED_TX_002",
            "amount_inr": 4129.13,
            "currency": "EUR",
            "merchant": "Swiggy Bangalore Hub",
            "category": "Food & Dining",
            "original_amount": 45.50,
            "original_currency": "EUR",
            "timestamp": "2026-09-01T13:30:00Z",
            "status": "PROCESSED",
        },
        {
            "transaction_id": "SEED_TX_003",
            "amount_inr": 1328.13,
            "currency": "GBP",
            "merchant": "Netflix UK Subscription",
            "category": "Entertainment & Subscriptions",
            "original_amount": 12.50,
            "original_currency": "GBP",
            "timestamp": "2026-09-01T15:45:00Z",
            "status": "PROCESSED",
        },
        {
            "transaction_id": "SEED_TX_004",
            "amount_inr": 3411.00,
            "currency": "AED",
            "merchant": "Uber Transit Hub",
            "category": "Travel & Transit",
            "original_amount": 150.00,
            "original_currency": "AED",
            "timestamp": "2026-09-01T18:20:00Z",
            "status": "PROCESSED",
        },
        {
            "transaction_id": "SEED_TX_005",
            "amount_inr": 10020.00,
            "currency": "USD",
            "merchant": "AWS Cloud Infrastructure",
            "category": "Cloud & SaaS",
            "original_amount": 120.00,
            "original_currency": "USD",
            "timestamp": "2026-09-02T08:00:00Z",
            "status": "PROCESSED",
        },
    ]

    for rec in initial_records:
        insert_transaction(rec, db_path=db_path)
    logger.info(f"Database seeded with {len(initial_records)} initial transactions.")


# Auto-initialize and seed on module import
init_db()
seed_initial_feed()

# Alias for serverless import compatibility
seed_feed = seed_initial_feed
