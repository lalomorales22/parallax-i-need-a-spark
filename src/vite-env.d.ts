/// <reference types="vite/client" />

interface Window {
  ipcRenderer: {
    on: (channel: string, listener: (event: any, ...args: any[]) => void) => void
    off: (channel: string, ...args: any[]) => void
    send: (channel: string, ...args: any[]) => void
    invoke: (channel: string, ...args: any[]) => Promise<any>
    getSetting: (key: string) => Promise<string | null>
    saveSetting: (key: string, value: string) => Promise<boolean>
    startHost: () => Promise<string>
    startClient: () => Promise<string>
    startVoice: () => Promise<string>
    closeApp: () => Promise<void>
  }
}
