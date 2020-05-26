import React, { useState } from 'react';
import styled from 'styled-components';

import { ControllerMapping } from '../common/types';
import { DeviceMenu, DeviceMenuItem } from '../common/components/DeviceMenu';
import KnobSetting from './KnobSetting';
import { SYNTHS } from '../common/config/synths';

const MOCK_MAPPING: ControllerMapping[] = [
  {
    in: 1,
    out: 1
  },
  {
    in: 3,
    out: 3
  },
  {
    in: 5,
    out: 5
  },
  {
    in: 7,
    out: 7
  },
  {
    in: 8,
    out: 8
  },
  {
    in: 9,
    out: 9
  },
  {
    in: 10,
    out: 10
  },
  {
    in: 12,
    out: 12
  },
];

const Synths = () => {
  const [mappings, setMappings] = useState<ControllerMapping[]>(MOCK_MAPPING);

  const mappingChunks = chunkEvery(mappings, 4);

  const handleChangeMapping = (changedMapping: ControllerMapping, mappingIdx: number) => {
    const newMappings = mappings.map((mapping, idx) => {
      return idx === mappingIdx ? changedMapping : mapping;
    });
    setMappings(newMappings);
  };

  return (
    <Container>
      <Sidebar>
        <DeviceMenu>
          {SYNTHS.map(synth => (
            <DeviceMenuItem
              key={synth.title}
              title={synth.title}
            />
          ))}
        </DeviceMenu>
      </Sidebar>
      <Main>
        <Header>
          <Title>Roland Juno 60</Title>
          <HeaderControls>
            <Button>MIDI Learn</Button>
          </HeaderControls>
        </Header>
        <ControlSurface>
          {mappingChunks.map((chunk, chunkIdx) => (
            <ControlRow key={chunkIdx}>
              {chunk.map((mapping, idx) => (
                <ControlMappingContainer key={idx}>
                  <KnobSetting
                    mapping={mapping}
                    onChangeMapping={(changedMapping) => handleChangeMapping(changedMapping, idx)}
                  />
                </ControlMappingContainer>
              ))}
            </ControlRow>
          ))}
        </ControlSurface>
      </Main>
    </Container>
  );
}

export default Synths;

function chunkEvery<T>(arr: T[], chunkSize: number): T[][] {
  const results = [];

  for (let i = 0; i < arr.length; i++) {
    const last = results[results.length - 1];
    if (!last || last.length === chunkSize) {
      results.push([arr[i]]);
    } else {
      last.push(arr[i]);
    }
  }

  return results;
}

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
