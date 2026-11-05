const { app, BrowserWindow, ipcMain } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const { normalizePort, DEFAULT_PORT } = require("./lib/port.js");

const BACKEND_HOST = "127.0.0.1";
const isDev = !app.isPackaged;

let backendProcess = null;
let config = { port: DEFAULT_PORT };

function configFilePath() {
  return path.join(app.getPath("userData"), "config.json");
}

function loadConfig() {
  try {
    const raw = fs.readFileSync(configFilePath(), "utf8");
    const parsed = JSON.parse(raw);
    config = { port: normalizePort(parsed.port, DEFAULT_PORT) };
  } catch (error) {
    config = { port: DEFAULT_PORT };
  }
}

function saveConfig() {
  try {
    fs.mkdirSync(path.dirname(configFilePath()), { recursive: true });
    fs.writeFileSync(configFilePath(), JSON.stringify(config, null, 2));
  } catch (error) {
    console.error("No se pudo guardar la configuracion:", error);
  }
}

function currentPort() {
  return normalizePort(config.port, DEFAULT_PORT);
}

function backendDir() {
  if (isDev) {
    return path.join(__dirname, "..", "backend");
  }
  return path.join(process.resourcesPath, "backend");
}

function backendCommand() {
  const port = currentPort();
  if (isDev) {
    return {
      file: "python",
      args: ["-m", "uvicorn", "app.main:app", "--app-dir", backendDir(), "--host", BACKEND_HOST, "--port", String(port)],
      options: { cwd: backendDir() },
    };
  }
  return {
    file: path.join(process.resourcesPath, "backend", "pesebrera3l-backend.exe"),
    args: [],
    options: {},
  };
}

function backendEnvironment() {
  const dataDir = path.join(app.getPath("userData"), "data");
  const backupDir = path.join(app.getPath("userData"), "backups");
  return Object.assign({}, process.env, {
    PESEBRERA3L_PORT: String(currentPort()),
    PESEBRERA3L_DATA: dataDir,
    PESEBRERA3L_BACKUP: backupDir,
  });
}

function startBackend() {
  if (backendProcess) {
    return;
  }
  const command = backendCommand();
  backendProcess = spawn(command.file, command.args, Object.assign({}, command.options, {
    env: backendEnvironment(),
    stdio: "ignore",
  }));
  backendProcess.on("error", (error) => console.error("Backend Python no pudo iniciarse:", error));
}

function stopBackend() {
  const current = backendProcess;
  backendProcess = null;
  if (current) {
    try {
      current.kill();
    } catch (error) {
      console.error("Error al detener el backend:", error);
    }
  }
}

function restartBackend() {
  stopBackend();
  return new Promise((resolve) => {
    setTimeout(() => {
      startBackend();
      resolve(currentPort());
    }, 600);
  });
}

async function invokeApi(request) {
  const response = await fetch("http://" + BACKEND_HOST + ":" + currentPort() + request.path, {
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
  loadConfig();
  createWindow();
  startBackend();
});

app.on("will-quit", () => {
  stopBackend();
});

ipcMain.handle("api:invoke", async (event, request) => {
  return await invokeApi(request);
});

ipcMain.handle("settings:get", async () => {
  return { port: currentPort() };
});

ipcMain.handle("settings:set", async (event, settings) => {
  const nextPort = normalizePort(settings && settings.port, DEFAULT_PORT);
  if (nextPort === currentPort()) {
    return { port: nextPort, changed: false };
  }
  config = { port: nextPort };
  saveConfig();
  await restartBackend();
  return { port: nextPort, changed: true };
});

app.on("window-all-closed", () => {
  app.quit();
});