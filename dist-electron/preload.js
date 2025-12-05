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
    closeApp: () => electron.ipcRenderer.invoke("close-app"),
    // Network Discovery
    startNetworkDiscovery: (deviceName, role, personality, model) => electron.ipcRenderer.invoke("start-network-discovery", deviceName, role, personality, model),
    stopNetworkDiscovery: () => electron.ipcRenderer.invoke("stop-network-discovery"),
    getAllDevices: () => electron.ipcRenderer.invoke("get-all-devices"),
    getDevice: (deviceId) => electron.ipcRenderer.invoke("get-device", deviceId),
    // Model Management
    browseModels: (task, limit) => electron.ipcRenderer.invoke("browse-models", task, limit),
    downloadModel: (modelId) => electron.ipcRenderer.invoke("download-model", modelId),
    getLocalModels: () => electron.ipcRenderer.invoke("get-local-models"),
    setActiveModel: (modelId) => electron.ipcRenderer.invoke("set-active-model", modelId),
    getActiveModel: () => electron.ipcRenderer.invoke("get-active-model"),
    // Personality Management
    savePersonality: (personality) => electron.ipcRenderer.invoke("save-personality", personality),
    getPersonality: (deviceId) => electron.ipcRenderer.invoke("get-personality", deviceId),
    updatePersonality: (id, updates) => electron.ipcRenderer.invoke("update-personality", id, updates),
    // Conversation Management
    saveConversation: (deviceId, role, content) => electron.ipcRenderer.invoke("save-conversation", deviceId, role, content),
    getConversations: (deviceId, limit) => electron.ipcRenderer.invoke("get-conversations", deviceId, limit),
    clearConversations: (deviceId) => electron.ipcRenderer.invoke("clear-conversations", deviceId),
    // Network Stats
    saveNetworkStat: (deviceId, metricName, metricValue) => electron.ipcRenderer.invoke("save-network-stat", deviceId, metricName, metricValue),
    getNetworkStats: (deviceId, metricName, limit) => electron.ipcRenderer.invoke("get-network-stats", deviceId, metricName, limit)
  });
  console.log("contextBridge exposed successfully");
} catch (error) {
  console.error("Failed to expose contextBridge:", error);
}
