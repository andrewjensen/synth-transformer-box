import React, { useReducer } from 'react';
import styled from 'styled-components';
import { ipcRenderer } from 'electron';

import { Settings, Preset } from '../common/types';
import { DeviceMenu, DeviceMenuItem } from '../common/components/DeviceMenu';
import {
  presetsReducer,
  INITIAL_STATE,
} from './presetsReducer';
import CurrentPreset from './CurrentPreset';
import AddPreset from './AddPreset';
import ExportSettings from './ExportSettings';

const Synths = () => {
  const [state, dispatch] = useReducer(presetsReducer, INITIAL_STATE);

  const currentPreset: Preset | null =
    state.currentPresetIdx === null
      ? null
      : state.presets[state.currentPresetIdx];

  const handleAddPreset = () => dispatch({ type: 'ADD_PRESET'});

  const handleSelectPreset = (presetIdx: number) => dispatch({
    type: 'SELECT_PRESET',
    presetIdx
  });

  // const handleExport = () => dispatch({
  //   type: 'TOGGLE_EXPORTING'
  // });

  const handleImport = async () => {
    console.log('Loading settings...');

    const settings: Settings = await ipcRenderer.invoke('load-settings');
    console.log('Got settings:', settings);

    dispatch({
      type: 'IMPORT_SETTINGS',
      settings
    });
  };

  const handleExport = async () => {
    console.log('Saving settings...');
    const settings: Settings = {
      presets: state.presets
    };

    const result = await ipcRenderer.invoke('save-settings', settings);
    console.log('Result:', result);

    dispatch({ type: 'EXPORT_SETTINGS' });
  };

  const renderMainContent = () => {
    if (state.addingPreset) {
      return (
        <AddPreset dispatch={dispatch} />
      );
    } else if (state.exporting) {
      return (
        <ExportSettings state={state} dispatch={dispatch} />
      );
    } else if (currentPreset) {
      return (
        <CurrentPreset preset={currentPreset} allPresets={state.presets} dispatch={dispatch} />
      );
    } else {
      return null;
    }
  }

  return (
    <Container>
      <Sidebar>

        <PresetsContainer>
          <DeviceMenu>
            {state.presets.map((preset, idx) => (
              <DeviceMenuItem
                key={`index${idx}synth${preset.synthId}`}
                synthId={preset.synthId}
                active={idx === state.currentPresetIdx}
                onSelect={() => handleSelectPreset(idx)}
              />
            ))}
          </DeviceMenu>
          <AddPresetContainer>
            <button onClick={handleAddPreset}>Add preset</button>
          </AddPresetContainer>
        </PresetsContainer>

        <SerialControlsContainer>
          <SerialControl>
            <SerialControlButton
              hasWarning={false}
              onClick={handleImport}
            >Import settings</SerialControlButton>
          </SerialControl>
          <SerialControl>
            <SerialControlButton
              hasWarning={state.unsavedEdits}
              onClick={handleExport}
            >Export settings</SerialControlButton>
          </SerialControl>
        </SerialControlsContainer>

      </Sidebar>
      <Main>
        {renderMainContent()}
      </Main>
    </Container>
  );
}

export default Synths;

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: row;
`;

const Sidebar = styled.div`
  flex-grow: 0;
  flex-shrink: 0;
  width: 12rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: #f0f0f0;
`;

const Main = styled.div`
  flex-grow: 1;
  margin: 2rem;
`;

const AddPresetContainer = styled.div`
  margin: 1rem;
  text-align: center;
`;

const PresetsContainer = styled.div`
`;

const SerialControlsContainer = styled.div`
  text-align: center;
`;

const SerialControl = styled.div`
  margin: 1rem;
`;

interface SerialControlButtonProps {
  hasWarning: boolean
}

const SerialControlButton = styled.button<SerialControlButtonProps>`
  border: 1px solid black;
  padding: 0.5rem 1rem;
  border-radius: 5px;

  ${(props) => props.hasWarning
    ? `background-color: #ff0000;`
    : `background-color: #dddddd;`
  }
`;
