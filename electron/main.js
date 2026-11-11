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
  if (process.env.PESEBRERA3L_CONFIG) {
    return process.env.PESEBRERA3L_CONFIG;
  }
  return path.join(app.getPath("userData"), "config.json");
}

function backendsLogStream() {
  try {
    const logDir = app.getPath("userData");
    fs.mkdirSync(logDir, { recursive: true });
    return fs.openSync(path.join(logDir, "backend.log"), "a");
  } catch (error) {
    console.error("No se pudo abrir backend.log:", error);
    return null;
  }
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
  const dataDir =
    process.env.PESEBRERA3L_DATA || path.join(app.getPath("userData"), "data");
  const backupDir =
    process.env.PESEBRERA3L_BACKUP || path.join(app.getPath("userData"), "backups");
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
  const logStream = backendsLogStream();
  const options = Object.assign({}, command.options, {
    env: backendEnvironment(),
    stdio: ["ignore", logStream, logStream],
  });
  backendProcess = spawn(command.file, command.args, options);
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

async function invokeApi(request, retryCount) {
  const attempt = Number.isInteger(retryCount) ? retryCount : 0;
  const port = currentPort();
  const url = "http://" + BACKEND_HOST + ":" + port + request.path;
  let response;
  try {
    response = await fetch(url, {
      method: request.method || "GET",
      headers: { "Content-Type": "application/json" },
      body: request.body ? JSON.stringify(request.body) : undefined,
    });
  } catch (networkError) {
    const message = String(networkError && networkError.message ? networkError.message : networkError);
    const transient = /fetch failed|failed to fetch|ECONNREFUSED|timed out|network|socket/i.test(message);
    if (transient && attempt < 5) {
      await new Promise((resolve) => setTimeout(resolve, 800 + attempt * 800));
      return invokeApi(request, attempt + 1);
    }
    throw new Error(
      "No se pudo conectar con el backend en " + url +
      ". Revise el archivo backend.log en el directorio de datos de la app."
    );
  }
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
  win.webContents.on("did-fail-load", (event, code, description, url) => {
    console.error("did-fail-load:", code, description, url);
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