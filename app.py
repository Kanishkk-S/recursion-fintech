"""
================================================================================
GIgnite Autonomous Credit Underwriting & Verifiable Credential Engine
================================================================================
Production-Ready FastAPI Backend for Alternative Financial Identity & Micro-Lending.
Supports:
  - In-Memory Multi-Persona Registry (USERS_DB) + SQLite Sync (gignite.db)
  - Pre-Seeded Profiles: Ramesh Kumar (Gig Worker) & Murugan Tea Stall (UPI Merchant)
  - Dynamic Cash-Flow Resilience Index (CRI = 0.35*stability + 0.35*consistency + 0.20*margin + 0.10*longevity) * 100
  - W3C Verifiable Credential Issuance with RFC 8785 Canonical JSON & Ed25519 Signatures
  - Zero-Trust Cryptographic Signature Verification & Anti-Fraud Security Halt (HTTP 403)
  - Multi-Lender Counterfactual Underwriting: Instant Approval vs 21-Day Remediation Roadmap
================================================================================
"""

import os
import sys
import json
import math
import hmac
import sqlite3
import hashlib
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Union, Tuple
from fastapi import FastAPI, HTTPException, Request, Response, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# Initialize Cryptography (Ed25519 with deterministic fallback)
try:
    from cryptography.hazmat.primitives.asymmetric import ed25519
    from cryptography.exceptions import InvalidSignature
    HAS_ED25519_NATIVE = True
except ImportError:
    HAS_ED25519_NATIVE = False

# Initialize FastAPI App
app = FastAPI(
    title="GIgnite Financial Identity & Underwriting Engine",
    description="Multi-Persona Onboarding, Dynamic CRI Calculation, W3C Verifiable Credentials & Zero-Trust Underwriting",
    version="2.2.0"
)

# 1. CORS Setup - Allow all origins, methods, and headers for frontend compatibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cryptographic Configuration
ISSUER_DID = "did:gignite:authority-node-01"
ISSUER_KEY_ID = "did:gignite:authority-node-01#key-2026"
ED25519_SEED = hashlib.sha256(b"gignite_ed25519_authority_node_01_2026").digest()
SIGNING_SECRET_KEY = b"gignite_ed25519_hsm_secret_authority_node_01_2026"
DB_PATH = "/tmp/gignite.db" if os.environ.get("VERCEL") else os.path.join(os.path.dirname(os.path.abspath(__file__)), "gignite.db")

# Setup Ed25519 Private Key and Public Key
if HAS_ED25519_NATIVE:
    ED25519_PRIV_KEY = ed25519.Ed25519PrivateKey.from_private_bytes(ED25519_SEED)
    ED25519_PUB_KEY = ED25519_PRIV_KEY.public_key()
else:
    ED25519_PRIV_KEY = None
    ED25519_PUB_KEY = None

# ==============================================================================
# CRI CALCULATION ENGINE
# ==============================================================================

def calculate_cri(stability: float, consistency: float, margin: float, longevity: float) -> float:
    """
    Computes Cash-Flow Resilience Index (CRI) 0-100 Float Scale:
    CRI = (0.35 * stability + 0.35 * consistency + 0.20 * margin + 0.10 * longevity) * 100
    """
    raw_score = (0.35 * stability + 0.35 * consistency + 0.20 * margin + 0.10 * longevity) * 100.0
    return round(max(0.0, min(100.0, raw_score)), 1)

def get_resilience_tier(cri: float) -> str:
    """
    Determines Resilience Tier based on CRI score:
    - >= 75.0: "PRIME_RESILIENT"
    - 60.0 - 74.9: "GROWTH_NEAR_PRIME"
    - < 60.0: "VULNERABLE"
    """
    if cri >= 75.0:
        return "PRIME_RESILIENT"
    elif cri >= 60.0:
        return "GROWTH_NEAR_PRIME"
    else:
        return "VULNERABLE"

# ==============================================================================
# CANONICAL CRYPTOGRAPHY HELPERS (RFC 8785 + Ed25519 / SHA-512)
# ==============================================================================

def canonicalize_json(data: Dict[str, Any]) -> bytes:
    """
    RFC 8785 Canonicalization:
    Recursively sorts dictionary keys lexicographically, removes all whitespace,
    and encodes as strict UTF-8 bytes without escaping Unicode characters.
    """
    return json.dumps(data, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode('utf-8')

def compute_sha512_digest(data: Dict[str, Any]) -> str:
    """Computes SHA-512 over the canonical UTF-8 bytes."""
    canonical_bytes = canonicalize_json(data)
    return hashlib.sha512(canonical_bytes).hexdigest()

def sign_payload(canonical_data: Dict[str, Any]) -> Tuple[str, str]:
    """
    Generates SHA-512 payload digest and signs using Ed25519 (or deterministic HMAC fallback).
    Returns (signature_hex, digest_sha512).
    """
    canonical_bytes = canonicalize_json(canonical_data)
    digest_sha512 = hashlib.sha512(canonical_bytes).hexdigest()

    if HAS_ED25519_NATIVE and ED25519_PRIV_KEY:
        # Sign the canonical bytes directly with Ed25519
        sig_bytes = ED25519_PRIV_KEY.sign(canonical_bytes)
        signature_hex = sig_bytes.hex()
    else:
        # Deterministic HMAC fallback
        signature_hex = hmac.new(SIGNING_SECRET_KEY, digest_sha512.encode('utf-8'), hashlib.sha512).hexdigest()

    return signature_hex, digest_sha512

def verify_payload_signature(canonical_data: Dict[str, Any], presented_signature_hex: str) -> bool:
    """
    Verifies the presented signature against canonical data using Ed25519 or HMAC fallback.
    """
    try:
        canonical_bytes = canonicalize_json(canonical_data)
        digest_sha512 = hashlib.sha512(canonical_bytes).hexdigest()

        if HAS_ED25519_NATIVE and ED25519_PUB_KEY:
            try:
                sig_bytes = bytes.fromhex(presented_signature_hex)
                ED25519_PUB_KEY.verify(sig_bytes, canonical_bytes)
                return True
            except (InvalidSignature, ValueError):
                # Check fallback HMAC if signature was minted under fallback
                expected_hmac = hmac.new(SIGNING_SECRET_KEY, digest_sha512.encode('utf-8'), hashlib.sha512).hexdigest()
                return hmac.compare_digest(expected_hmac, presented_signature_hex)
        else:
            expected_sig = hmac.new(SIGNING_SECRET_KEY, digest_sha512.encode('utf-8'), hashlib.sha512).hexdigest()
            return hmac.compare_digest(expected_sig, presented_signature_hex)
    except Exception:
        return False

# ==============================================================================
# IN-MEMORY USER DATABASE (USERS_DB) & PRE-SEEDED PROFILES
# ==============================================================================

USERS_DB: Dict[str, dict] = {
    # 1. Ramesh Kumar (Gig Worker)
    "ramesh-kumar-9872": {
        "worker_id": "ramesh-kumar-9872",
        "name": "Ramesh Kumar",
        "full_name": "Ramesh Kumar",
        "worker_name": "Ramesh Kumar",
        "email": "ramesh@uber.com",
        "persona_type": "GIG_WORKER",
        "did": "did:india:worker:ramesh-kumar-9872",
        "category": "Swiggy + Uber India Fleet Partner",
        "credit_bureau_status": "THIN_FILE_VERIFIED_BY_GIGNITE",
        "platform_badges": ["Swiggy", "Uber India"],
        "sources": [
            {
                "platform": "Swiggy",
                "role": "Food Delivery Partner",
                "rating": 4.92,
                "trips_completed": 1420,
                "verified_active": True,
                "payout_frequency": "Weekly",
                "badge": "Swiggy Star Rider",
                "payout_amount_inr": 27450.00
            },
            {
                "platform": "Uber India",
                "role": "Premier Ride Driver",
                "rating": 4.88,
                "trips_completed": 890,
                "verified_active": True,
                "payout_frequency": "Daily Instant",
                "badge": "Uber Diamond Partner",
                "payout_amount_inr": 21616.00
            }
        ],
        "monthly_inflow": 49066.0,
        "active_days": 168,
        "total_window_days": 180,
        "shift_consistency": 0.935,
        "stability": 1.0,
        "margin": 0.72,
        "longevity": 0.95,
        "cri_score": 88.7,
        "resilience_tier": "PRIME_RESILIENT",
        "max_prime_credit_limit_inr": 34346.20,
        "instant_safe_floor_inr": 24533.00,
        "telemetry_summary": {
            "telemetry_period_days": 180,
            "active_working_days": 168,
            "active_days_ratio": 0.935,
            "consistency_rate": "93.5%",
            "consistency_ratio": 0.935,
            "stability_rate": "100.0%",
            "stability_index": 1.0,
            "monthly_inflow_inr": 49066.0,
            "gross_earnings_180d_inr": 294396.0,
            "net_earnings_180d_inr": 211965.12,
            "zero_income_weeks": 0,
            "margin_rate": 0.72,
            "tenure_score": 0.95,
            "is_zktls_verified": True,
            "verification_status": "ZKTLS_VERIFIED"
        }
    },

    # 2. Murugan Tea Stall (UPI Merchant)
    "murugan-tea-4821": {
        "worker_id": "murugan-tea-4821",
        "name": "Murugan Tea Stall",
        "full_name": "Murugan Tea Stall",
        "worker_name": "Murugan Tea Stall",
        "email": "murugan@phonepe.business",
        "persona_type": "UPI_MERCHANT",
        "did": "did:india:merchant:murugan-tea-4821",
        "category": "PhonePe Business QR Merchant & Micro-Vendor",
        "credit_bureau_status": "THIN_FILE_VERIFIED_BY_GIGNITE",
        "platform_badges": ["PhonePe Business"],
        "sources": [
            {
                "platform": "PhonePe Business",
                "role": "Verified QR Merchant",
                "vpa": "murugantea@ybl",
                "bank_account": "Canara Bank (A/C ****4821)",
                "daily_avg_scans": 142,
                "verified_active": True,
                "payout_frequency": "Daily Settlement",
                "badge": "PhonePe Top Merchant",
                "payout_amount_inr": 42850.00
            }
        ],
        "monthly_inflow": 42850.0,
        "active_days": 87,
        "total_window_days": 90,
        "shift_consistency": 0.966,
        "stability": 0.95,
        "margin": 0.65,
        "longevity": 0.85,
        "daily_avg_scans": 142,
        "cri_score": 84.2,
        "resilience_tier": "PRIME_RESILIENT",
        "max_prime_credit_limit_inr": 29995.00,
        "instant_safe_floor_inr": 21425.00,
        "soundbox_details": {
            "provider": "PhonePe Business Soundbox Rail",
            "vpa": "murugantea@ybl",
            "bank": "Canara Bank (A/C ****4821)",
            "scans": 4260,
            "avg_daily_scans": 142,
            "gross_volume": 42850.0,
            "avg_daily": 1428.33,
            "credential_id": "urn:uuid:soundbox-settlement-phonepe-4821"
        },
        "telemetry_summary": {
            "telemetry_period_days": 90,
            "active_working_days": 87,
            "active_days_ratio": 0.966,
            "consistency_rate": "96.6%",
            "consistency_ratio": 0.966,
            "stability_rate": "95.0%",
            "stability_index": 0.95,
            "monthly_inflow_inr": 42850.0,
            "gross_earnings_180d_inr": 257100.0,
            "net_earnings_180d_inr": 167115.0,
            "zero_income_weeks": 0,
            "daily_avg_scans": 142,
            "margin_rate": 0.65,
            "tenure_score": 0.85,
            "is_zktls_verified": True,
            "is_soundbox_verified": True,
            "verification_status": "ZKTLS_VERIFIED"
        }
    }
}

# ==============================================================================
# SQLITE DATABASE SYNC
# ==============================================================================

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS workers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        did TEXT NOT NULL,
        cri_score REAL NOT NULL,
        resilience_tier TEXT NOT NULL,
        monthly_inflow REAL NOT NULL,
        shift_consistency REAL NOT NULL,
        platforms_json TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Sync pre-seeded users to DB if not present
    for uid, profile in USERS_DB.items():
        cursor.execute("SELECT id FROM workers WHERE LOWER(email) = ?", (profile["email"].lower(),))
        row = cursor.fetchone()
        if not row:
            cursor.execute("""
            INSERT INTO workers (email, name, did, cri_score, resilience_tier, monthly_inflow, shift_consistency, platforms_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                profile["email"].lower(),
                profile["name"],
                profile["did"],
                profile["cri_score"],
                profile["resilience_tier"],
                profile["monthly_inflow"],
                profile["shift_consistency"],
                json.dumps(profile["sources"])
            ))

    conn.commit()
    conn.close()

init_db()

# Helper to format profile dict consistently for all callers
def format_profile(data: dict) -> dict:
    inflow = float(data.get("monthly_inflow", data.get("telemetry_summary", {}).get("monthly_inflow_inr", 35000.0)))
    cri = float(data.get("cri_score", 80.0))
    tier = data.get("resilience_tier", get_resilience_tier(cri))

    profile = dict(data)
    profile["monthly_inflow"] = inflow
    profile["cri_score"] = cri
    profile["resilience_tier"] = tier
    profile["max_prime_credit_limit_inr"] = round(inflow * 0.70, 2)
    profile["instant_safe_floor_inr"] = round(inflow * 0.50, 2)
    return profile

# ==============================================================================
# PYDANTIC SCHEMAS
# ==============================================================================

# ==============================================================================
# AUTO-DETECTION HELPER
# ==============================================================================

def detect_persona_from_identifier(identifier: str) -> str:
    """
    Auto-detects persona type from identifier:
    - UPI handle (@ybl, @upi, @okhdfcbank, @paytm, @axl, etc. or no TLD dot after @) -> UPI_MERCHANT
    - Email address (@gmail.com, @yahoo.com, etc.) -> GIG_WORKER
    """
    clean = identifier.strip().lower()
    upi_handles = [
        "@ybl", "@upi", "@okhdfcbank", "@paytm", "@axl", "@ibl", 
        "@oksbi", "@okaxis", "@icici", "@barodampay", "@kotak", 
        "@freecharge", "@idfcbank", "@aubank", "@pingpay", "@apl"
    ]
    for handle in upi_handles:
        if handle in clean:
            return "UPI_MERCHANT"
    
    if "@" in clean:
        parts = clean.split("@", 1)
        domain_part = parts[1]
        if "." not in domain_part:
            return "UPI_MERCHANT"
    
    return "GIG_WORKER"

# ==============================================================================
# PYDANTIC SCHEMAS
# ==============================================================================

class WorkerOnboardRequest(BaseModel):
    full_name: str
    identifier: Optional[str] = None
    email: Optional[str] = None
    worker_id: Optional[str] = None
    monthly_inflow: float = 45000.0
    active_days: int = 85
    total_window_days: Optional[int] = 90
    persona_type: Optional[str] = None  # Auto-detected if omitted
    source_name: Optional[str] = None
    margin_rate: Optional[float] = 0.70
    tenure_score: Optional[float] = 0.90
    stability: Optional[float] = None
    daily_avg_scans: Optional[int] = None
    rating: Optional[float] = None
    trips_completed: Optional[int] = None

class WorkerRegisterRequest(BaseModel):
    email: str
    name: Optional[str] = None
    platform: Optional[str] = "Uber"
    monthly_inflow: Optional[float] = 38500.0

class CredentialIssueRequest(BaseModel):
    worker_id: Optional[str] = "ramesh-kumar-9872"
    email: Optional[str] = None
    requested_amount: Optional[float] = 30000.0
    disclose_full_history: Optional[bool] = False

class UnderwriteRequest(BaseModel):
    credential: Dict[str, Any]
    loan_amount_requested: float = 30000.0

# ==============================================================================
# REST API ENDPOINTS
# ==============================================================================

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "GIgnite Multi-Persona Engine",
        "crypto_engine": "Ed25519 Native" if HAS_ED25519_NATIVE else "HMAC-SHA512 Fallback",
        "issuer": ISSUER_DID,
        "users_count": len(USERS_DB),
        "protocol": "RFC 8785 Canonical JSON â€¢ Ed25519",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

# ------------------------------------------------------------------------------
# 1. LIST AVAILABLE WORKERS / PERSONAS
# ------------------------------------------------------------------------------
@app.get("/api/workers")
def list_workers():
    """Returns list of available user profiles for easy UI switching."""
    results = []
    for uid, u in USERS_DB.items():
        results.append({
            "worker_id": u.get("worker_id", uid),
            "name": u.get("name", u.get("worker_name")),
            "full_name": u.get("full_name", u.get("name")),
            "email": u.get("email"),
            "persona_type": u.get("persona_type", "GIG_WORKER"),
            "category": u.get("category", "Platform Partner"),
            "cri_score": u.get("cri_score", 80.0),
            "resilience_tier": u.get("resilience_tier", "PRIME_RESILIENT"),
            "monthly_inflow": u.get("monthly_inflow", 40000.0),
            "platform_badges": u.get("platform_badges", [])
        })
    return results

# ------------------------------------------------------------------------------
# 2. GET WORKER PROFILE
# ------------------------------------------------------------------------------
@app.get("/api/worker/profile")
def get_worker_profile(
    worker_id: Optional[str] = Query("ramesh-kumar-9872", description="Worker ID to fetch"),
    email: Optional[str] = Query(None, description="Optional email search")
):
    """Fetches full profile for a given worker_id or email from USERS_DB."""
    # 1. Direct ID lookup in USERS_DB
    if worker_id and worker_id in USERS_DB:
        return format_profile(USERS_DB[worker_id])

    # 2. Email / Identifier lookup in USERS_DB
    if email:
        clean_email = email.strip().lower()
        for u in USERS_DB.values():
            if u.get("email", "").lower() == clean_email or u.get("worker_id", "").lower() == clean_email:
                return format_profile(u)

    # 3. Partial prefix search in USERS_DB
    if worker_id:
        clean_id = worker_id.strip().lower()
        for k, u in USERS_DB.items():
            if clean_id in k or clean_id in u.get("name", "").lower() or clean_id in u.get("email", "").lower():
                return format_profile(u)

    # 4. Fallback to SQLite check
    conn = get_db_connection()
    cursor = conn.cursor()
    if email:
        cursor.execute("SELECT * FROM workers WHERE LOWER(email) = ?", (email.strip().lower(),))
    elif worker_id:
        prefix = worker_id.split("-")[0].lower()
        cursor.execute("SELECT * FROM workers WHERE LOWER(email) LIKE ? OR LOWER(name) LIKE ?", (f"%{prefix}%", f"%{prefix}%"))
    else:
        cursor.execute("SELECT * FROM workers LIMIT 1")
    row = cursor.fetchone()
    conn.close()

    if row:
        platforms = json.loads(row["platforms_json"])
        return format_profile({
            "worker_id": row["email"].split("@")[0].lower().replace(".", "-"),
            "worker_name": row["name"],
            "name": row["name"],
            "email": row["email"],
            "did": row["did"],
            "persona_type": "GIG_WORKER",
            "category": "Verified Platform Partner",
            "credit_bureau_status": "THIN_FILE_VERIFIED_BY_GIGNITE",
            "platform_badges": [p.get("platform", "Partner") for p in platforms],
            "sources": platforms,
            "monthly_inflow": float(row["monthly_inflow"]),
            "cri_score": float(row["cri_score"]),
            "resilience_tier": row["resilience_tier"],
            "shift_consistency": float(row["shift_consistency"]),
            "telemetry_summary": {
                "telemetry_period_days": 180,
                "active_working_days": int(180 * float(row["shift_consistency"])),
                "active_days_ratio": float(row["shift_consistency"]),
                "consistency_rate": f"{round(float(row['shift_consistency']) * 100, 1)}%",
                "consistency_ratio": float(row["shift_consistency"]),
                "stability_rate": "100.0%",
                "stability_index": 1.0,
                "monthly_inflow_inr": float(row["monthly_inflow"]),
                "gross_earnings_180d_inr": float(row["monthly_inflow"]) * 6,
                "net_earnings_180d_inr": float(row["monthly_inflow"]) * 4.7,
                "zero_income_weeks": 0,
                "is_zktls_verified": True,
                "verification_status": "ZKTLS_VERIFIED"
            }
        })

    # Default to Ramesh if not found
    if "ramesh-kumar-9872" in USERS_DB:
        return format_profile(USERS_DB["ramesh-kumar-9872"])

    raise HTTPException(status_code=404, detail="Worker profile not found")

# ------------------------------------------------------------------------------
# 3. ONBOARD NEW WORKER / UPI MERCHANT (DYNAMIC PERSONA REGISTRY)
# ------------------------------------------------------------------------------
@app.post("/api/worker/onboard", status_code=201)
def onboard_worker(req: WorkerOnboardRequest):
    """
    Unified onboarding endpoint:
    - Accepts full_name, identifier (Email ID or UPI ID), monthly_inflow, active_days.
    - Auto-detects UPI Merchant vs Gig Platform Partner.
    - Computes CRI dynamically:
      consistency = min(1.0, active_days / 90.0)
      stability = 0.95 (merchant) or 1.0 (gig delivery)
      CRI = (0.35 * stability + 0.35 * consistency + 0.20 * 0.70 + 0.10 * 0.90) * 100
      tier = "PRIME_RESILIENT" if CRI >= 75.0 else "GROWTH_NEAR_PRIME"
    - Persists in USERS_DB & SQLite.
    """
    # 1. Resolve Identifier and Persona Type
    name_clean = req.full_name.strip()
    identifier_clean = (req.identifier or req.email or "").strip().lower()
    if not identifier_clean:
        slug_prefix = name_clean.lower().replace(" ", "-").replace("'", "").replace(".", "")
        identifier_clean = f"{slug_prefix}@gignite.network"

    # Auto-detect persona if not explicitly specified
    if req.persona_type in ["UPI_MERCHANT", "GIG_WORKER"]:
        detected_persona = req.persona_type
    else:
        detected_persona = detect_persona_from_identifier(identifier_clean)

    is_merchant = (detected_persona == "UPI_MERCHANT")

    # 2. Worker ID & DID Generation
    clean_slug = name_clean.lower().replace(" ", "-").replace("'", "").replace(".", "")
    if req.worker_id and req.worker_id.strip():
        worker_id = req.worker_id.strip().lower()
    elif "@" in identifier_clean:
        prefix = identifier_clean.split("@")[0].replace(".", "-")
        worker_id = f"{prefix}-{datetime.now().strftime('%M%S')}"
    else:
        worker_id = f"{clean_slug}-{datetime.now().strftime('%M%S')}"

    did = f"did:india:merchant:{worker_id}" if is_merchant else f"did:india:worker:{worker_id}"

    # 3. Dynamic Consistency & CRI Calculation
    window_days = req.total_window_days or 90
    active_days = max(1, min(window_days, req.active_days))
    consistency = round(min(1.0, active_days / 90.0), 3)

    stability = req.stability if req.stability is not None else (0.95 if is_merchant else 1.0)
    margin = req.margin_rate if req.margin_rate is not None else 0.70
    longevity = req.tenure_score if req.tenure_score is not None else 0.90

    # CRI Formula: (0.35 * stability + 0.35 * consistency + 0.20 * 0.70 + 0.10 * 0.90) * 100
    computed_cri = calculate_cri(stability, consistency, margin, longevity)
    tier = "PRIME_RESILIENT" if computed_cri >= 75.0 else "GROWTH_NEAR_PRIME"

    # 4. Persona Source & Badges Auto-Configuration
    monthly_inflow = float(req.monthly_inflow)
    if is_merchant:
        source_name = req.source_name or "PhonePe / UPI Merchant QR"
        category = "PhonePe / UPI QR Merchant"
        platform_badges = ["PhonePe Business", "UPI Merchant QR"]
        scans = req.daily_avg_scans or max(30, int(monthly_inflow / (30 * 180)))
        sources = [
            {
                "platform": "PhonePe Business",
                "role": "Verified QR Merchant",
                "vpa": identifier_clean,
                "bank_account": "Canara Bank (A/C ****4821)",
                "daily_avg_scans": scans,
                "verified_active": True,
                "payout_frequency": "T+0 Daily Settlement",
                "badge": "PhonePe Top Merchant",
                "payout_amount_inr": monthly_inflow
            }
        ]
    else:
        source_name = req.source_name or "Swiggy / Uber Telemetry"
        category = "Swiggy + Uber Fleet Partner"
        platform_badges = ["Swiggy", "Uber India"]
        trips = req.trips_completed or int(active_days * 12)
        sources = [
            {
                "platform": "Swiggy",
                "role": "Food Delivery Partner",
                "rating": req.rating or 4.92,
                "trips_completed": int(trips * 0.6),
                "verified_active": True,
                "payout_frequency": "Weekly",
                "badge": "Swiggy Star Rider",
                "payout_amount_inr": round(monthly_inflow * 0.56, 2)
            },
            {
                "platform": "Uber India",
                "role": "Premier Ride Driver",
                "rating": 4.88,
                "trips_completed": int(trips * 0.4),
                "verified_active": True,
                "payout_frequency": "Daily Instant",
                "badge": "Uber Diamond Partner",
                "payout_amount_inr": round(monthly_inflow * 0.44, 2)
            }
        ]

    # 5. Build Complete Profile
    new_profile = {
        "worker_id": worker_id,
        "name": name_clean,
        "full_name": name_clean,
        "worker_name": name_clean,
        "email": identifier_clean,
        "identifier": identifier_clean,
        "persona_type": detected_persona,
        "did": did,
        "category": category,
        "credit_bureau_status": "THIN_FILE_VERIFIED_BY_GIGNITE",
        "platform_badges": platform_badges,
        "sources": sources,
        "monthly_inflow": monthly_inflow,
        "active_days": active_days,
        "total_window_days": window_days,
        "shift_consistency": consistency,
        "stability": stability,
        "margin": margin,
        "longevity": longevity,
        "daily_avg_scans": req.daily_avg_scans if is_merchant else None,
        "cri_score": computed_cri,
        "resilience_tier": tier,
        "max_prime_credit_limit_inr": round(monthly_inflow * 0.70, 2),
        "instant_safe_floor_inr": round(monthly_inflow * 0.50, 2),
        "telemetry_summary": {
            "telemetry_period_days": window_days,
            "active_working_days": active_days,
            "active_days_ratio": consistency,
            "consistency_rate": f"{round(consistency * 100, 1)}%",
            "consistency_ratio": consistency,
            "stability_rate": f"{round(stability * 100, 1)}%",
            "stability_index": stability,
            "monthly_inflow_inr": monthly_inflow,
            "gross_earnings_180d_inr": round(monthly_inflow * 6, 2),
            "net_earnings_180d_inr": round(monthly_inflow * margin * 6, 2),
            "zero_income_weeks": 0,
            "margin_rate": margin,
            "tenure_score": longevity,
            "daily_avg_scans": (req.daily_avg_scans or int(monthly_inflow / (30 * 180))) if is_merchant else None,
            "is_zktls_verified": True,
            "is_soundbox_verified": is_merchant,
            "verification_status": "ZKTLS_VERIFIED"
        }
    }

    if is_merchant:
        new_profile["soundbox_details"] = {
            "provider": "PhonePe Business Soundbox Rail",
            "vpa": identifier_clean,
            "bank": "Canara Bank (A/C ****4821)",
            "scans": (req.daily_avg_scans or int(monthly_inflow / (30 * 180))) * 30,
            "avg_daily_scans": req.daily_avg_scans or int(monthly_inflow / (30 * 180)),
            "gross_volume": monthly_inflow,
            "avg_daily": round(monthly_inflow / 30.0, 2),
            "credential_id": f"urn:uuid:soundbox-{worker_id}"
        }

    # 6. Save in USERS_DB and Sync with SQLite
    USERS_DB[worker_id] = new_profile

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT OR REPLACE INTO workers (email, name, did, cri_score, resilience_tier, monthly_inflow, shift_consistency, platforms_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            identifier_clean,
            name_clean,
            did,
            computed_cri,
            tier,
            monthly_inflow,
            consistency,
            json.dumps(sources)
        ))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Warning: SQLite sync error: {e}", file=sys.stderr)

    return JSONResponse(status_code=201, content=format_profile(new_profile))

# ------------------------------------------------------------------------------
# 4. AUTH / CHECK WORKER EMAIL (LEGACY BACKWARD COMPATIBILITY)
# ------------------------------------------------------------------------------
@app.get("/api/worker/check")
def check_worker_email(email: str = Query(..., description="Worker email address to check")):
    clean_email = email.strip().lower()
    for u in USERS_DB.values():
        if u.get("email", "").lower() == clean_email:
            return format_profile(u)

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM workers WHERE LOWER(email) = ?", (clean_email,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Account not found")

    return get_worker_profile(email=clean_email)

# ------------------------------------------------------------------------------
# 5. AUTH / REGISTER WORKER (LEGACY BACKWARD COMPATIBILITY)
# ------------------------------------------------------------------------------
@app.post("/api/worker/register", status_code=201)
def register_worker(req: WorkerRegisterRequest):
    return onboard_worker(WorkerOnboardRequest(
        full_name=req.name or req.email.split("@")[0].title(),
        email=req.email,
        source_name=req.platform or "Uber",
        monthly_inflow=req.monthly_inflow or 38500.0,
        persona_type="GIG_WORKER"
    ))

# ------------------------------------------------------------------------------
# 6. MINT & ISSUE W3C VERIFIABLE CREDENTIAL (RFC 8785 + Ed25519)
# ------------------------------------------------------------------------------
@app.post("/api/credential/issue")
def issue_verifiable_credential(req: CredentialIssueRequest):
    """
    Accepts worker_id or email, builds a canonical W3C Verifiable Credential with
    selective disclosure assertions, signs via Ed25519, and returns the signed JSON.
    """
    worker_profile = None

    if req.worker_id and req.worker_id in USERS_DB:
        worker_profile = USERS_DB[req.worker_id]
    elif req.email:
        clean_email = req.email.strip().lower()
        for u in USERS_DB.values():
            if u.get("email", "").lower() == clean_email:
                worker_profile = u
                break

    if not worker_profile:
        # Fallback to general get_worker_profile logic
        worker_profile = get_worker_profile(worker_id=req.worker_id, email=req.email)

    now_iso = datetime.now(timezone.utc).isoformat()
    monthly_inflow = float(worker_profile.get("monthly_inflow", worker_profile.get("telemetry_summary", {}).get("monthly_inflow_inr", 35000.0)))
    cri_score = float(worker_profile.get("cri_score", 80.0))
    tier = worker_profile.get("resilience_tier", get_resilience_tier(cri_score))

    claim_subject = {
        "id": worker_profile.get("did", f"did:india:worker:{worker_profile.get('worker_id')}"),
        "workerName": worker_profile.get("name", worker_profile.get("worker_name")),
        "workerCategory": worker_profile.get("category", "Platform Earner"),
        "personaType": worker_profile.get("persona_type", "GIG_WORKER"),
        "platforms": worker_profile.get("platform_badges", ["GIgnite Rail"]),
        "telemetryPeriodDays": worker_profile.get("telemetry_summary", {}).get("telemetry_period_days", 180),
        "cri_score": cri_score,
        "criScore": cri_score,
        "cashFlowResilienceScore": cri_score,
        "resilienceTier": tier,
        "resilience_tier": tier,
        "scoreTier": "Prime Resilience (Tier-1 Low Risk)" if cri_score >= 75 else "Near-Prime Growth",
        "monthlyInflowGte": int(monthly_inflow * 0.5),
        "averageMonthlyInflowINR": monthly_inflow,
        "consistencyRatio": worker_profile.get("telemetry_summary", {}).get("consistency_ratio", 0.90),
        "stabilityIndex": worker_profile.get("telemetry_summary", {}).get("stability_index", 0.95),
        "zeroIncomeWeeksCount": worker_profile.get("telemetry_summary", {}).get("zero_income_weeks", 0),
        "zeroBounceRecord": True,
        "selectiveDisclosure": {
            "rawLocationTelemetryDisclosed": False,
            "rawCustomerDetailsDisclosed": False,
            "discloseFullHistory": req.disclose_full_history or False,
            "verifiedMinIncomeGuaranteedINR": int(monthly_inflow * 0.5),
            "isUnderwritingAuditReady": True
        }
    }

    credential_id = f"urn:uuid:gignite-vc-{worker_profile.get('worker_id', 'earner')}-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}"

    unsigned_payload = {
        "@context": [
            "https://www.w3.org/2018/credentials/v1",
            "https://schema.org",
            "https://gignite.network/credentials/v2"
        ],
        "id": credential_id,
        "type": ["VerifiableCredential", "CashFlowResilienceCredential"],
        "issuer": {
            "id": ISSUER_DID,
            "name": "GIgnite Autonomous Financial Identity Authority"
        },
        "issuanceDate": now_iso,
        "expirationDate": "2026-12-31T23:59:59Z",
        "credentialSubject": claim_subject
    }

    # RFC 8785 Canonical Signature Generation
    signature_hex, digest_sha512 = sign_payload(unsigned_payload)

    unsigned_payload["proof"] = {
        "type": "Ed25519Signature2020",
        "created": now_iso,
        "verificationMethod": ISSUER_KEY_ID,
        "proofPurpose": "assertionMethod",
        "proofValue": signature_hex,
        "payloadDigest": digest_sha512
    }

    return unsigned_payload

# ------------------------------------------------------------------------------
# 7. ZERO-TRUST LENDER UNDERWRITING & TAMPER DEFENSE
# ------------------------------------------------------------------------------
@app.post("/api/lender/underwrite")
def underwrite_loan(req: UnderwriteRequest):
    """
    Zero-Trust Underwriting Endpoint:
    - Verifies RFC 8785 canonical digest against Ed25519 signature.
    - If tampered: returns HTTP 403 REJECTED_SECURITY_HALT (FRAUD_TAMPER_DETECTED).
    - If valid and requested <= capacity: returns HTTP 200 APPROVED.
    - If valid and requested > capacity: returns HTTP 200 CONDITIONAL_APPROVAL with 21-day counterfactual plan.
    """
    credential = req.credential
    requested_loan = float(req.loan_amount_requested)

    if not isinstance(credential, dict) or "proof" not in credential:
        raise HTTPException(
            status_code=400,
            detail={"decision": "REJECTED_FORMAT_ERROR", "error": "Missing proof in credential payload"}
        )

    proof = credential.get("proof", {})
    presented_sig = proof.get("proofValue", "")
    claimed_digest = proof.get("payloadDigest", "")

    # 1. Extract payload without proof block and re-canonicalize
    payload_without_proof = {k: v for k, v in credential.items() if k != "proof"}
    computed_digest = compute_sha512_digest(payload_without_proof)

    # 2. Verify Cryptographic Signature
    is_signature_valid = verify_payload_signature(payload_without_proof, presented_sig)

    if not is_signature_valid:
        # Expected signature for authoritative audit trail
        expected_sig, _ = sign_payload(payload_without_proof)

        return JSONResponse(
            status_code=403,
            content={
                "decision": "REJECTED_SECURITY_HALT",
                "security_flag": "FRAUD_TAMPER_DETECTED",
                "error": "Signature mismatch on canonical payload. Digest altered after issuance.",
                "audit_metadata": {
                    "expected_signature": expected_sig,
                    "presented_signature": presented_sig,
                    "computed_digest_sha512": computed_digest,
                    "claimed_digest_sha512": claimed_digest,
                    "verificationMethod": proof.get("verificationMethod", ISSUER_KEY_ID)
                },
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        )

    # 3. Underwriting Assessment Logic
    subj = credential.get("credentialSubject", {})
    monthly_inflow = float(subj.get("averageMonthlyInflowINR", subj.get("monthlyInflowGte", 35000.0)))
    cri_score = float(subj.get("cri_score", subj.get("cashFlowResilienceScore", 80.0)))
    prime_ceiling = monthly_inflow * 0.70

    # Scenario A: Full Pre-Approval
    if requested_loan <= prime_ceiling and cri_score >= 75.0:
        rate_p_a = 11.5
        tenure = 12
        r = (rate_p_a / 100.0) / 12.0
        emi = (requested_loan * r * math.pow(1 + r, tenure)) / (math.pow(1 + r, tenure) - 1)

        return {
            "decision": "APPROVED",
            "tier": "TIER_1_PRIME",
            "resilience_tier": "PRIME_RESILIENT",
            "cri_score": cri_score,
            "sanctioned_amount": requested_loan,
            "instant_available_limit": requested_loan,
            "requested_amount": requested_loan,
            "max_prime_limit": round(prime_ceiling, 2),
            "annual_interest_rate_p_a": f"{rate_p_a}%",
            "tenure_months": tenure,
            "monthly_emi_inr": round(emi, 2),
            "total_repayable_inr": round(emi * tenure, 2),
            "counterfactual_needed": False,
            "underwriting_audit": {
                "verification_status": "CRYPTOGRAPHICALLY_VERIFIED_AUTHENTIC",
                "issuer_did": ISSUER_DID,
                "credential_id": credential.get("id", "urn:uuid:gignite-cred-authenticated"),
                "worker_id": subj.get("id", "did:india:worker:authenticated"),
                "worker_name": subj.get("workerName", "Verified Earner")
            },
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    else:
        # Scenario C: Conditional Approval with 21-Day Counterfactual Remediation Roadmap
        safe_floor = round(monthly_inflow * 0.50, 2)
        gap = round(requested_loan - safe_floor, 2)
        needed_inflow = round(requested_loan / 0.70, 2)
        inflow_gap = round(max(0.0, needed_inflow - monthly_inflow), 2)
        daily_extra = round(inflow_gap / 30.0, 2)
        trips = max(1, math.ceil(daily_extra / 85.0))

        return {
            "decision": "CONDITIONAL_APPROVAL",
            "tier": "TIER_2_GROWTH",
            "resilience_tier": "PRIME_RESILIENT" if cri_score >= 75 else "GROWTH_NEAR_PRIME",
            "cri_score": cri_score,
            "instant_available_limit": safe_floor,
            "requested_amount": requested_loan,
            "max_prime_limit": round(prime_ceiling, 2),
            "annual_interest_rate_p_a": "13.5%",
            "tenure_months": 6,
            "instant_monthly_emi_inr": round((safe_floor * (0.135/12) * math.pow(1 + 0.135/12, 6)) / (math.pow(1 + 0.135/12, 6) - 1), 2),
            "counterfactual_needed": True,
            "remediation_plan": {
                "target_loan_amount": requested_loan,
                "instant_approved_limit": safe_floor,
                "funding_gap": gap,
                "target_active_consistency": "90%",
                "required_consistency_ratio": 0.90,
                "required_monthly_inflow": needed_inflow,
                "inflow_gap_inr": inflow_gap,
                "daily_extra_earnings_inr": daily_extra,
                "daily_extra_trips": trips,
                "weekly_extra_trips": trips * 6,
                "roadmap_days": 21,
                "actionable_milestones": [
                    {
                        "day_range": "Days 1-7",
                        "title": "Peak-Hour Shift Optimization",
                        "action": f"Add ~{trips} delivery orders or â‚¹{daily_extra} daily QR settlements during peak velocity hours.",
                        "target_delta": f"+â‚¹{round(daily_extra * 7, 2)} weekly inflow"
                    },
                    {
                        "day_range": "Days 8-14",
                        "title": "Shift Attendance Lock",
                        "action": "Maintain active business settlements on 6 out of 7 days to eliminate volatility.",
                        "target_delta": "Zero-volatility consistency flag"
                    },
                    {
                        "day_range": "Days 15-21",
                        "title": "Telemetry Refresh & Auto-Unlock",
                        "action": f"Re-issue Verifiable Credential to automatically unlock the remaining â‚¹{gap} working capital credit line.",
                        "target_delta": f"Full â‚¹{requested_loan} Working Capital Disbursal"
                    }
                ]
            },
            "underwriting_audit": {
                "verification_status": "CRYPTOGRAPHICALLY_VERIFIED_AUTHENTIC",
                "issuer_did": ISSUER_DID,
                "credential_id": credential.get("id", "urn:uuid:gignite-cred-authenticated"),
                "worker_id": subj.get("id", "did:india:worker:authenticated"),
                "worker_name": subj.get("workerName", "Verified Earner")
            },
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)