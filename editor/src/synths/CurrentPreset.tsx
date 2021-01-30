import React from 'react';
import styled from 'styled-components';
import { chunkEvery } from '../common/helpers';
import { Preset, ControllerMapping } from '../common/types';
import { printSynthTitle } from '../common/config/synths';
import ChannelSetting from './ChannelSetting';
import KnobSetting from './KnobSetting';
import { SettingsAction } from '../common/state/settingsReducer';

interface CurrentPresetProps {
  preset: Preset
  allPresets: Preset[]
  controllerColumns: number
  dispatch: React.Dispatch<SettingsAction>
}

const CurrentPreset: React.FC<CurrentPresetProps> = ({
  preset,
  allPresets,
  controllerColumns,
  dispatch
}) => {
  const mappingChunks = chunkEvery(preset.mappings, controllerColumns);

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
      <Content>
        <ControlSurface>
          {mappingChunks.map((chunk, chunkIdx) => (
            <ControlRow key={`mappingChunk${chunkIdx}`}>
              {chunk.map((mapping, idx) => (
                <ControlMappingContainer key={`mappingChunk${chunkIdx}controller${idx}`}>
                  <KnobSetting
                    synthId={preset.synthId}
                    mapping={mapping}
                    onChangeMapping={(changedMapping) => {
                      const unchunkedIdx = (chunkIdx * controllerColumns) + idx;
                      handleChangeMapping(changedMapping, unchunkedIdx);
                    }}
                  />
                </ControlMappingContainer>
              ))}
            </ControlRow>
          ))}
        </ControlSurface>
      </Content>
    </Container>
  );
};

export default CurrentPreset;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const Header = styled.div`
  display: flex;
  flex-direction: row;
  padding: 2rem;
`;

const HeaderControls = styled.div``;

const Title = styled.div`
  font-size: 24px;
  flex-grow: 1;
`;

const Button = styled.button`
`;

const Content = styled.div`
  flex-grow: 1;
  width: 100%;
  height: 100%;
  overflow: auto;
  box-sizing: border-box;

  padding: 0 2rem 2rem 2rem;
`;

const ControlSurface = styled.div`
  width: fit-content;
  height: fit-content;
`;

const ControlRow = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 1rem;
  margin-right: 2rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const ControlMappingContainer = styled.div`
  margin-right: 1rem;
  padding: 1rem;
  border: 1px solid #ccc;

  &:last-child {
    margin-right: 0;
  }
`;
