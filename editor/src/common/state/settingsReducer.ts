import { Synth, Preset, ControllerMapping, Settings } from '../types';
import { getSynthById } from '../config/synths';
import { max, range } from '../helpers';

const INITIAL_ROW_COUNT = 2;
const INITIAL_COL_COUNT = 4;

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
    case 'CHANGE_CONTROLLER_COLUMNS':
      const updatedRows = action.type === 'CHANGE_CONTROLLER_ROWS'
        ? action.rows
        : state.controllerRows;
      const updatedColumns = action.type === 'CHANGE_CONTROLLER_COLUMNS'
        ? action.columns
        : state.controllerColumns;
      const newSize = updatedRows * updatedColumns;
      const previousSize = state.controllerRows * state.controllerColumns;
      const newInputCCs = updateInputCCs(state.inputCCs, newSize);
      return {
        ...state,
        controllerRows: updatedRows,
        controllerColumns: updatedColumns,
        inputCCs: newInputCCs,
        presets: updatePresetMappings(state.presets, previousSize, newInputCCs),
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
        presets: state.presets.map(preset => ({
          ...preset,
          mappings: preset.mappings.map((mapping, idx) =>
            idx === action.inputIdx
              ? ({ ...mapping, in: action.cc })
              : mapping
          )
        })),
        unsavedEdits: true
      };
    case 'ADD_PRESET':
      return {
        ...state,
        addingPreset: true
      };
    case 'SUBMIT_NEW_PRESET':
      const mappingCount = state.controllerRows * state.controllerColumns;
      return {
        ...state,
        presets: [
          ...state.presets,
          createPreset(action.synthId, action.channel, mappingCount)
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
      return {
        controllerRows: action.settings.controllerRows,
        controllerColumns: action.settings.controllerColumns,
        inputCCs: action.settings.inputCCs,
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

function getInitialCCs(rowCount: number, colCount: number): number[] {
  const totalControls = rowCount * colCount;
  return range(1, totalControls + 1);
};

function updateInputCCs(previousInputCCs: number[], newSize: number): number[] {
  const previousSize = previousInputCCs.length;
  if (newSize === previousSize) {
    return previousInputCCs;
  } else if (newSize > previousSize) {
    // Bigger: append higher CC values onto the end
    const newCCsCount = newSize - previousSize;
    const ccsToAdd = getInputCCsToAdd(previousInputCCs, newCCsCount);
    return [...previousInputCCs, ...ccsToAdd];
  } else {
    // Smaller: remove from the end
    return previousInputCCs.slice(0, newSize);
  }
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

function createPreset(synthId: number, channel: number, mappingCount: number): Preset {
  const synth = getSynthById(synthId);

  return {
    synthId,
    channel,
    mappings: createInitialMappings(synth, mappingCount)
  };
}

function createInitialMappings(synth: Synth, mappingCount: number): ControllerMapping[] {
  const availableParams = synth.parameters;
  if (availableParams.length === 0) {
    return [];
  }

  return range(1, mappingCount + 1)
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

function updatePresetMappings(presets: Preset[], previousSize: number, inputCCs: number[]): Preset[] {
  const newSize = inputCCs.length;
  if (newSize === previousSize) {
    return presets;
  } else if (newSize > previousSize) {
    // Bigger: append higher output CC values onto the end, based on the synth
    const ccsToAdd = inputCCs.slice(previousSize);
    return presets.map(preset => addMappings(preset, ccsToAdd));
  } else {
    // Smaller: remove from the end
    return presets.map(preset => ({
      ...preset,
      mappings: preset.mappings.slice(0, newSize)
    }));
  }
}

function getInputCCsToAdd(previousInputCCs: number[], newCCsCount: number): number[] {
  const maxCC = previousInputCCs.reduce(max, previousInputCCs[0]);
  return range(maxCC + 1, maxCC + newCCsCount + 1);
}

function addMappings(preset: Preset, ccsToAdd: number[]): Preset {
  const synth = getSynthById(preset.synthId);

  const usedOutputCCs: Set<number> = new Set(preset.mappings.map(mapping => mapping.out));
  const availableOuputCCs: number[] = synth.parameters
    .filter(parameter => !usedOutputCCs.has(parameter.cc))
    .map(parameter => parameter.cc);

  if (availableOuputCCs.length < ccsToAdd.length) {
    throw new Error('Not enough output CCs for new mappings');
  }

  const addedMappings: ControllerMapping[] = ccsToAdd
    .map((inputCC, idx) => ({
      in: inputCC,
      out: availableOuputCCs[idx]
    }));

  return {
    ...preset,
    mappings: [...preset.mappings, ...addedMappings]
  };
}

function reorderPresets(presets: Preset[], idxA: number, idxB: number): Preset[] {
  const updatedPresets = [...presets];
  const thisPreset = presets[idxA];
  updatedPresets[idxA] = updatedPresets[idxB];
  updatedPresets[idxB] = thisPreset;

  return updatedPresets;
}
