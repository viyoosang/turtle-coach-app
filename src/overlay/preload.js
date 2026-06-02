const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('turtle', {
  onPosture: (cb) => ipcRenderer.on('posture-update', (_e, payload) => cb(payload)),
  onStatus:  (cb) => ipcRenderer.on('detector-status', (_e, payload) => cb(payload))
});
