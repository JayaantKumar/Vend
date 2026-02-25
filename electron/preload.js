const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('kioskAPI', {
  // We will expand this when connecting to the Raspberry Pi / MQTT
  sendHardwareCommand: (command, data) => ipcRenderer.send(command, data),
  onHardwareStatus: (callback) => ipcRenderer.on('hardware-status', (event, data) => callback(data)),
});