import React, { useState, useReducer, useEffect } from 'react';
import styled from 'styled-components';
import { ipcRenderer } from 'electron';

import { Settings } from './common/types';
import TopBar from './topbar/TopBar';
import Controller from './controller/Controller';
import Synths from './synths/Synths';
import SettingsContext from './common/state/SettingsContext';
import {
  settingsReducer,
  INITIAL_STATE,
  SettingsAction,
} from './common/state/settingsReducer';
import { sendSettings } from './system/serial';

export enum AppTab {
  Controller = "CONTROLLER",
  Synths = "SYNTHS"
}

const App = () => {
  const [tab, setTab] = useState<AppTab>(AppTab.Synths);
  const [state, dispatch] = useReducer(settingsReducer, INITIAL_STATE);
  const [initialized, setInitialized] = useState<boolean>(false);

  const handleChangeTab = (tab: AppTab) => {
    console.log('handleChangeTab', tab);
    setTab(tab);
  };

  const handleImport = async () => {
    console.log('Loading settings...');

    const settings: Settings = await ipcRenderer.invoke('load-settings');
    console.log('Got settings:', settings);

    dispatch({
      type: 'IMPORT_SETTINGS',
      settings
    });
  };

  const handleSendSettings = async () => {
    console.log('Time to sync!!! Sending settings...', state);
    const {
      inputCCs,
      controllerRows,
      controllerColumns,
      presets
    } = state;
    const settings: Settings = {
      inputCCs,
      controllerRows,
      controllerColumns,
      presets
    };

    const result = await ipcRenderer.invoke('send-settings', settings);
    console.log('Result:', result);
  };

  // TODO: delete this
  const handleExport = async () => {
    console.log('Saving settings...', state);
    const {
      inputCCs,
      controllerRows,
      controllerColumns,
      presets
    } = state;
    const settings: Settings = {
      inputCCs,
      controllerRows,
      controllerColumns,
      presets
    };

    const result = await ipcRenderer.invoke('save-settings', settings);
    console.log('Result:', result);

    dispatch({ type: 'EXPORT_SETTINGS' });
  };

  useEffect(() => {
    if (!initialized) {
      console.log('Initializing...');
      handleImport();
      setInitialized(true);
    }
  }, [initialized, setInitialized, handleImport]);

  const { syncVersion } = state;
  useEffect(() => {
    if (syncVersion !== null) {
      handleSendSettings();
    }
  }, [syncVersion]);

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
          onImport={handleImport}
          onExport={handleExport}
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
  overflow: hidden;
`;
