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
    stopVoice: () => Promise<string>
    closeApp: () => Promise<void>

    // Network Discovery
    startNetworkDiscovery: (deviceName: string, role: string, personality: string, model: string) => Promise<string>
    stopNetworkDiscovery: () => Promise<string>
    getAllDevices: () => Promise<any[]>
    getDevice: (deviceId: string) => Promise<any>

    // Model Management
    browseModels: (task?: string, limit?: number) => Promise<any[]>
    downloadModel: (modelId: string) => Promise<any>
    getLocalModels: () => Promise<any[]>
    setActiveModel: (modelId: string) => Promise<boolean>
    getActiveModel: () => Promise<string | null>

    // Personality Management
    savePersonality: (personality: any) => Promise<any>
    getPersonality: (deviceId: string) => Promise<any>
    updatePersonality: (id: number, updates: any) => Promise<any>

    // Conversation Management
    saveConversation: (deviceId: string, role: string, content: string) => Promise<any>
    getConversations: (deviceId: string, limit?: number) => Promise<any[]>
    clearConversations: (deviceId: string) => Promise<boolean>
  }
}
