"use strict";
const electron = require("electron");
const path$1 = require("node:path");
const Database = require("better-sqlite3");
const path = require("path");
const require$$0 = require("events");
const require$$1 = require("child_process");
const require$$2 = require("os");
const require$$4 = require("stream");
const require$$5 = require("fs");
const require$$6 = require("util");
if (typeof electron === "string") {
  throw new TypeError("Not running in an Electron environment!");
}
const { env } = process;
const isEnvSet = "ELECTRON_IS_DEV" in env;
const getFromEnv = Number.parseInt(env.ELECTRON_IS_DEV, 10) === 1;
const isDev = isEnvSet ? getFromEnv : !electron.app.isPackaged;
const dbPath = isDev ? path.join(electron.app.getAppPath(), "spark.db") : path.join(electron.app.getPath("userData"), "spark.db");
const db = new Database(dbPath);
function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
    CREATE TABLE IF NOT EXISTS devices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      role TEXT,
      status TEXT,
      last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT,
      content TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  const stmt = db.prepare("SELECT value FROM settings WHERE key = ?");
  if (!stmt.get("assistant_name")) {
    const insert = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");
    insert.run("assistant_name", "Spark");
    insert.run("theme_color", "#00ffcc");
  }
}
function getSetting(key) {
  const stmt = db.prepare("SELECT value FROM settings WHERE key = ?");
  const row = stmt.get(key);
  return row ? row.value : null;
}
function saveSetting(key, value) {
  const stmt = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
  stmt.run(key, value);
}
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
var pythonShell = {};
var __awaiter = commonjsGlobal && commonjsGlobal.__awaiter || function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
Object.defineProperty(pythonShell, "__esModule", { value: true });
var PythonShell_1 = pythonShell.PythonShell = pythonShell.NewlineTransformer = pythonShell.PythonShellErrorWithLogs = pythonShell.PythonShellError = void 0;
const events_1 = require$$0;
const child_process_1 = require$$1;
const os_1 = require$$2;
const path_1 = path;
const stream_1 = require$$4;
const fs_1 = require$$5;
const util_1 = require$$6;
function toArray(source) {
  if (typeof source === "undefined" || source === null) {
    return [];
  } else if (!Array.isArray(source)) {
    return [source];
  }
  return source;
}
function extend(obj, ...args) {
  Array.prototype.slice.call(arguments, 1).forEach(function(source) {
    if (source) {
      for (let key in source) {
        obj[key] = source[key];
      }
    }
  });
  return obj;
}
function getRandomInt() {
  return Math.floor(Math.random() * 1e10);
}
const execPromise = (0, util_1.promisify)(child_process_1.exec);
class PythonShellError extends Error {
}
pythonShell.PythonShellError = PythonShellError;
class PythonShellErrorWithLogs extends PythonShellError {
}
pythonShell.PythonShellErrorWithLogs = PythonShellErrorWithLogs;
class NewlineTransformer extends stream_1.Transform {
  _transform(chunk, encoding, callback) {
    let data = chunk.toString();
    if (this._lastLineData)
      data = this._lastLineData + data;
    const lines = data.split(os_1.EOL);
    this._lastLineData = lines.pop();
    lines.forEach(this.push.bind(this));
    callback();
  }
  _flush(done) {
    if (this._lastLineData)
      this.push(this._lastLineData);
    this._lastLineData = null;
    done();
  }
}
pythonShell.NewlineTransformer = NewlineTransformer;
class PythonShell extends events_1.EventEmitter {
  /**
   * spawns a python process
   * @param scriptPath path to script. Relative to current directory or options.scriptFolder if specified
   * @param options
   * @param stdoutSplitter Optional. Splits stdout into chunks, defaulting to splitting into newline-seperated lines
   * @param stderrSplitter Optional. splits stderr into chunks, defaulting to splitting into newline-seperated lines
   */
  constructor(scriptPath, options, stdoutSplitter = null, stderrSplitter = null) {
    super();
    function resolve(type, val) {
      if (typeof val === "string") {
        return PythonShell[type][val];
      } else if (typeof val === "function") {
        return val;
      }
    }
    if (scriptPath.trim().length == 0)
      throw Error("scriptPath cannot be empty! You must give a script for python to run");
    let self2 = this;
    let errorData = "";
    events_1.EventEmitter.call(this);
    options = extend({}, PythonShell.defaultOptions, options);
    let pythonPath;
    if (!options.pythonPath) {
      pythonPath = PythonShell.defaultPythonPath;
    } else
      pythonPath = options.pythonPath;
    let pythonOptions = toArray(options.pythonOptions);
    let scriptArgs = toArray(options.args);
    this.scriptPath = (0, path_1.join)(options.scriptPath || "", scriptPath);
    this.command = pythonOptions.concat(this.scriptPath, scriptArgs);
    this.mode = options.mode || "text";
    this.formatter = resolve("format", options.formatter || this.mode);
    this.parser = resolve("parse", options.parser || this.mode);
    this.stderrParser = resolve("parse", options.stderrParser || "text");
    this.terminated = false;
    this.childProcess = (0, child_process_1.spawn)(pythonPath, this.command, options);
    ["stdout", "stdin", "stderr"].forEach(function(name) {
      self2[name] = self2.childProcess[name];
      self2.parser && self2[name] && self2[name].setEncoding(options.encoding || "utf8");
    });
    if (this.parser && this.stdout) {
      if (!stdoutSplitter)
        stdoutSplitter = new NewlineTransformer();
      stdoutSplitter.setEncoding(options.encoding || "utf8");
      this.stdout.pipe(stdoutSplitter).on("data", (chunk) => {
        this.emit("message", self2.parser(chunk));
      });
    }
    if (this.stderrParser && this.stderr) {
      if (!stderrSplitter)
        stderrSplitter = new NewlineTransformer();
      stderrSplitter.setEncoding(options.encoding || "utf8");
      this.stderr.pipe(stderrSplitter).on("data", (chunk) => {
        this.emit("stderr", self2.stderrParser(chunk));
      });
    }
    if (this.stderr) {
      this.stderr.on("data", function(data) {
        errorData += "" + data;
      });
      this.stderr.on("end", function() {
        self2.stderrHasEnded = true;
        terminateIfNeeded();
      });
    } else {
      self2.stderrHasEnded = true;
    }
    if (this.stdout) {
      this.stdout.on("end", function() {
        self2.stdoutHasEnded = true;
        terminateIfNeeded();
      });
    } else {
      self2.stdoutHasEnded = true;
    }
    this.childProcess.on("error", function(err) {
      self2.emit("error", err);
    });
    this.childProcess.on("exit", function(code, signal) {
      self2.exitCode = code;
      self2.exitSignal = signal;
      terminateIfNeeded();
    });
    function terminateIfNeeded() {
      if (!self2.stderrHasEnded || !self2.stdoutHasEnded || self2.exitCode == null && self2.exitSignal == null)
        return;
      let err;
      if (self2.exitCode && self2.exitCode !== 0) {
        if (errorData) {
          err = self2.parseError(errorData);
        } else {
          err = new PythonShellError("process exited with code " + self2.exitCode);
        }
        err = extend(err, {
          executable: pythonPath,
          options: pythonOptions.length ? pythonOptions : null,
          script: self2.scriptPath,
          args: scriptArgs.length ? scriptArgs : null,
          exitCode: self2.exitCode
        });
        if (self2.listeners("pythonError").length || !self2._endCallback) {
          self2.emit("pythonError", err);
        }
      }
      self2.terminated = true;
      self2.emit("close");
      self2._endCallback && self2._endCallback(err, self2.exitCode, self2.exitSignal);
    }
  }
  /**
   * checks syntax without executing code
   * @returns rejects promise w/ string error output if syntax failure
   */
  static checkSyntax(code) {
    return __awaiter(this, void 0, void 0, function* () {
      const randomInt = getRandomInt();
      const filePath = (0, os_1.tmpdir)() + path_1.sep + `pythonShellSyntaxCheck${randomInt}.py`;
      const writeFilePromise = (0, util_1.promisify)(fs_1.writeFile);
      return writeFilePromise(filePath, code).then(() => {
        return this.checkSyntaxFile(filePath);
      });
    });
  }
  static getPythonPath() {
    return this.defaultOptions.pythonPath ? this.defaultOptions.pythonPath : this.defaultPythonPath;
  }
  /**
   * checks syntax without executing code
   * @returns {Promise} rejects w/ stderr if syntax failure
   */
  static checkSyntaxFile(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
      const pythonPath = this.getPythonPath();
      let compileCommand = `${pythonPath} -m py_compile ${filePath}`;
      return execPromise(compileCommand);
    });
  }
  /**
   * Runs a Python script and returns collected messages as a promise.
   * If the promise is rejected, the err will probably be of type PythonShellErrorWithLogs
   * @param scriptPath   The path to the script to execute
   * @param options  The execution options
   */
  static run(scriptPath, options) {
    return new Promise((resolve, reject) => {
      let pyshell = new PythonShell(scriptPath, options);
      let output = [];
      pyshell.on("message", function(message) {
        output.push(message);
      }).end(function(err) {
        if (err) {
          err.logs = output;
          reject(err);
        } else
          resolve(output);
      });
    });
  }
  /**
   * Runs the inputted string of python code and returns collected messages as a promise. DO NOT ALLOW UNTRUSTED USER INPUT HERE!
   * @param code   The python code to execute
   * @param options  The execution options
   * @return a promise with the output from the python script
   */
  static runString(code, options) {
    const randomInt = getRandomInt();
    const filePath = os_1.tmpdir + path_1.sep + `pythonShellFile${randomInt}.py`;
    (0, fs_1.writeFileSync)(filePath, code);
    return PythonShell.run(filePath, options);
  }
  static getVersion(pythonPath) {
    if (!pythonPath)
      pythonPath = this.getPythonPath();
    return execPromise(pythonPath + " --version");
  }
  static getVersionSync(pythonPath) {
    if (!pythonPath)
      pythonPath = this.getPythonPath();
    return (0, child_process_1.execSync)(pythonPath + " --version").toString();
  }
  /**
   * Parses an error thrown from the Python process through stderr
   * @param  {string|Buffer} data The stderr contents to parse
   * @return {Error} The parsed error with extended stack trace when traceback is available
   */
  parseError(data) {
    let text = "" + data;
    let error;
    if (/^Traceback/.test(text)) {
      let lines = text.trim().split(os_1.EOL);
      let exception = lines.pop();
      error = new PythonShellError(exception);
      error.traceback = data;
      error.stack += os_1.EOL + "    ----- Python Traceback -----" + os_1.EOL + "  ";
      error.stack += lines.slice(1).join(os_1.EOL + "  ");
    } else {
      error = new PythonShellError(text);
    }
    return error;
  }
  /**
   * Sends a message to the Python shell through stdin
   * Override this method to format data to be sent to the Python process
   * @returns {PythonShell} The same instance for chaining calls
   */
  send(message) {
    if (!this.stdin)
      throw new Error("stdin not open for writing");
    let data = this.formatter ? this.formatter(message) : message;
    if (this.mode !== "binary")
      data += os_1.EOL;
    this.stdin.write(data);
    return this;
  }
  /**
   * Closes the stdin stream. Unless python is listening for stdin in a loop
   * this should cause the process to finish its work and close.
   * @returns {PythonShell} The same instance for chaining calls
   */
  end(callback) {
    if (this.childProcess.stdin) {
      this.childProcess.stdin.end();
    }
    this._endCallback = callback;
    return this;
  }
  /**
   * Sends a kill signal to the process
   * @returns {PythonShell} The same instance for chaining calls
   */
  kill(signal) {
    this.terminated = this.childProcess.kill(signal);
    return this;
  }
  /**
   * Alias for kill.
   * @deprecated
   */
  terminate(signal) {
    return this.kill(signal);
  }
}
PythonShell_1 = pythonShell.PythonShell = PythonShell;
PythonShell.defaultPythonPath = process.platform != "win32" ? "python3" : "python";
PythonShell.defaultOptions = {};
PythonShell.format = {
  text: function toText(data) {
    if (!data)
      return "";
    else if (typeof data !== "string")
      return data.toString();
    return data;
  },
  json: function toJson(data) {
    return JSON.stringify(data);
  }
};
PythonShell.parse = {
  text: function asText(data) {
    return data;
  },
  json: function asJson(data) {
    return JSON.parse(data);
  }
};
process.env.DIST = path$1.join(__dirname, "../dist");
process.env.VITE_PUBLIC = electron.app.isPackaged ? process.env.DIST : path$1.join(process.env.DIST, "../public");
let win;
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
function createWindow() {
  win = new electron.BrowserWindow({
    width: 800,
    height: 600,
    transparent: true,
    frame: false,
    hasShadow: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: path$1.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });
  console.log("Preload path:", path$1.join(__dirname, "preload.js"));
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    if (process.env.DIST) {
      win.loadFile(path$1.join(process.env.DIST, "index.html"));
    }
  }
}
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.app.on("activate", () => {
  if (electron.BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
electron.app.whenReady().then(() => {
  initDb();
  createWindow();
  electron.ipcMain.handle("get-setting", (_event, key) => {
    return getSetting(key);
  });
  electron.ipcMain.handle("save-setting", (_event, key, value) => {
    saveSetting(key, value);
    return true;
  });
  electron.ipcMain.handle("start-host", (_event) => {
    console.log("Starting Host...");
    let scriptPath = path$1.join(__dirname, "../python_bridge/host.py");
    if (electron.app.isPackaged) {
      scriptPath = path$1.join(process.resourcesPath, "python_bridge/host.py");
    }
    const pythonPath = "python3";
    let pyshell = new PythonShell_1(scriptPath, {
      mode: "text",
      pythonPath,
      pythonOptions: ["-u"],
      // get print results in real-time
      args: ["--model", "Qwen/Qwen2.5-0.5B-Instruct"]
    });
    pyshell.on("message", function(message) {
      console.log(message);
      win == null ? void 0 : win.webContents.send("log-update", message);
    });
    pyshell.end(function(err) {
      if (err) {
        console.error("Python Host Error:", err);
        win == null ? void 0 : win.webContents.send("log-update", `ERROR: ${err.message}`);
      }
      console.log("Python Host finished");
      win == null ? void 0 : win.webContents.send("log-update", "Host process terminated.");
    });
    return "Host process initiated";
  });
  electron.ipcMain.handle("start-client", (_event) => {
    console.log("Starting Client...");
    let scriptPath = path$1.join(__dirname, "../python_bridge/client.py");
    if (electron.app.isPackaged) {
      scriptPath = path$1.join(process.resourcesPath, "python_bridge/client.py");
    }
    const pythonPath = "python3";
    const schedulerAddr = "127.0.0.1:8888";
    let pyshell = new PythonShell_1(scriptPath, {
      mode: "text",
      pythonPath,
      pythonOptions: ["-u"],
      args: ["--scheduler-addr", schedulerAddr]
    });
    pyshell.on("message", function(message) {
      console.log(message);
      win == null ? void 0 : win.webContents.send("log-update", message);
    });
    pyshell.end(function(err) {
      if (err) {
        console.error("Python Client Error:", err);
        win == null ? void 0 : win.webContents.send("log-update", `ERROR: ${err.message}`);
      }
      console.log("Python Client finished");
      win == null ? void 0 : win.webContents.send("log-update", "Client process terminated.");
    });
    return "Client process initiated";
  });
  electron.ipcMain.handle("start-voice", (_event) => {
    console.log("Starting Voice Assistant...");
    let scriptPath = path$1.join(__dirname, "../python_bridge/voice_assistant.py");
    if (electron.app.isPackaged) {
      scriptPath = path$1.join(process.resourcesPath, "python_bridge/voice_assistant.py");
    }
    const pythonPath = "python3";
    let pyshell = new PythonShell_1(scriptPath, {
      mode: "text",
      pythonPath,
      pythonOptions: ["-u"],
      args: []
    });
    pyshell.on("message", function(message) {
      console.log(message);
      if (message.startsWith("STATE:")) {
        win == null ? void 0 : win.webContents.send("state-update", message.replace("STATE:", ""));
      } else if (message.startsWith("LOG:")) {
        win == null ? void 0 : win.webContents.send("log-update", message.replace("LOG:", ""));
      } else {
        win == null ? void 0 : win.webContents.send("log-update", message);
      }
    });
    pyshell.end(function(err) {
      if (err) {
        console.error("Voice Assistant Error:", err);
        win == null ? void 0 : win.webContents.send("log-update", `ERROR: ${err.message}`);
      }
      win == null ? void 0 : win.webContents.send("log-update", "Voice Assistant terminated.");
      win == null ? void 0 : win.webContents.send("state-update", "IDLE");
    });
    return "Voice Assistant initiated";
  });
  electron.ipcMain.handle("close-app", () => {
    electron.app.quit();
  });
});
