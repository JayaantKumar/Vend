// electron/main.js
const { app, BrowserWindow } = require('electron');

function createKioskWindow() {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    kiosk: true, // This makes it full screen like your previous project
    autoHideMenuBar: true,
    alwaysOnTop: true, 
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // This directly loads your Vite React frontend!
  win.loadURL('http://localhost:5173');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});