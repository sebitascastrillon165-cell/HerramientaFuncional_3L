const { app, BrowserWindow, ipcMain } = require("electron");
const { spawn } = require("child_process");
const path = require("path");

const BACKEND_HOST = "127.0.0.1";
const BACKEND_PORT = 8000;
const isDev = !app.isPackaged;

let backendProcess = null;

function backendDir() {
  if (isDev) {
    return path.join(__dirname, "..", "backend");
  }
  return path.join(process.resourcesPath, "backend");
}

function backendCommand() {
  if (isDev) {
    return {
      file: "python",
      args: ["-m", "uvicorn", "app.main:app", "--app-dir", backendDir(), "--host", BACKEND_HOST, "--port", String(BACKEND_PORT)],
      options: { cwd: backendDir() },
    };
  }
  return {
    file: path.join(process.resourcesPath, "backend", "pesebrera3l-backend.exe"),
    args: [],
    options: {},
  };
}

function startBackend() {
  if (backendProcess) {
    return;
  }
  const command = backendCommand();
  const backendEnv = Object.assign({}, process.env, {
    PESEBRERA3L_DATA: path.join(app.getPath("userData"), "data"),
    PESEBRERA3L_BACKUP: path.join(app.getPath("userData"), "backups"),
  });
  backendProcess = spawn(command.file, command.args, Object.assign({}, command.options, {
    env: backendEnv,
    stdio: "ignore",
  }));
  backendProcess.on("error", (error) => console.error("Backend Python no pudo iniciarse:", error));
}

function stopBackend() {
  if (backendProcess) {
    try {
      backendProcess.kill();
    } catch (error) {
      console.error("Error al detener el backend:", error);
    }
    backendProcess = null;
  }
}

async function invokeApi(request) {
  const response = await fetch("http://" + BACKEND_HOST + ":" + BACKEND_PORT + request.path, {
    method: request.method || "GET",
    headers: { "Content-Type": "application/json" },
    body: request.body ? JSON.stringify(request.body) : undefined,
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || response.statusText);
  }
  if (response.status === 204) {
    return null;
  }
  return await response.json();
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.loadFile(path.join(__dirname, "renderer", "index.html"));
}

app.whenReady().then(() => {
  createWindow();
  startBackend();
});

app.on("will-quit", () => {
  stopBackend();
});

ipcMain.handle("api:invoke", async (event, request) => {
  return await invokeApi(request);
});

app.on("window-all-closed", () => {
  app.quit();
});