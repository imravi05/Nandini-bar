import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { fork } from 'child_process';
import fs from 'fs';
import dotenv from 'dotenv';

// Resolve directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
let backendProcess = null;

async function initializeDatabase(dbPath, appRoot) {
  if (isDev) return;

  const { execSync } = await import('child_process');
  // In production, everything executed must be in the unpacked directory
  const unpackedRoot = path.join(process.resourcesPath, 'app.asar.unpacked');
  const prismaPath = path.join(unpackedRoot, 'node_modules', 'prisma', 'build', 'index.js');
  const schemaPath = path.join(unpackedRoot, 'backend', 'prisma', 'schema.prisma');

  const logPath = path.join(app.getPath('userData'), 'backend-log.txt');
  fs.appendFileSync(logPath, `Init DB: dbPath=${dbPath}\nprismaPath=${prismaPath}\nschemaPath=${schemaPath}\n`);

  try {
    if (!fs.existsSync(prismaPath)) {
      fs.appendFileSync(logPath, `ERROR: Prisma not found at ${prismaPath}\n`);
      return;
    }

    execSync(`node "${prismaPath}" db push --schema="${schemaPath}" --accept-data-loss`, {
      env: {
        ...process.env,
        DATABASE_URL: `file:${dbPath}`,
      },
    });
    fs.appendFileSync(logPath, 'Database initialized successfully.\n');
  } catch (error) {
    fs.appendFileSync(logPath, `Database init failed: ${error.message}\n${error.stack}\n`);
  }
}

async function startBackend() {
  const unpackedRoot = isDev ? path.join(__dirname, '..') : path.join(process.resourcesPath, 'app.asar.unpacked');
  const backendPath = path.join(unpackedRoot, 'backend', 'server.js');
  
  const dbPath = isDev 
    ? path.join(__dirname, '..', 'backend', 'dev.db')
    : path.join(app.getPath('userData'), 'database.db');

  const logPath = path.join(app.getPath('userData'), 'backend-log.txt');
  fs.writeFileSync(logPath, `Starting Backend at ${new Date().toISOString()}\n`);
  fs.appendFileSync(logPath, `backendPath: ${backendPath}\n`);

  if (!isDev) {
    if (!fs.existsSync(app.getPath('userData'))) {
      fs.mkdirSync(app.getPath('userData'), { recursive: true });
    }
    await initializeDatabase(dbPath, unpackedRoot);
  }

  const env = {
    ...process.env,
    NODE_ENV: isDev ? 'development' : 'production',
    PORT: 5000,
    JWT_SECRET: process.env.JWT_SECRET || 'supersecretkey',
    DATABASE_URL: `file:${dbPath}`,
    REPORTS_DIR: path.join(app.getPath('userData'), 'reports'),
  };

  backendProcess = fork(backendPath, [], { 
    env, 
    silent: true // Capture output
  });

  backendProcess.stdout.on('data', (data) => {
    fs.appendFileSync(logPath, `Backend STDOUT: ${data}\n`);
  });

  backendProcess.stderr.on('data', (data) => {
    fs.appendFileSync(logPath, `Backend STDERR: ${data}\n`);
  });

  backendProcess.on('exit', (code) => {
    fs.appendFileSync(logPath, `Backend exited with code ${code}\n`);
  });
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (isDev && process.env.FRONTEND_URL) {
    mainWindow.loadURL(process.env.FRONTEND_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../frontend/dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  return mainWindow;
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const allWindows = BrowserWindow.getAllWindows();
    if (allWindows.length > 0) {
      if (allWindows[0].isMinimized()) allWindows[0].restore();
      allWindows[0].focus();
    }
  });

  app.whenReady().then(async () => {
    if (!isDev) {
      await startBackend();
    }
    
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('quit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});

ipcMain.on('toMain', (event, arg) => {
  console.log('Message from renderer:', arg);
});

