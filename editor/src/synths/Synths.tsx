import React, { useReducer } from 'react';
import styled from 'styled-components';

import { Preset } from '../common/types';
import { DeviceMenu, DeviceMenuItem } from '../common/components/DeviceMenu';
import { printSynthTitle } from '../common/config/synths';
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

  const handleExport = () => dispatch({
    type: 'TOGGLE_EXPORTING'
  });

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
        <DeviceMenu>
          {state.presets.map((preset, idx) => (
            <DeviceMenuItem
              key={`index${idx}synth${preset.synthId}`}
              title={printSynthTitle(preset.synthId)}
              active={idx === state.currentPresetIdx}
              onSelect={() => handleSelectPreset(idx)}
            />
          ))}
        </DeviceMenu>
        <AddPresetContainer>
          <button onClick={handleAddPreset}>Add preset</button>
        </AddPresetContainer>
        <ExportButtonContainer>
          <button onClick={handleExport}>Export settings</button>
        </ExportButtonContainer>
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

const ExportButtonContainer = styled.div`
  text-align: center;
`;
