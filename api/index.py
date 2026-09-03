"""
Vercel Serverless Entrypoint for FinCore Autonomous FinTech Suite.
Exposes the FastAPI application instance for @vercel/python runtime.
"""

import sys
import os

# Add parent project root directory to sys.path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from app import app
from database import init_db, seed_feed

# Ensure database is initialized in serverless environment
try:
    init_db()
    seed_feed()
except Exception as e:
    print(f"[Vercel Init Warning] Database initialization: {e}")
