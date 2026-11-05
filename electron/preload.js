const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  invokeApi: (request) => ipcRenderer.invoke("api:invoke", request),
});