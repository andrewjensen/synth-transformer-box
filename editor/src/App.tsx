import React from 'react';
import {
  Switch,
  Route,
  Redirect
} from 'react-router-dom';
import styled from 'styled-components/macro';

import TopBar from './topbar/TopBar';
import Controllers from './controllers/Controllers';
import Synths from './synths/Synths';

const App = () => {
  return (
    <AppContainer>
      <TopBar />
      <BodyContainer>
        <Switch>
          <Route path="/controllers">
            <Controllers />
          </Route>
          <Route path="/synths">
            <Synths />
          </Route>
          <Route exact path="/">
            <Redirect to="/synths" />
          </Route>
        </Switch>
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
