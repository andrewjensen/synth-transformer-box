import { Synth, Preset, ControllerMapping, Settings } from '../common/types';
import { getSynthById } from '../common/config/synths';
import { range } from '../common/helpers';

const DEFAULT_MAPPINGS = 8;

export interface PresetsState {
  presets: Preset[]
  currentPresetIdx: number | null
  addingPreset: boolean
  exporting: boolean
  unsavedEdits: boolean
}

export type PresetsAction =
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

export const INITIAL_STATE: PresetsState = {
  presets: [],
  currentPresetIdx: null,
  addingPreset: false,
  exporting: false,
  unsavedEdits: false
};

export function presetsReducer(state: PresetsState, action: PresetsAction): PresetsState {
  switch (action.type) {
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
      return {
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

type PresetEditFn = (preset: Preset) => Preset;

function editCurrentPreset(state: PresetsState, editFn: PresetEditFn): PresetsState {
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
