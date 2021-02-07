import { ipcMain } from 'electron';

import { sendSettings, loadSettings } from './serial';

export function setupIpcHandlers() {
  ipcMain.handle('send-settings', async (event, settings) => {
    return await sendSettings(settings);
  });

  ipcMain.handle('load-settings', async (event) => {
    return await loadSettings();
  });
}
