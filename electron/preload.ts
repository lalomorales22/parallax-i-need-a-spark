import { ipcRenderer, contextBridge } from 'electron'

console.log('Preload script loaded');

// --------- Expose some API to the Renderer process ---------
try {
  contextBridge.exposeInMainWorld('ipcRenderer', {
    on(...args: Parameters<typeof ipcRenderer.on>) {
      const [channel, listener] = args
      ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
    },
    off(...args: Parameters<typeof ipcRenderer.off>) {
      const [channel, ...omit] = args
      ipcRenderer.off(channel, ...omit)
    },
    send(...args: Parameters<typeof ipcRenderer.send>) {
      const [channel, ...omit] = args
      ipcRenderer.send(channel, ...omit)
    },
    invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
      const [channel, ...omit] = args
      return ipcRenderer.invoke(channel, ...omit)
    },
    // Specific APIs
    getSetting: (key: string) => ipcRenderer.invoke('get-setting', key),
    saveSetting: (key: string, value: string) => ipcRenderer.invoke('save-setting', key, value),
    getSparkMode: () => ipcRenderer.invoke('get-spark-mode'),
    getParallaxHost: () => ipcRenderer.invoke('get-parallax-host'),
    startHost: () => ipcRenderer.invoke('start-host'),
    startClient: () => ipcRenderer.invoke('start-client'),
    startVoice: () => ipcRenderer.invoke('start-voice'),
    closeApp: () => ipcRenderer.invoke('close-app'),

    // Network Discovery
    startNetworkDiscovery: (deviceName: string, role: string, personality: string, model: string) =>
      ipcRenderer.invoke('start-network-discovery', deviceName, role, personality, model),
    stopNetworkDiscovery: () => ipcRenderer.invoke('stop-network-discovery'),
    getAllDevices: () => ipcRenderer.invoke('get-all-devices'),
    getDevice: (deviceId: string) => ipcRenderer.invoke('get-device', deviceId),

    // Model Management
    browseModels: (task?: string, limit?: number) => ipcRenderer.invoke('browse-models', task, limit),
    downloadModel: (modelId: string) => ipcRenderer.invoke('download-model', modelId),
    getLocalModels: () => ipcRenderer.invoke('get-local-models'),
    setActiveModel: (modelId: string) => ipcRenderer.invoke('set-active-model', modelId),
    getActiveModel: () => ipcRenderer.invoke('get-active-model'),

    // Personality Management
    savePersonality: (personality: any) => ipcRenderer.invoke('save-personality', personality),
    getPersonality: (deviceId: string) => ipcRenderer.invoke('get-personality', deviceId),
    updatePersonality: (id: number, updates: any) => ipcRenderer.invoke('update-personality', id, updates),

    // Conversation Management
    saveConversation: (deviceId: string, role: string, content: string) =>
      ipcRenderer.invoke('save-conversation', deviceId, role, content),
    getConversations: (deviceId: string, limit?: number) =>
      ipcRenderer.invoke('get-conversations', deviceId, limit),
    clearConversations: (deviceId: string) => ipcRenderer.invoke('clear-conversations', deviceId),

    // Network Stats
    saveNetworkStat: (deviceId: string, metricName: string, metricValue: number) =>
      ipcRenderer.invoke('save-network-stat', deviceId, metricName, metricValue),
    getNetworkStats: (deviceId: string, metricName: string, limit?: number) =>
      ipcRenderer.invoke('get-network-stats', deviceId, metricName, limit),
  })
  console.log('contextBridge exposed successfully');
} catch (error) {
  console.error('Failed to expose contextBridge:', error);
}
