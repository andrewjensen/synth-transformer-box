import {
  SettingsAction,
  settingsReducer,
  SettingsState,
  INITIAL_STATE,
} from '../settingsReducer';

describe('settingsReducer', () => {
  it('sets initial default controller rows and columns', () => {
    expect(INITIAL_STATE.controllerRows).toBe(2);
    expect(INITIAL_STATE.controllerColumns).toBe(4);
  });

  describe('importing settings', () => {
    it('sets the controller and preset settings correctly', () => {
      const action: SettingsAction = {
        type: 'IMPORT_SETTINGS',
        settings: {
          controllerRows: 1,
          controllerColumns: 6,
          presets: [
            {
              // roland_ju_06
              synthId: 5,
              channel: 7,
              mappings: [
                { in: 2, out: 74 },
                { in: 4, out: 1 },
                { in: 6, out: 3 },
                { in: 8, out: 5 },
                { in: 10, out: 9 },
                { in: 12, out: 11 },
              ]
            }
          ]
        }
      };
      const newState = settingsReducer(INITIAL_STATE, action);

      expect(newState.controllerRows).toBe(1);
      expect(newState.controllerColumns).toBe(6);
      expect(newState.inputCCs).toEqual([2, 4, 6, 8, 10, 12]);
      expect(newState.presets).toEqual([
        {
          synthId: 5,
          channel: 7,
          mappings: [
            { in: 2, out: 74 },
            { in: 4, out: 1 },
            { in: 6, out: 3 },
            { in: 8, out: 5 },
            { in: 10, out: 9 },
            { in: 12, out: 11 },
          ]
        }
      ]);
    });
  });

  describe('controller settings', () => {
    it('adds mappings to each preset when the controller size increases', () => {
      const previousState: SettingsState = {
        controllerRows: 1,
        controllerColumns: 6,
        inputCCs: [2, 4, 6, 8, 10, 12],
        presets: [
          {
            // roland_ju_06
            synthId: 5,
            channel: 7,
            mappings: [
              { in: 2, out: 74 },
              { in: 4, out: 1 },
              { in: 6, out: 3 },
              { in: 8, out: 5 },
              { in: 10, out: 9 },
              { in: 12, out: 11 },
            ]
          },
          {
            // akai_ax80_tauntek
            synthId: 4,
            channel: 3,
            mappings: [
              { in: 2, out: 78 },
              { in: 4, out: 65 },
              { in: 6, out: 66 },
              { in: 8, out: 67 },
              { in: 10, out: 68 },
              { in: 12, out: 69 },
            ]
          }
        ],
        currentPresetIdx: 0,
        addingPreset: false,
        exporting: false,
        unsavedEdits: false
      };
      const action: SettingsAction = {
        type: 'CHANGE_CONTROLLER_COLUMNS',
        columns: 8
      };
      const newState = settingsReducer(previousState, action);

      expect(newState.controllerRows).toBe(1);
      expect(newState.controllerColumns).toBe(8);
      expect(newState.inputCCs).toEqual([2, 4, 6, 8, 10, 12, 13, 14]);

      expect(newState.presets).toEqual([
        {
          synthId: 5,
          channel: 7,
          mappings: [
            { in: 2, out: 74 },
            { in: 4, out: 1 },
            { in: 6, out: 3 },
            { in: 8, out: 5 },
            { in: 10, out: 9 },
            { in: 12, out: 11 },
            // Added
            { in: 13, out: 12 },
            { in: 14, out: 13 },
          ]
        },
        {
          synthId: 4,
          channel: 3,
          mappings: [
            { in: 2, out: 78 },
            { in: 4, out: 65 },
            { in: 6, out: 66 },
            { in: 8, out: 67 },
            { in: 10, out: 68 },
            { in: 12, out: 69 },
            // Added
            { in: 13, out: 70 },
            { in: 14, out: 71 },
          ]
        }
      ]);
    });

    it('removes mappings from each preset when the controller size decreases', () => {
      const previousState: SettingsState = {
        controllerRows: 1,
        controllerColumns: 6,
        inputCCs: [2, 4, 6, 8, 10, 12],
        presets: [
          {
            // roland_ju_06
            synthId: 5,
            channel: 7,
            mappings: [
              { in: 2, out: 74 },
              { in: 4, out: 1 },
              { in: 6, out: 3 },
              { in: 8, out: 5 },
              { in: 10, out: 9 },
              { in: 12, out: 11 },
            ]
          },
          {
            // akai_ax80_tauntek
            synthId: 4,
            channel: 3,
            mappings: [
              { in: 2, out: 78 },
              { in: 4, out: 65 },
              { in: 6, out: 66 },
              { in: 8, out: 67 },
              { in: 10, out: 68 },
              { in: 12, out: 69 },
            ]
          }
        ],
        currentPresetIdx: 0,
        addingPreset: false,
        exporting: false,
        unsavedEdits: false
      };
      const action: SettingsAction = {
        type: 'CHANGE_CONTROLLER_COLUMNS',
        columns: 4
      };
      const newState = settingsReducer(previousState, action);

      expect(newState.controllerRows).toBe(1);
      expect(newState.controllerColumns).toBe(4);
      expect(newState.inputCCs).toEqual([2, 4, 6, 8]);

      expect(newState.presets).toEqual([
        {
          synthId: 5,
          channel: 7,
          mappings: [
            { in: 2, out: 74 },
            { in: 4, out: 1 },
            { in: 6, out: 3 },
            { in: 8, out: 5 },
            // Removed other mappings
          ]
        },
        {
          synthId: 4,
          channel: 3,
          mappings: [
            { in: 2, out: 78 },
            { in: 4, out: 65 },
            { in: 6, out: 66 },
            { in: 8, out: 67 },
            // Removed other mappings
          ]
        }
      ]);
    });
  });
});
