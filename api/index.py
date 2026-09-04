import os
import sys
import importlib.util

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

app_file_path = os.path.join(ROOT_DIR, "app.py")
spec = importlib.util.spec_from_file_location("root_app", app_file_path)
root_app = importlib.util.module_from_spec(spec)
sys.modules["root_app"] = root_app
spec.loader.exec_module(root_app)

app = root_app.app