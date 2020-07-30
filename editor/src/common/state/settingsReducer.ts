import { Synth, Preset, ControllerMapping, Settings } from '../types';
import { getSynthById } from '../config/synths';
import { range } from '../helpers';

const INITIAL_ROW_COUNT = 2;
const INITIAL_COL_COUNT = 4;

const DEFAULT_MAPPINGS = 8;

export interface SettingsState {
  controllerRows: number
  controllerColumns: number
  inputCCs: number[]
  presets: Preset[]
  currentPresetIdx: number | null
  addingPreset: boolean
  exporting: boolean
  unsavedEdits: boolean
}

export type SettingsAction =
  | { type: 'CHANGE_CONTROLLER_ROWS', rows: number }
  | { type: 'CHANGE_CONTROLLER_COLUMNS', columns: number }
  | { type: 'CHANGE_INPUT_CC', inputIdx: number, cc: number }
  | { type: 'ADD_PRESET' }
  | { type: 'SUBMIT_NEW_PRESET', synthId: number, channel: number }
  | { type: 'SELECT_PRESET', presetIdx: number }
  | { type: 'CHANGE_MAPPING', mapping: ControllerMapping, mappingIdx: number }
  | { type: 'CHANGE_CHANNEL', channel: number }
  | { type: 'REORDER_PRESET_UP' }
  | { type: 'REORDER_PRESET_DOWN' }
  | { type: 'DELETE' }
  | { type: 'IMPORT_SETTINGS', settings: Settings }
  | { type: 'TOGGLE_EXPORTING' }
  | { type: 'EXPORT_SETTINGS' }

export const INITIAL_STATE: SettingsState = {
  controllerRows: INITIAL_ROW_COUNT,
  controllerColumns: INITIAL_COL_COUNT,
  inputCCs: getInitialCCs(INITIAL_ROW_COUNT, INITIAL_COL_COUNT),
  presets: [],
  currentPresetIdx: null,
  addingPreset: false,
  exporting: false,
  unsavedEdits: false
};

export function settingsReducer(state: SettingsState, action: SettingsAction): SettingsState {
  switch (action.type) {
    case 'CHANGE_CONTROLLER_ROWS':
      return {
        ...state,
        controllerRows: action.rows,
        inputCCs: getInitialCCs(action.rows, state.controllerColumns),
        unsavedEdits: true
      };
    case 'CHANGE_CONTROLLER_COLUMNS':
      return {
        ...state,
        controllerColumns: action.columns,
        inputCCs: getInitialCCs(state.controllerRows, action.columns),
        unsavedEdits: true
      };
    case 'CHANGE_INPUT_CC':
      return {
        ...state,
        inputCCs: state.inputCCs.map(
          (inputCC, idx) =>
            idx === action.inputIdx
              ? action.cc
              : inputCC
        ),
        unsavedEdits: true
      };
    case 'ADD_PRESET':
      return {
        ...state,
        addingPreset: true
      };
    case 'SUBMIT_NEW_PRESET':
      return {
        ...state,
        presets: [
          ...state.presets,
          createPreset(action.synthId, action.channel)
        ],
        // this is safe because we just added an element to the end
        currentPresetIdx: state.presets.length,
        addingPreset: false,
        unsavedEdits: true
      }
    case 'SELECT_PRESET':
      return {
        ...state,
        currentPresetIdx: action.presetIdx
      };
    case 'CHANGE_MAPPING':
      return editCurrentPreset(state, preset => ({
        ...preset,
        mappings: preset.mappings.map(
          (mapping, idx) =>
            idx === action.mappingIdx
              ? action.mapping
              : mapping
        )
      }));
    case 'CHANGE_CHANNEL':
      return editCurrentPreset(state, preset => ({
        ...preset,
        channel: action.channel
      }));
    case 'REORDER_PRESET_UP':
      return {
        ...state,
        currentPresetIdx: state.currentPresetIdx! - 1,
        presets: reorderPresets(state.presets, state.currentPresetIdx!, state.currentPresetIdx! - 1),
        unsavedEdits: true
      };
    case 'REORDER_PRESET_DOWN':
      return {
        ...state,
        currentPresetIdx: state.currentPresetIdx! + 1,
        presets: reorderPresets(state.presets, state.currentPresetIdx!, state.currentPresetIdx! + 1),
        unsavedEdits: true
      };
    case 'DELETE':
      return {
        ...state,
        presets: state.presets.filter((preset, idx) =>
          idx !== state.currentPresetIdx
        ),
        currentPresetIdx: null,
        unsavedEdits: true
      };
    case 'IMPORT_SETTINGS':
      const {
        rows,
        columns,
        inputCCs
      } = guessControllerSettings(action.settings.presets[0].mappings);
      return {
        controllerRows: rows,
        controllerColumns: columns,
        inputCCs,
        presets: action.settings.presets,
        currentPresetIdx: action.settings.presets.length ? 0 : null,
        addingPreset: false,
        exporting: false,
        unsavedEdits: false
      };
    case 'EXPORT_SETTINGS':
      return {
        ...state,
        unsavedEdits: false
      };
    case 'TOGGLE_EXPORTING':
      return {
        ...state,
        exporting: !state.exporting
      };
    default:
      return state;
  }
}

function getInitialCCs(rowCount: number, colCount: number) {
  const totalControls = rowCount * colCount;
  return range(1, totalControls + 1);
};

// TODO: remove this guessing once we update the wire protocol
function guessControllerSettings(mappings: ControllerMapping[]) {
  const mappingCount = mappings.length;
  for (let chosenRows = 2; chosenRows < 10; chosenRows++) {
    let chosenColumns = mappingCount / chosenRows;
    if (Math.floor(chosenColumns) === chosenColumns) {
      return {
        rows: chosenRows,
        columns: chosenColumns,
        inputCCs: mappings.map(mapping => mapping.in)
      };
    }
  }
  throw new Error('Could not guess controller settings!');
}

type PresetEditFn = (preset: Preset) => Preset;

function editCurrentPreset(state: SettingsState, editFn: PresetEditFn): SettingsState {
  return {
    ...state,
    presets: state.presets.map(
      (preset, idx) =>
        idx === state.currentPresetIdx
          ? editFn(preset)
          : preset
    ),
    unsavedEdits: true
  };
}

function createPreset(synthId: number, channel: number): Preset {
  const synth = getSynthById(synthId);

  return {
    synthId,
    channel,
    mappings: createInitialMappings(synth)
  };
}

function createInitialMappings(synth: Synth): ControllerMapping[] {
  const availableParams = synth.parameters;
  if (availableParams.length === 0) {
    return [];
  }

  return range(1, DEFAULT_MAPPINGS + 1)
    .map((inputCC, idx) => {
      const outputCC = availableParams.length >= idx + 1
        ? availableParams[idx].cc
        : availableParams[availableParams.length - 1].cc;

      return {
        in: inputCC,
        out: outputCC
      };
    });
}

function reorderPresets(presets: Preset[], idxA: number, idxB: number): Preset[] {
  const updatedPresets = [...presets];
  const thisPreset = presets[idxA];
  updatedPresets[idxA] = updatedPresets[idxB];
  updatedPresets[idxB] = thisPreset;

  return updatedPresets;
}
