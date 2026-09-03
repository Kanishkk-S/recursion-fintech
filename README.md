# GIgnite — Decentralized Financial Identity & Deterministic Credit Underwriting

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-3776AB.svg?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/React-18-61DAFB.svg?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Vite-3178C6.svg?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![SQLite](https://img.shields.io/badge/SQLite-Database-003B57.svg?style=flat-square&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Ed25519](https://img.shields.io/badge/Crypto-Ed25519%20%2F%20Curve25519-EAB308.svg?style=flat-square)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Verification](https://img.shields.io/badge/Signature%20Verify-%3C10ms-success.svg?style=flat-square)](#)

> **GIgnite** is a decentralized financial identity and deterministic credit underwriting platform that turns siloed gig-economy telemetry (Swiggy, Uber, Zomato) into cryptographically verifiable digital credentials. Workers prove creditworthiness without exposing raw banking data; lenders verify reputation in under 50ms and run automated, fraud-proof underwriting — no shared database required.

---

## Table of Contents

- [1. Executive Summary](#1-executive-summary)
- [2. Problem Statement](#2-problem-statement)
- [3. System Architecture & Workflow](#3-system-architecture--workflow)
- [4. Core Platform Modules](#4-core-platform-modules)
  - [Earner Financial Terminal](#41-earner-financial-terminal-worker-portal)
  - [Cryptographic Attestation Engine](#42-cryptographic-attestation-engine)
  - [Lender Verification & Underwriting Terminal](#43-lender-verification--underwriting-terminal)
- [5. Fraud Defense Model](#5-fraud-defense-model)
- [6. Technology Stack](#6-technology-stack)
- [7. Setup & Installation](#7-setup--installation)
- [8. REST API Reference](#8-rest-api-reference)
- [9. Credential & Underwriting Data Model](#9-credential--underwriting-data-model)
- [10. Security Model](#10-security-model)
- [11. Known Limitations & Roadmap](#11-known-limitations--roadmap)
- [12. Contributors & License](#12-contributors--license)

---

## 1. Executive Summary

Over 15 million platform workers in India generate consistent, verifiable income — yet remain functionally invisible to formal credit institutions. GIgnite closes that gap by acting as an **issuer of cryptographically signed, W3C-compliant Verifiable Credentials** derived directly from gig platform telemetry. Instead of a lender trusting a screenshot or a PDF, they trust math: an **Ed25519** digital signature that breaks the instant a single digit is altered.

The result is a three-party trust model — **Worker (Holder)**, **GIgnite Core Engine (Issuer)**, and **Lender (Verifier)** — that replaces manual document review with deterministic, sub-50ms cryptographic verification and rules-based underwriting.

---

## 2. Problem Statement

Legacy credit infrastructure was never built for gig work, and it shows:

- **Bureau Blindness** — CIBIL, Experian, and other legacy bureaus require salary slips, employment contracts, and tax filings. Informal earners are scored as "thin-file" or left unscored entirely.
- **Platform Silos** — A driver working simultaneously on Uber and Zomato has no way to aggregate dual income streams into one unified proof of revenue.
- **Tamperable Proof** — Screenshots and PDF bank statements are trivially forged with basic image editors, forcing lenders into blanket rejections or predatory micro-finance rates (**>36% APR**).
- **Privacy Leaks** — Standard loan approval flows demand full, unredacted bank statements, exposing far more financial detail than the lender actually needs.

GIgnite addresses all four by issuing **attested, privacy-preserving, cryptographically tamper-evident credentials** in place of raw financial documents.

---

## 3. System Architecture & Workflow

GIgnite operates as a five-stage pipeline spanning ingestion, scoring, issuance, exchange, and verification:

```
[ Gig Platforms ] (Swiggy / Uber / Zomato Telemetry)
                             │
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │ 1. Telemetry Ingestion & Normalization                  │
  │    • Inflows, delivery streaks, hours, rating index     │
  └──────────────────────────┬───────────────────────────────┘
                             │
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │ 2. Credit Readiness Index (CRI) Engine                  │
  │    • Multi-variate stability scoring (0 – 100)          │
  └──────────────────────────┬───────────────────────────────┘
                             │
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │ 3. Cryptographic Issuance (Issuer Node)                 │
  │    • Canonical JSON serialization                       │
  │    • Ed25519 private key digital signature              │
  │    • Emits W3C Verifiable Credential (VC) + QR code     │
  └──────────────────────────┬───────────────────────────────┘
                             │
              (Zero-Knowledge Exchange / Transfer)
                             │
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │ 4. Lender Verification Terminal (Verifier Node)         │
  │    • Resolves issuer public key                         │
  │    • Executes 1-bit tamper check & anti-fraud scan       │
  └──────────────────────────┬───────────────────────────────┘
                             │
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │ 5. Automated Underwriting Engine                        │
  │    • Validates inflow thresholds (₹30k / ₹75k limits)    │
  │    • Outputs: APR, tenor, and real-time approval         │
  └────────────────────────────────────────────────────────┘
```

**Design principle:** the Verifier never calls back to the Issuer's database. Every trust decision is made locally, from the public key and the signed payload alone — this is what gets verification under 50ms.

---

## 4. Core Platform Modules

### 4.1 Earner Financial Terminal (Worker Portal)

- **Aggregated Inflow Tracker** — Ingests 180-day trailing revenue across delivery and rideshare accounts (baseline example: ₹49,100/month across platforms).
- **Credit Readiness Index (CRI)** — A deterministic 0–100 score derived from earnings consistency (e.g. 93.5%), operational stability (e.g. 100%), and platform tenure (e.g. 22 months).
- **Decentralized Identifier (DID)** — Binds worker identity to a sovereign DID format: `did:india:worker:ramesh-kumar-9872`.
- **Verifiable Credential Export** — Compiles attested metrics into portable W3C Verifiable Credentials, downloadable as signed JSON-LD or scan-ready QR codes.

### 4.2 Cryptographic Attestation Engine

- **Curve25519 / Ed25519 Signatures** — Elliptic-curve signing at 128-bit security with high signing throughput, replacing fragile RSA/PDF-based trust.
- **Canonical JSON-LD Standardization** — Deterministic attribute sorting ensures bit-level reproducibility, so any two verifiers reach the same hash from the same claims.
- **Zero-Knowledge Privacy** — Lenders receive verified mathematical assertions (CRI grade, qualified income bracket) without ever touching underlying transaction-level data.

### 4.3 Lender Verification & Underwriting Terminal

- **Instant Public-Key Audit** — Validates the embedded signature against the GIgnite authority public key in under 10ms, with no issuer database round-trip.
- **1-Bit Tamper Simulator** — A sandbox that lets underwriters mutate a single character in the claims payload live, demonstrating immediate signature invalidation.
- **Tiered Underwriting Matrix**:

| Tier | Inflow Requirement | CRI Requirement | Max Credit | APR | Tenor |
|---|---|---|---|---|---|
| **Standard Liquidity** | ≥ ₹25,000 | ≥ 70.0 | ₹30,000 | 11.5% | 90 days |
| **Growth Liquidity** | ≥ ₹45,000 | ≥ 85.0 | ₹75,000 | 9.8% | 180 days |

- **Interactive Dynamic Remediation** — For borderline applicants, underwriters can simulate real-time micro-deductions from daily payouts, converting outright rejections into structured, lower-risk credit offers.

---

## 5. Fraud Defense Model

GIgnite replaces procedural trust (manually inspecting a static PDF) with mathematical proof:

```
[Attested Data: Inflow = ₹49,100] ──> SHA-512 Hash ──> Ed25519 Sign ──> [Valid Proof]

[Tampered Data: Inflow = ₹99,100] ──> Modified Hash ──> Verify Check ──> 403 FORBIDDEN
                                                                          (Signature Mismatch)
```

1. Any manual alteration — even a ₹1 change to an earnings figure — scrambles the computed hash of the payload.
2. The issuer's public key strictly rejects any mismatched hash, causing immediate cryptographic failure.
3. The platform halts execution *before* risk metrics are ever calculated, eliminating bad debt originating from altered documentation at the source, not after the fact.

---

## 6. Technology Stack

| Dimension | Technology / Standard | Purpose |
|---|---|---|
| **Frontend UI** | React 18, TypeScript, Vite | Sub-second client performance, interactive dashboards, and telemetry rendering |
| **Design Language** | Tailwind CSS | "Warm Financial Trust" theme — Slate Navy `#0F172A`, Sand Beige `#FDF8EB`, Amber `#EAB308` |
| **Backend API** | Python 3.10+, FastAPI, Uvicorn | High-throughput asynchronous REST API for verification and score calculation |
| **Cryptographic Suite** | `pynacl`, `cryptography` | Asymmetric Ed25519 signing, keypair management, and cryptographic payload parsing |
| **Database** | SQLite3 (C-level foreign keys) | Zero-dependency transactional ledger for audits and initial seeding |
| **Deployment Target** | Vercel Unified Serverless | Static assets on global edge caches; backend served via `api/index.py` ASGI bridge |

---

## 7. Setup & Installation

### Prerequisites
- Python 3.10 or higher
- Node.js 18+ and npm/pnpm (for the React/Vite frontend)
- PowerShell, Bash, or Zsh terminal

### Backend Quickstart

```bash
# 1. Navigate to the backend workspace
cd backend

# 2. Install Python dependencies
pip install -r requirements.txt

# 3. Generate the issuer's Ed25519 keypair (first run only)
python scripts/generate_keys.py

# 4. Start the FastAPI backend
uvicorn api.index:app --host 0.0.0.0 --port 8000
```

### Frontend Quickstart

```bash
# 1. Navigate to the frontend workspace
cd frontend

# 2. Install dependencies
npm install

# 3. Run the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) for the worker/lender dashboards, with the API served at `http://localhost:8000`.

### Production Deployment (Vercel)

```bash
vercel --prod
```

Static frontend assets are served from Vercel's global edge cache; API routes are bridged through `api/index.py` as a serverless ASGI function.

---

## 8. REST API Reference

### `GET /health`
Heartbeat endpoint returning engine operational status and microservice uptime.

### `POST /issue`
Ingests worker performance metrics, calculates the Credit Readiness Index, and returns a signed W3C Verifiable Credential.

**Request:**
```json
{
  "worker_did": "did:india:worker:ramesh-kumar-9872",
  "inflow_180d_avg": 49100,
  "earnings_consistency": 93.5,
  "operational_stability": 100.0,
  "platform_tenure_months": 22
}
```

**Response:**
```json
{
  "credential_id": "vc_GI_9F21A7C4",
  "cri_score": 88.2,
  "issuer_did": "did:india:gignite:core-issuer",
  "issued_at": "2026-09-04T10:12:03Z",
  "signature": "ed25519:5f9c3a...b21e",
  "qr_code_url": "/credentials/vc_GI_9F21A7C4.png"
}
```

### `POST /verify`
Ingests a signed payload, verifies the digital signature against the issuer's public key, and flags whether payload tampering occurred.

**Response:**
```json
{
  "valid": true,
  "tampered": false,
  "verified_in_ms": 8
}
```

### `POST /underwrite`
Evaluates verified credentials against institutional risk rules to output credit tier approvals, loan limits, APR, and repayment tenors.

**Response:**
```json
{
  "tier": "Growth Liquidity",
  "approved_amount_inr": 75000,
  "apr": 9.8,
  "tenor_days": 180,
  "decision": "APPROVED"
}
```

---

## 9. Credential & Underwriting Data Model

GIgnite credentials follow the **W3C Verifiable Credentials Data Model**, canonically serialized before signing to guarantee bit-level reproducibility:

```json
{
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  "type": ["VerifiableCredential", "GigWorkerCreditCredential"],
  "issuer": "did:india:gignite:core-issuer",
  "credentialSubject": {
    "id": "did:india:worker:ramesh-kumar-9872",
    "criScore": 88.2,
    "inflowBracket": "45k-75k",
    "tenureMonths": 22
  },
  "issuanceDate": "2026-09-04T10:12:03Z",
  "proof": {
    "type": "Ed25519Signature2020",
    "verificationMethod": "did:india:gignite:core-issuer#key-1",
    "proofValue": "z5f9c3a...b21e"
  }
}
```

---

## 10. Security Model

- **Asymmetric trust boundary** — Only the Issuer holds the Ed25519 private key; Verifiers hold only the corresponding public key, so a compromised lender terminal can never forge credentials.
- **No verification-time database dependency** — Signature checks are fully offline against the resolved public key, minimizing attack surface and eliminating a class of API-based replay attacks.
- **Canonicalization before signing** — Deterministic JSON-LD ordering prevents semantic-equivalent payloads from producing different signatures, closing a common credential-forgery vector.
- **Selective disclosure** — Lenders receive derived assertions (CRI tier, income bracket) rather than raw transaction data, minimizing the blast radius of any lender-side data breach.

---

## 11. Known Limitations & Roadmap

- **Single-Issuer Trust Root** — Current architecture assumes one GIgnite issuer authority; roadmap includes a federated/multi-issuer trust registry for platform-specific issuers.
- **Static Scoring Weights** — CRI is currently a fixed multi-variate formula; future versions will explore adaptive weighting informed by repayment outcome data.
- **Credential Revocation** — No revocation list yet; planned support for a status registry (e.g. W3C `StatusList2021`) to handle compromised or superseded credentials.
- **Multi-Tenant Lender Access Control** — Add scoped API keys and audit trails per lending institution.

---

## 12. Contributors & License

- **Project**: GIgnite — Decentralized Financial Identity & Deterministic Credit Underwriting
- **License**: Licensed under the [MIT License](LICENSE).
