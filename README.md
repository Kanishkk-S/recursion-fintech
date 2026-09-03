# FinCore — Autonomous Self-Healing FinTech Agent

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-3776AB.svg?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![SQLite](https://img.shields.io/badge/SQLite-Database-003B57.svg?style=flat-square&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Test Suite](https://img.shields.io/badge/Tests-63%2F63%20Passed%20(100%25)-success.svg?style=flat-square)](#verification--test-suite)
[![Colosseum 2026](https://img.shields.io/badge/Colosseum-FinTech%20Agent-6366f1.svg?style=flat-square)](#)

> **FinCore** is an enterprise-grade, fully autonomous financial operations agent designed to ingest messy, multi-currency transaction streams, execute self-healing schema normalization, perform continuous dual-ledger chaos reconciliation, and surface real-time treasury intelligence with zero human intervention.

---

## Table of Contents

- [1. Executive Summary & Overview](#1-executive-summary--overview)
- [2. Problem Statement & Motivation](#2-problem-statement--motivation)
- [3. Key Architectural Features](#3-key-architectural-features)
  - [Task 1: Multi-Currency Ingestion & Self-Healing Pipeline](#task-1-multi-currency-ingestion--self-healing-pipeline)
  - [Task 2: Continuous Dual-Ledger Chaos Reconciliation](#task-2-continuous-dual-ledger-chaos-reconciliation)
  - [10 Enterprise Risk & Spending Intelligence Engines](#10-enterprise-risk--spending-intelligence-engines)
  - [Unified Intelligent Omni-Input Engine](#unified-intelligent-omni-input-engine)
- [4. System Architecture & Workflow](#4-system-architecture--workflow)
- [5. Technology Stack](#5-technology-stack)
- [6. Directory Structure](#6-directory-structure)
- [7. Setup & Installation](#7-setup--installation)
  - [Prerequisites](#prerequisites)
  - [Local Quickstart](#local-quickstart)
  - [Public Cloudflare Tunnel Deployment](#public-cloudflare-tunnel-deployment)
- [8. REST API Reference](#8-rest-api-reference)
- [9. Verification & Test Suite](#9-verification--test-suite)
- [10. Known Limitations & Future Roadmap](#10-known-limitations--future-roadmap)
- [11. Contributors & License](#11-contributors--license)

---

## 1. Executive Summary & Overview

Modern corporate financial operations suffer from fractured transaction data: disparate third-party payment gateways, degraded webhooks, drifting payload keys, non-standard epoch timestamps, and un-reconciled counterparty settlement ledgers.

**FinCore** eliminates manual intervention through a multi-step, self-healing agent pipeline equipped with 3 owned tools:
1. `PythonREPLSandbox` (400 CC): Safe, isolated sandbox for evaluating dynamic calculations and financial queries without risking production crashes.
2. `CurrencyNormaliser` (200 CC): High-precision `Decimal` FX conversion engine with baseline tolerance clamping to prevent catastrophic currency drift.
3. `LedgerReconciler` (300 CC): Cross-source matching engine identifying variances, missing records, and duplicate charges.

---

## 2. Problem Statement & Motivation

Traditional financial ingestion pipelines fail when subjected to real-world edge cases:
- **Schema Drift**: Unannounced key modifications (`vendor` $\rightarrow$ `merchant_entity`, `cost` $\rightarrow$ `transacted_sum`).
- **Data Degradation**: Null merchant entries, prompt injections, and irregular timestamp formats (epoch milliseconds vs ISO-8601 strings).
- **FX Volatility & Stale Feeds**: Third-party FX APIs returning stale rates, abnormal spikes, or missing currency pairs.
- **Dual-Ledger Discrepancies**: Internal ERP entries diverging from external banking and payment provider feeds.
- **Compliance & Fraud Risk**: Duplicate charges, policy-violating meal expenses, after-hours ingestions, and transactions to sanctioned entities.

FinCore solves these vulnerabilities through defensive normalization, semantic key resolution, and autonomous continuous auditing.

---

## 3. Key Architectural Features

### Task 1: Multi-Currency Ingestion & Self-Healing Pipeline
- **Multi-Step Reasoning**:
  - **Step 1 (Schema Drift)**: Dynamically maps 30+ semantic key variations (`transacted_sum`, `merchant_entity`, `reference_code`, etc.) while stripping prompt injections.
  - **Step 2 (Clean & Impute)**: Imputes missing merchants from transaction notes/narratives or assigns `"Unknown Merchant"` with `"Uncategorized"` category. Sanitizes malformed timestamps to UTC ISO-8601 (`YYYY-MM-DDTHH:MM:SSZ`).
  - **Step 3 (FX Normalization & Clamping)**: Converts foreign currencies (USD, EUR, GBP, AED, SGD, CAD, etc.) into base INR using `Decimal` precision, clamping stale deviations ($> 25\%$) to reference benchmark rates.
  - **Step 4 (Merchant Enrichment)**: Enriches raw merchant strings into standardized categories (*Cloud & SaaS*, *Food & Dining*, *Travel & Transit*, *Entertainment & Subscriptions*, *E-Commerce*).
  - **Step 5 (Strict Schema Enforcement)**: Emits strictly validated records conforming to:
    ```json
    {
      "transaction_id": "NL_UBE_976DE56C",
      "amount_inr": 3757.50,
      "currency": "USD",
      "merchant": "Uber",
      "category": "Travel & Transit",
      "timestamp": "2026-09-01T10:09:51Z"
    }
    ```

### Task 2: Continuous Dual-Ledger Chaos Reconciliation
- **Dual-Stream Cross-Matching**: Compares internal database transactions against counterparty settlement streams in real time.
- **Tolerance & Variance Auditing**: Flags balance mismatches ($> ₹0.01$) and records missing from either stream.
- **Zero-Touch Self-Audit**: Automatically recalculates audit rates and variance counters on every database commit.

### 10 Enterprise Risk & Spending Intelligence Engines
1. **Monthly Spending Velocity (Feature 1)**: Computes daily average burn rate (INR/day) and projects estimated month-end spend.
2. **Category Breakdown & Distribution (Feature 2)**: Aggregates total expenditure by category into numerical sums and percentage shares ($\%$).
3. **Duplicate Charge Identifier (Feature 8)**: Detects identical charges to the same merchant within a 24-hour window ($\le 86,400\text{s}$) and flags `IS_DUPLICATE`.
4. **Velocity Anomaly Trigger (Feature 9)**: Flags rapid transaction clusters ($\ge 3\text{ transactions in } 10\text{ minutes}$).
5. **Suspicious After-Hours Ingestion (Feature 10)**: Identifies entries created outside standard business operating hours ($20:00 - 07:00$).
6. **Sanctioned / High-Risk Merchant Filter (Feature 11)**: Cross-checks merchant entities against prohibited watchlists (*gambling*, *crypto mixers*, *darknet*, *shell entities*).
7. **Tax / GST Reserve Estimator (Feature 17)**: Computes standard 18% GST liability estimations on eligible business categories and tracks tax reserve requirements.
8. **Expense Policy Violation Scanner (Feature 21)**: Enforces per-transaction category spending caps (e.g., Meals $> ₹2,500$, Travel $> ₹15,000$).
9. **Free-Form Financial Querying (Feature 23)**: Natural language conversational querying over the ledger via `POST /api/analytics/query`.
10. **Multi-Format Ledger Exporter (Feature 27)**: Direct one-click download endpoints for CSV (`/api/export/csv`) and JSON (`/api/export/json`).

### Unified Intelligent Omni-Input Engine
- A consolidated omni-bar accepting unstructured transaction entries or financial questions in a single interface.
- **Automated Intent Routing**:
  - `INGESTION`: Parses transaction statements (*"Paid 45 USD for Uber rides yesterday"*), normalizes FX, commits to SQLite, and triggers Task 2 reconciliation.
  - `ANALYTICS_QUERY`: Evaluates financial questions (*"How much did we spend on food?"*, *"Show duplicate transactions"*, *"What is our daily burn rate?"*) and returns conversational answers with data payloads.

---

## 4. System Architecture & Workflow

```
                        [ Raw Ingestion Sources ]
             (Natural Language / Batch Feed / Webhook API)
                                  │
                                  ▼
           ┌──────────────────────────────────────────────┐
           │     ColosseumAgent (Omni-Intent Router)      │
           │  • Semantic Drift Resolver                   │
           │  • Prompt Injection Stripper                 │
           │  • Intent Classifier (Ingest vs. Query)      │
           └──────────────────────┬───────────────────────┘
                                  │
         ┌────────────────────────┴────────────────────────┐
         │ (Intent: INGESTION)                             │ (Intent: QUERY)
         ▼                                                 ▼
┌──────────────────────────────────┐             ┌──────────────────────────────────┐
│ Task 1: Self-Healing Pipeline    │             │ Sandboxed Financial Intelligence │
│ • CurrencyNormaliser (FX Clamped)│             │ • PythonREPLSandbox Execution    │
│ • Flexible Timestamp Normalizer  │             │ • Velocity / Burn Rate Evaluator │
│ • Merchant & Category Resolver   │             │ • 18% GST Tax Reserve Calculator │
│ • Schema Validator               │             │ • Risk & Duplicate Charge Scanner│
└────────────────┬─────────────────┘             └────────────────┬─────────────────┘
                 │                                                │
                 ▼                                                │
┌──────────────────────────────────┐                              │
│ SQLite Persistence (database.py) │                              │
└────────────────┬─────────────────┘                              │
                 │                                                │
                 ▼                                                │
┌──────────────────────────────────┐                              │
│ Task 2: Dual-Ledger Reconciler   │                              │
│ • Cross-Source Stream Matching   │                              │
│ • Variance & Outlier Detection   │                              │
└────────────────┬─────────────────┘                              │
                 │                                                │
                 └────────────────────────┬───────────────────────┘
                                          │
                                          ▼
                      ┌────────────────────────────────────────┐
                      │    FastAPI Telemetry Stream & SaaS UI  │
                      │    (http://0.0.0.0:8000 / Cloudflare)  │
                      └────────────────────────────────────────┘
```

---

## 5. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Runtime & Core** | Python 3.10+, Decimal Engine, Regular Expressions |
| **Backend API** | FastAPI, Uvicorn, Pydantic v2, Python-Multipart |
| **Database** | SQLite3 (Zero-dependency embedded relational store) |
| **Frontend UI** | HTML5, Tailwind CSS, FontAwesome 6, Vanilla ES6+ JavaScript |
| **Styling Aesthetic** | FinCore Dark-Mode, Ambient Cyber Grid, Glassmorphic Cards |
| **Sandboxed Execution**| Isolated AST / Function-level PythonREPLSandbox |
| **Tunneling & Hosting**| Cloudflare Tunnel (`cloudflared`) over HTTPS |

---

## 6. Directory Structure

```
fintech1/
├── README.md               # Production documentation & architectural specification
├── requirements.txt        # Backend dependencies (FastAPI, Uvicorn, Pydantic)
├── app.py                  # FastAPI REST server & telemetry event streaming
├── colosseum_agent.py      # Core Autonomous ColosseumAgent & 3 Owned Tools
├── pipeline.py             # Resilient ETL normalization, FX clamping & risk engines
├── database.py             # SQLite persistence, CRUD operations & schema initialization
├── index.html              # FinCore Enterprise dark-mode SaaS dashboard
├── antig_runner.py         # 63-test regression, integration & benchmark test runner
├── test_pipeline.py        # Pipeline unit test suite
├── run_task1_verification.py# Task 1 standalone verification runner
├── cloudflared.exe         # Cloudflare tunnel daemon binary
└── transactions.db         # Persistent SQLite financial ledger
```

---

## 7. Setup & Installation

### Prerequisites
- Python 3.10 or higher
- PowerShell, Bash, or Zsh terminal

### Local Quickstart

1. **Clone the repository and navigate into the workspace**:
   ```bash
   cd fintech1
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the complete test suite**:
   ```bash
   python antig_runner.py
   ```

4. **Start the FastAPI backend server**:
   ```bash
   python -m uvicorn app:app --host 0.0.0.0 --port 8000
   ```

5. **Open the web dashboard**:
   Open [http://localhost:8000](http://localhost:8000) in your browser.

### Public Cloudflare Tunnel Deployment

To serve the dashboard over a public HTTPS tunnel:
```powershell
.\cloudflared.exe tunnel --url http://localhost:8000
```
Capture the emitted `https://<subdomain>.trycloudflare.com` URL to access the dashboard from any device.

---

## 8. REST API Reference

### 1. Omni-Agent Intelligent Prompt
- **Endpoint**: `POST /api/agent/prompt`
- **Payload**:
  ```json
  { "prompt": "Paid 45 USD for Uber rides yesterday" }
  ```
- **Response (Ingestion)**:
  ```json
  {
    "action": "INGESTION",
    "intent": "INGESTION",
    "message": "Successfully ingested transaction NL_UBE_976DE56C: Uber (INR 3,757.50)",
    "transaction": {
      "transaction_id": "NL_UBE_976DE56C",
      "amount_inr": 3757.5,
      "currency": "USD",
      "merchant": "Uber",
      "category": "Travel & Transit",
      "timestamp": "2026-09-01T10:09:51Z"
    }
  }
  ```

### 2. Conversational Financial Analytics
- **Endpoint**: `POST /api/analytics/query`
- **Payload**:
  ```json
  { "query": "What is our total spend on cloud services?" }
  ```
- **Response**:
  ```json
  {
    "query": "What is my total spend on cloud services?",
    "answer": "Total spend on Cloud & SaaS services is ₹10,474.80 across 2 transactions.",
    "data": { "total_inr": 10474.8, "transactions": [...] }
  }
  ```

### 3. Real-Time Telemetry Stream
- **Endpoint**: `GET /api/agent/telemetry`
- **Description**: Returns live metrics for Task 1, Task 2, Spending Velocity, GST Reserve, Risk & Policy alerts, and circular terminal event logs.

### 4. Transactions CRUD
- `GET /api/transactions`: List stored transactions with pagination.
- `GET /api/transactions/{id}`: Retrieve single transaction details.
- `PUT /api/transactions/{id}`: Update an existing transaction.
- `DELETE /api/transactions/{id}`: Delete a transaction.
- `POST /api/transactions/seed`: Seed sample benchmark transactions.

### 5. Multi-Format Ledger Exporters
- `GET /api/export/csv`: Stream and download normalized ledger as CSV.
- `GET /api/export/json`: Stream and download normalized ledger as formatted JSON.

---

## 9. Verification & Test Suite

FinCore includes an automated regression test suite ([`antig_runner.py`](file:///c:/Users/itsme/antigravity-projects/fintech1/antig_runner.py)) verifying **63 test cases** across all components:

```bash
python antig_runner.py
```

```
================================================================================
  ANTIG_RUNNER: COMPLETE FINTECH SYSTEM REGRESSION & INTEGRATION SUITE
================================================================================
test_feature1_spending_velocity ... ok
test_feature2_category_distribution ... ok
test_feature8_duplicate_charge_identifier ... ok
test_feature9_velocity_anomaly_trigger ... ok
test_feature10_after_hours_ingestion ... ok
test_feature11_sanctioned_merchant_filter ... ok
test_feature17_gst_reserve_estimator ... ok
test_feature21_expense_policy_violation_scanner ... ok
test_feature23_free_form_financial_querying ... ok
test_feature27_csv_and_json_export_endpoints ... ok
test_omni_prompt_intent_routing_and_execution ... ok
test_dynamic_schema_drift_and_injection_stripping ... ok
test_null_merchant_notes_imputation_and_malformed_timestamps ... ok
test_stale_fx_rate_handling_and_clamping ... ok
test_task1_adversarial_batch_normalization ... ok
test_task2_cross_source_reconciliation ... ok
...
----------------------------------------------------------------------
Ran 63 tests in 2.904s

OK
================================================================================
  ALL ANTIG_RUNNER CHECKS PASSED (100% SUCCESSFUL)
================================================================================
```

---

## 10. Known Limitations & Future Roadmap

- **Distributed Queues**: SQLite handles single-process concurrency; future releases will add PostgreSQL and Redis stream backends for multi-node clustering.
- **ML Anomaly Scoring**: Upgrade static category limit thresholds to dynamic isolation forest anomaly detection models.
- **Multi-Tenant RBAC**: Add multi-tenant JWT authentication and enterprise audit trails.

---

## 11. Contributors & License

- **Developer**: Autonomous FinTech Engineering Team (Colosseum 2026)
- **License**: Licensed under the [MIT License](LICENSE).
