import React, { useContext } from 'react';
import styled from 'styled-components';

import { Preset } from '../common/types';
import { DeviceMenu, DeviceMenuItem } from '../common/components/DeviceMenu';
import SettingsContext from '../common/state/SettingsContext';
import CurrentPreset from './CurrentPreset';
import AddPreset from './AddPreset';
import ExportSettings from './ExportSettings';

const Synths = () => {
  const { state, dispatch } = useContext(SettingsContext);

  const currentPreset: Preset | null =
    state.currentPresetIdx === null
      ? null
      : state.presets[state.currentPresetIdx];

  const handleAddPreset = () => dispatch({ type: 'ADD_PRESET'});

  const handleSelectPreset = (presetIdx: number) => dispatch({
    type: 'SELECT_PRESET',
    presetIdx
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
        <CurrentPreset
          preset={currentPreset}
          allPresets={state.presets}
          controllerColumns={state.controllerColumns}
          dispatch={dispatch}
        />
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
  overflow: hidden;
`;

const AddPresetContainer = styled.div`
  margin: 1rem;
  text-align: center;
`;

const PresetsContainer = styled.div`
  padding-top: 2rem;
`;
