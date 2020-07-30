import React from 'react';
import styled from 'styled-components';
import { SettingsState, SettingsAction } from '../common/state/settingsReducer';

interface ExportSettingsProps {
  state: SettingsState
  dispatch: React.Dispatch<SettingsAction>
}

const ExportSettings: React.FC<ExportSettingsProps> = ({ state, dispatch }) => {
  const handleFinished = () => dispatch({
    type: 'TOGGLE_EXPORTING'
  });

  return (
    <Container>
      <Title>Export settings</Title>

      <SerializedSettings>{JSON.stringify(state.presets, null, 2)}</SerializedSettings>

      <Controls>
        <button onClick={handleFinished}>Finished</button>
      </Controls>
    </Container>
  );
};

export default ExportSettings;

const Container = styled.div``;

const Title = styled.h1``;

const SerializedSettings = styled.pre`
  max-height: 20rem;
  padding: 2rem;
  border: 5px solid black;
  background-color: #ccc;
  overflow: auto;
`;

const Controls = styled.div`
  margin: 2rem 0;
`;
