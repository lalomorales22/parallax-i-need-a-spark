import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
import { initDb, getSetting, saveSetting } from './db'
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
})
