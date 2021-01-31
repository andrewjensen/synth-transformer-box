import { ipcMain } from 'electron';

import { saveSettings, sendSettings, loadSettings } from './serial';

export function setupIpcHandlers() {
  ipcMain.handle('save-settings', async (event, settings) => {
    return await saveSettings(settings);
  });

  ipcMain.handle('send-settings', async (event, settings) => {
    return await sendSettings(settings);
  });

  ipcMain.handle('load-settings', async (event) => {
    return await loadSettings();
  });
}
