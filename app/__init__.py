"""
Export app from main module for ASGI server loaders (e.g. uvicorn app:app).
"""
import os
import sys

# Add parent directory to path if needed
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

try:
    import importlib.util
    app_file = os.path.join(parent_dir, "app.py")
    if os.path.exists(app_file):
        spec = importlib.util.spec_from_file_location("main_app", app_file)
        main_app = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(main_app)
        app = getattr(main_app, "app", None)
except Exception:
    app = None
