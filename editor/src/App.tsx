import React from 'react';
import styled from 'styled-components';

import TopBar from './topbar/TopBar';
import Controllers from './controllers/Controllers';
import Synths from './synths/Synths';

// TODO: Manage routing from this component
// TODO: add Controllers back in!

const App = () => {
  return (
    <AppContainer>
      <TopBar />
      <BodyContainer>
        <Synths />
      </BodyContainer>
    </AppContainer>
  );
}

export default App;

const AppContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const BodyContainer = styled.div`
  flex-grow: 1;
`;
