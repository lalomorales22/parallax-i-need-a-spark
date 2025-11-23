"use strict";
const electron = require("electron");
console.log("Preload script loaded");
try {
  electron.contextBridge.exposeInMainWorld("ipcRenderer", {
    on(...args) {
      const [channel, listener] = args;
      electron.ipcRenderer.on(channel, (event, ...args2) => listener(event, ...args2));
    },
    off(...args) {
      const [channel, ...omit] = args;
      electron.ipcRenderer.off(channel, ...omit);
    },
    send(...args) {
      const [channel, ...omit] = args;
      electron.ipcRenderer.send(channel, ...omit);
    },
    invoke(...args) {
      const [channel, ...omit] = args;
      return electron.ipcRenderer.invoke(channel, ...omit);
    },
    // Specific APIs
    getSetting: (key) => electron.ipcRenderer.invoke("get-setting", key),
    saveSetting: (key, value) => electron.ipcRenderer.invoke("save-setting", key, value),
    startHost: () => electron.ipcRenderer.invoke("start-host"),
    startClient: () => electron.ipcRenderer.invoke("start-client"),
    startVoice: () => electron.ipcRenderer.invoke("start-voice"),
    closeApp: () => electron.ipcRenderer.invoke("close-app")
  });
  console.log("contextBridge exposed successfully");
} catch (error) {
  console.error("Failed to expose contextBridge:", error);
}
