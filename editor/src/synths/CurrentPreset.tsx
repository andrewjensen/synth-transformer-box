import React from 'react';
import styled from 'styled-components/macro';
import { chunkEvery } from '../common/helpers';
import { Preset, ControllerMapping } from '../common/types';
import { printSynthTitle } from '../common/config/synths';
import ChannelSetting from './ChannelSetting';
import KnobSetting from './KnobSetting';
import { PresetsAction } from './presetsReducer';

interface CurrentPresetProps {
  preset: Preset
  allPresets: Preset[]
  dispatch: React.Dispatch<PresetsAction>
}

const CurrentPreset: React.FC<CurrentPresetProps> = ({ preset, allPresets, dispatch }) => {
  const mappingChunks = chunkEvery(preset.mappings, 4);

  const isFirstPreset = preset === allPresets[0];
  const isLastPreset = preset === allPresets[allPresets.length - 1];

  const handleChangeMapping = (mapping: ControllerMapping, mappingIdx: number) => dispatch({
    type: 'CHANGE_MAPPING',
    mapping,
    mappingIdx
  });

  const handleChangeChannel = (channel: number) => dispatch({
    type: 'CHANGE_CHANNEL',
    channel
  });

  const handleMoveUp = () => dispatch({
    type: 'REORDER_PRESET_UP'
  });

  const handleMoveDown = () => dispatch({
    type: 'REORDER_PRESET_DOWN'
  });

  const handleMidiLearn = () => {
    alert('TODO: handle MIDI learn');
  }

  const handleConfirmDelete = () => {
    const confirmed = window.confirm('Are you sure you want to delete this preset?');
    if (confirmed) {
      dispatch({
        type: 'DELETE'
      });
    }
  }

  return (
    <Container>
      <Header>
        <Title>{printSynthTitle(preset.synthId)}</Title>
        <HeaderControls>
          <ChannelSetting
            channel={preset.channel}
            onChangeChannel={handleChangeChannel}
          />
          <Button
            disabled={isFirstPreset}
            onClick={handleMoveUp}
          >Move preset up</Button>
          <Button
            disabled={isLastPreset}
            onClick={handleMoveDown}
          >Move preset down</Button>
          <Button onClick={handleMidiLearn}>MIDI Learn</Button>
          <Button onClick={handleConfirmDelete}>Delete Preset</Button>
        </HeaderControls>
      </Header>
      <ControlSurface>
        {mappingChunks.map((chunk, chunkIdx) => (
          <ControlRow key={`mappingChunk${chunkIdx}`}>
            {chunk.map((mapping, idx) => (
              <ControlMappingContainer key={idx}>
                <KnobSetting
                  synthId={preset.synthId}
                  mapping={mapping}
                  onChangeMapping={(changedMapping) => handleChangeMapping(changedMapping, idx)}
                />
              </ControlMappingContainer>
            ))}
          </ControlRow>
        ))}
      </ControlSurface>
    </Container>
  );
};

export default CurrentPreset;

const Container = styled.div``;

const Header = styled.div`
  display: flex;
  flex-direction: row;
`;

const HeaderControls = styled.div``;

const Title = styled.div`
  font-size: 24px;
  flex-grow: 1;
  margin: 0 0 2rem;
`;

const Button = styled.button`
`;

const ControlSurface = styled.div`
`;

const ControlRow = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 1rem;
`;

const ControlMappingContainer = styled.div`
  margin-right: 1rem;
  padding: 1rem;
  border: 1px solid #ccc;

  &:last-child {
    margin-right: 0;
  }
`;
