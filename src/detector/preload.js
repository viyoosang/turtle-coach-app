const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('turtle', {
  sendPosture: (payload) => ipcRenderer.send('posture-update', payload),
  sendStatus:  (payload) => ipcRenderer.send('detector-status', payload)
});
