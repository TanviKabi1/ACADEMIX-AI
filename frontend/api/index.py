import sys
import os
from pathlib import Path

# Add the root directory and backend directory to the path
current_dir = Path(__file__).parent
root_dir = current_dir.parent.parent
backend_dir = root_dir / "backend"

sys.path.append(str(root_dir))
sys.path.append(str(backend_dir))

# Now import the app from backend.server
# This assumes server.py has 'app = FastAPI(...)'
from backend.server import app

# Export for Vercel
# Vercel looks for 'app' or 'handler' by default
handler = app
