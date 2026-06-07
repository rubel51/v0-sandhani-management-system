import { contextBridge, ipcRenderer } from 'electron';

const electronAPI = {
  // Patient operations
  patients: {
    list: () => ipcRenderer.invoke('patients:list'),
    get: (id: string) => ipcRenderer.invoke('patients:get', id),
    create: (patient: any) => ipcRenderer.invoke('patients:create', patient),
    update: (id: string, patient: any) => ipcRenderer.invoke('patients:update', id, patient),
    delete: (id: string) => ipcRenderer.invoke('patients:delete', id),
  },

  // Blood bag operations
  bloodBags: {
    list: () => ipcRenderer.invoke('bloodBags:list'),
    get: (id: string) => ipcRenderer.invoke('bloodBags:get', id),
    create: (bag: any) => ipcRenderer.invoke('bloodBags:create', bag),
    update: (id: string, bag: any) => ipcRenderer.invoke('bloodBags:update', id, bag),
    delete: (id: string) => ipcRenderer.invoke('bloodBags:delete', id),
  },

  // Settings operations
  settings: {
    get: (key: string) => ipcRenderer.invoke('settings:get', key),
    set: (key: string, value: string) => ipcRenderer.invoke('settings:set', key, value),
  },

  // File operations
  file: {
    export: (data: any, fileName: string) => ipcRenderer.invoke('file:export', data, fileName),
    import: () => ipcRenderer.invoke('file:import'),
    createBackup: () => ipcRenderer.invoke('backup:create'),
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

declare global {
  interface Window {
    electronAPI: typeof electronAPI;
  }
}
