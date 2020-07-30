import React, { useState } from 'react';
import styled from 'styled-components';

import FormElement from '../common/components/form/FormElement';
import SynthSetting from './SynthSetting';
import ChannelSetting from './ChannelSetting';
import { SettingsAction } from '../common/state/settingsReducer';

interface AddPresetProps {
  dispatch: React.Dispatch<SettingsAction>
}

const AddPreset: React.FC<AddPresetProps> = ({ dispatch }) => {
  const [synthId, setSynthId] = useState<number>(0);
  const [channel, setChannel] = useState<number>(1);

  const handleSubmit = () => dispatch({
    type: 'SUBMIT_NEW_PRESET',
    synthId,
    channel
  });

  return (
    <Container>
      <Title>Add a preset</Title>

      <SelectionContainer>

        <FormElement title="Synth">
          <SynthSetting
            synthId={synthId}
            onChangeSynth={setSynthId}
          />
        </FormElement>

        <FormElement title="Output MIDI Channel">
          <ChannelSetting
            channel={channel}
            onChangeChannel={setChannel}
          />
        </FormElement>

      </SelectionContainer>

      <ControlsContainer>
        <button disabled={synthId === 0} onClick={handleSubmit}>Submit</button>
      </ControlsContainer>
    </Container>
  );
};

export default AddPreset;

const Container = styled.div``;

const Title = styled.h1``;

const SelectionContainer = styled.div`
  margin: 2rem 0;
`;

const ControlsContainer = styled.div`
  margin: 2rem 0;
`;
