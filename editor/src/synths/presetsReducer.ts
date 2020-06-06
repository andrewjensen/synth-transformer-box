import { Synth, Preset, ControllerMapping } from '../common/types';
import { getSynthById } from '../common/config/synths';
import { range } from '../common/helpers';

const DEFAULT_MAPPINGS = 8;

export interface PresetsState {
  presets: Preset[]
  currentPresetIdx: number | null
  addingPreset: boolean
}

export type PresetsAction =
  | { type: 'ADD_PRESET' }
  | { type: 'SUBMIT_NEW_PRESET', synthId: string, channel: number }
  | { type: 'SELECT_PRESET', presetIdx: number }
  | { type: 'CHANGE_MAPPING', mapping: ControllerMapping, mappingIdx: number }
  | { type: 'CHANGE_CHANNEL', channel: number }
  | { type: 'DELETE' };

export const INITIAL_STATE: PresetsState = {
  presets: [],
  currentPresetIdx: null,
  addingPreset: false
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
        addingPreset: false
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
    case 'DELETE':
      return {
        ...state,
        presets: state.presets.filter((preset, idx) =>
          idx !== state.currentPresetIdx
        ),
        currentPresetIdx: null
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
    )
  };
}

function createPreset(synthId: string, channel: number): Preset {
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
