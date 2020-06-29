import { ipcMain } from 'electron';

import { saveSettings, loadSettings } from './serial';

export function setupIpcHandlers() {
  ipcMain.handle('save-settings', async (event, settings) => {
    return await saveSettings(settings);
  });

  ipcMain.handle('load-settings', async (event) => {
    return await loadSettings();
  });
}
