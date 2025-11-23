import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
import {
  initDb,
  getSetting,
  saveSetting,
  upsertDevice,
  getAllDevices,
  getDevice,
  updateDeviceStatus,
  savePersonality,
  getPersonality,
  updatePersonality,
  saveConversation,
  getConversations,
  clearConversations,
  saveModel,
  getModels,
  setActiveModel,
  getActiveModel,
  saveNetworkStat,
  getNetworkStats
} from './db'
import { PythonShell } from 'python-shell'

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')

let win: BrowserWindow | null
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    transparent: true,
    frame: false,
    hasShadow: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })
  console.log('Preload path:', path.join(__dirname, 'preload.js'));

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    if (process.env.DIST) {
      win.loadFile(path.join(process.env.DIST, 'index.html'))
    }
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  initDb();
  createWindow();

  // IPC Handlers
  ipcMain.handle('get-setting', (_event, key) => {
    return getSetting(key);
  });

  ipcMain.handle('save-setting', (_event, key, value) => {
    saveSetting(key, value);
    return true;
  });

  ipcMain.handle('start-host', (_event) => {
    console.log("Starting Host...");

    let scriptPath = path.join(__dirname, '../python_bridge/host.py');
    if (app.isPackaged) {
      scriptPath = path.join(process.resourcesPath, 'python_bridge/host.py');
    }

    // Use the system python or venv python. 
    // For now assuming 'python3' is available in path or use absolute path to venv python
    const pythonPath = 'python3';

    let pyshell = new PythonShell(scriptPath, {
      mode: 'text',
      pythonPath: pythonPath,
      pythonOptions: ['-u'], // get print results in real-time
      args: ['--model', 'Qwen/Qwen2.5-0.5B-Instruct']
    });

    pyshell.on('message', function (message) {
      // received a message sent from the Python script (a simple "print" statement)
      console.log(message);
      win?.webContents.send('log-update', message);
    });

    pyshell.end(function (err) {
      if (err) {
        console.error('Python Host Error:', err);
        win?.webContents.send('log-update', `ERROR: ${err.message}`);
      }
      console.log('Python Host finished');
      win?.webContents.send('log-update', 'Host process terminated.');
    });

    return "Host process initiated";
  });

  ipcMain.handle('start-client', (_event) => {
    console.log("Starting Client...");
    let scriptPath = path.join(__dirname, '../python_bridge/client.py');
    if (app.isPackaged) {
      scriptPath = path.join(process.resourcesPath, 'python_bridge/client.py');
    }
    const pythonPath = 'python3';

    // TODO: Get scheduler address from settings or UI
    const schedulerAddr = '127.0.0.1:8888';

    let pyshell = new PythonShell(scriptPath, {
      mode: 'text',
      pythonPath: pythonPath,
      pythonOptions: ['-u'],
      args: ['--scheduler-addr', schedulerAddr]
    });

    pyshell.on('message', function (message) {
      console.log(message);
      win?.webContents.send('log-update', message);
    });

    pyshell.end(function (err) {
      if (err) {
        console.error('Python Client Error:', err);
        win?.webContents.send('log-update', `ERROR: ${err.message}`);
      }
      console.log('Python Client finished');
      win?.webContents.send('log-update', 'Client process terminated.');
    });

    return "Client process initiated";
  });

  ipcMain.handle('start-voice', (_event) => {
    console.log("Starting Voice Assistant...");
    let scriptPath = path.join(__dirname, '../python_bridge/voice_assistant.py');
    if (app.isPackaged) {
      scriptPath = path.join(process.resourcesPath, 'python_bridge/voice_assistant.py');
    }
    const pythonPath = 'python3';

    let pyshell = new PythonShell(scriptPath, {
      mode: 'text',
      pythonPath: pythonPath,
      pythonOptions: ['-u'],
      args: []
    });

    pyshell.on('message', function (message) {
      console.log(message);
      if (message.startsWith('STATE:')) {
        win?.webContents.send('state-update', message.replace('STATE:', ''));
      } else if (message.startsWith('LOG:')) {
        win?.webContents.send('log-update', message.replace('LOG:', ''));
      } else {
        win?.webContents.send('log-update', message);
      }
    });

    pyshell.end(function (err) {
      if (err) {
        console.error('Voice Assistant Error:', err);
        win?.webContents.send('log-update', `ERROR: ${err.message}`);
      }
      win?.webContents.send('log-update', 'Voice Assistant terminated.');
      win?.webContents.send('state-update', 'IDLE');
    });

    return "Voice Assistant initiated";
  });

  ipcMain.handle('close-app', () => {
    app.quit();
  });

  // Network Discovery IPC Handlers
  let networkDiscoveryProcess: PythonShell | null = null;

  ipcMain.handle('start-network-discovery', (_event, deviceName, role, personality, model) => {
    console.log("Starting Network Discovery...");

    let scriptPath = path.join(__dirname, '../python_bridge/network_discovery.py');
    if (app.isPackaged) {
      scriptPath = path.join(process.resourcesPath, 'python_bridge/network_discovery.py');
    }

    const pythonPath = 'python3';

    networkDiscoveryProcess = new PythonShell(scriptPath, {
      mode: 'text',
      pythonPath: pythonPath,
      pythonOptions: ['-u'],
      args: [deviceName, role]
    });

    networkDiscoveryProcess.on('message', function (message) {
      console.log(message);
      win?.webContents.send('network-discovery-update', message);

      // Parse device updates and save to database
      if (message.startsWith('FOUND:') || message.startsWith('LOST:')) {
        try {
          const data = JSON.parse(message.substring(message.indexOf('{}')));
          if (message.startsWith('FOUND:')) {
            upsertDevice({
              device_id: data.name,
              name: data.name,
              address: data.address,
              port: data.port,
              role: data.role,
              status: 'online',
              personality: data.personality,
              model: data.model
            });
          } else {
            updateDeviceStatus(data.name, 'offline');
          }
          win?.webContents.send('devices-updated', getAllDevices());
        } catch (e) {
          console.error('Error parsing network discovery message:', e);
        }
      }
    });

    return "Network discovery initiated";
  });

  ipcMain.handle('stop-network-discovery', () => {
    if (networkDiscoveryProcess) {
      networkDiscoveryProcess.kill();
      networkDiscoveryProcess = null;
    }
    return "Network discovery stopped";
  });

  ipcMain.handle('get-all-devices', () => {
    return getAllDevices();
  });

  ipcMain.handle('get-device', (_event, deviceId) => {
    return getDevice(deviceId);
  });

  // Model Management IPC Handlers
  let modelManagerProcess: PythonShell | null = null;

  ipcMain.handle('browse-models', async (_event, task = 'text-generation', limit = 20) => {
    return new Promise((resolve, reject) => {
      let scriptPath = path.join(__dirname, '../python_bridge/model_manager.py');
      if (app.isPackaged) {
        scriptPath = path.join(process.resourcesPath, 'python_bridge/model_manager.py');
      }

      const pythonPath = 'python3';
      let output = '';

      const pyshell = new PythonShell(scriptPath, {
        mode: 'text',
        pythonPath: pythonPath,
        pythonOptions: ['-u'],
        args: ['browse', task, String(limit)]
      });

      pyshell.on('message', (message) => {
        output += message + '\n';
      });

      pyshell.end((err) => {
        if (err) {
          reject(err);
        } else {
          try {
            const models = JSON.parse(output);
            resolve(models);
          } catch (e) {
            reject(new Error('Failed to parse model list'));
          }
        }
      });
    });
  });

  ipcMain.handle('download-model', (_event, modelId) => {
    console.log(`Starting download of model: ${modelId}`);

    let scriptPath = path.join(__dirname, '../python_bridge/model_manager.py');
    if (app.isPackaged) {
      scriptPath = path.join(process.resourcesPath, 'python_bridge/model_manager.py');
    }

    const pythonPath = 'python3';

    modelManagerProcess = new PythonShell(scriptPath, {
      mode: 'text',
      pythonPath: pythonPath,
      pythonOptions: ['-u'],
      args: ['download', modelId]
    });

    modelManagerProcess.on('message', (message) => {
      console.log(message);
      win?.webContents.send('model-download-progress', message);
    });

    modelManagerProcess.end((err) => {
      if (!err) {
        // Save model to database
        saveModel({
          model_id: modelId,
          name: modelId.split('/').pop() || modelId,
          local_path: `~/.cache/spark-models/${modelId.replace('/', '_')}`
        });
        win?.webContents.send('model-download-complete', modelId);
      }
    });

    return "Model download initiated";
  });

  ipcMain.handle('get-local-models', () => {
    return getModels();
  });

  ipcMain.handle('set-active-model', (_event, modelId) => {
    setActiveModel(modelId);
    return getActiveModel();
  });

  ipcMain.handle('get-active-model', () => {
    return getActiveModel();
  });

  // Personality Management IPC Handlers
  ipcMain.handle('save-personality', (_event, personality) => {
    savePersonality(personality);
    return true;
  });

  ipcMain.handle('get-personality', (_event, deviceId) => {
    return getPersonality(deviceId);
  });

  ipcMain.handle('update-personality', (_event, id, updates) => {
    updatePersonality(id, updates);
    return true;
  });

  // Conversation Management IPC Handlers
  ipcMain.handle('save-conversation', (_event, deviceId, role, content) => {
    saveConversation(deviceId, role, content);
    return true;
  });

  ipcMain.handle('get-conversations', (_event, deviceId, limit) => {
    return getConversations(deviceId, limit);
  });

  ipcMain.handle('clear-conversations', (_event, deviceId) => {
    clearConversations(deviceId);
    return true;
  });

  // Network Stats IPC Handlers
  ipcMain.handle('save-network-stat', (_event, deviceId, metricName, metricValue) => {
    saveNetworkStat(deviceId, metricName, metricValue);
    return true;
  });

  ipcMain.handle('get-network-stats', (_event, deviceId, metricName, limit) => {
    return getNetworkStats(deviceId, metricName, limit);
  });
})
