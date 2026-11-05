import sys
import os
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import uvicorn
from app.main import app


def backend_port(default: int = 8000) -> int:
    raw = os.environ.get("PESEBRERA3L_PORT", str(default))
    try:
        port = int(raw)
    except ValueError:
        return default
    if 1 <= port <= 65535:
        return port
    return default


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=backend_port(), log_level="info")