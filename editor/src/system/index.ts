import { ipcMain } from 'electron';

import { saveSettings } from './serial';

export function setupIpcHandlers() {
  ipcMain.handle('save-settings', async (event, settings) => {
    return await saveSettings(settings);
  });
}
