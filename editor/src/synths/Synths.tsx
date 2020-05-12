import React from 'react';
import styled from 'styled-components';

import { DeviceMenu, DeviceMenuItem } from '../common/components/DeviceMenu';
import KnobSetting from './KnobSetting';
import { SYNTHS } from '../common/config/synths';

const Synths = () => {
  return (
    <Container>
      <Sidebar>
        <DeviceMenu>
          {SYNTHS.map(synth => (
            <DeviceMenuItem title={synth.title} key={synth.title} />
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
          <KnobSetting />
          <KnobSetting />
          <KnobSetting />
          <KnobSetting />
        </ControlSurface>
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
  display: flex;
  flex-direction: row;
`;
