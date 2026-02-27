const { app, BrowserWindow } = require('electron');

function createWindow() {
  // Create the browser window configured for a Kiosk
  const win = new BrowserWindow({
    width: 1080,
    height: 1920,
    kiosk: true,        // Locks the app into full screen (prevents users from exiting)
    fullscreen: true,   // Fills the entire screen
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
    }
  });

  // Point Electron to your running Vite React Frontend
  win.loadURL('http://localhost:5173'); 
  
  // Optional: Open DevTools for debugging (Comment this out in production)
  // win.webContents.openDevTools();
}

// Wait until Electron is ready, then create the window
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});