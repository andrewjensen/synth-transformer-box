import React, { useState, useReducer } from 'react';
import styled from 'styled-components';

import TopBar from './topbar/TopBar';
import Controller from './controller/Controller';
import Synths from './synths/Synths';
import SettingsContext from './common/state/SettingsContext';
import {
  settingsReducer,
  INITIAL_STATE,
} from './common/state/settingsReducer';

export enum AppTab {
  Controller = "CONTROLLER",
  Synths = "SYNTHS"
}

const App = () => {
  const [tab, setTab] = useState<AppTab>(AppTab.Synths);
  const [state, dispatch] = useReducer(settingsReducer, INITIAL_STATE);

  const handleChangeTab = (tab: AppTab) => {
    console.log('handleChangeTab', tab);
    setTab(tab);
  };

  const renderBody = () => {
    switch (tab) {
      case AppTab.Controller:
        return <Controller />;
      case AppTab.Synths:
        return <Synths />;
    }
  };

  return (
    <SettingsContext.Provider value={{ state, dispatch }}>
      <AppContainer>
        <TopBar
          activeTab={tab}
          onChangeTab={handleChangeTab}
        />
        <BodyContainer>
          {renderBody()}
        </BodyContainer>
      </AppContainer>
    </SettingsContext.Provider>
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
