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
    startHost: () => ipcRenderer.invoke('start-host'),
    startClient: () => ipcRenderer.invoke('start-client'),
    startVoice: () => ipcRenderer.invoke('start-voice'),
    closeApp: () => ipcRenderer.invoke('close-app'),
  })
  console.log('contextBridge exposed successfully');
} catch (error) {
  console.error('Failed to expose contextBridge:', error);
}
