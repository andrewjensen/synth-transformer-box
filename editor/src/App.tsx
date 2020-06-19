import React, { useState } from 'react';
import styled from 'styled-components';

import TopBar from './topbar/TopBar';
import Controllers from './controllers/Controllers';
import Synths from './synths/Synths';

export enum AppTab {
  Controllers = "CONTROLLERS",
  Synths = "SYNTHS"
}

const App = () => {
  const [tab, setTab] = useState<AppTab>(AppTab.Synths);

  const handleChangeTab = (tab: AppTab) => {
    console.log('handleChangeTab', tab);
    setTab(tab);
  };

  const renderBody = () => {
    switch (tab) {
      case AppTab.Controllers:
        return <Controllers />;
      case AppTab.Synths:
        return <Synths />;
    }
  };

  return (
    <AppContainer>
      <TopBar
        activeTab={tab}
        onChangeTab={handleChangeTab}
      />
      <BodyContainer>
        {renderBody()}
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
