# Construye el ejecutable backend con PyInstaller (entrega: dist/pesebrera3l-backend.exe)
python -m pip install pyinstaller
python -m PyInstaller --noconfirm --clean --onefile --name pesebrera3l-backend `
  --hidden-import uvicorn.logging `
  --hidden-import uvicorn.loops.auto `
  --hidden-import uvicorn.protocols.http.auto `
  --hidden-import uvicorn.protocols.websockets.auto `
  --hidden-import uvicorn.lifespan.on `
  --paths "$PSScriptRoot\..\backend" `
  "$PSScriptRoot\..\backend\run_server.py"