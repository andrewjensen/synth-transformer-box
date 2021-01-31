import React, { useState, useReducer, useEffect, useCallback } from 'react';
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

export enum AppTab {
  Controller = "CONTROLLER",
  Synths = "SYNTHS"
}

const ACTIONS_TO_SYNC: string[] = [
  'CHANGE_CONTROLLER_ROWS',
  'CHANGE_CONTROLLER_COLUMNS',
  'CHANGE_INPUT_CC',
  // 'ADD_PRESET',
  'SUBMIT_NEW_PRESET',
  // 'SELECT_PRESET',
  'CHANGE_MAPPING',
  'CHANGE_CHANNEL',
  'REORDER_PRESET_UP',
  'REORDER_PRESET_DOWN',
  'DELETE',
  // 'IMPORT_SETTINGS',
  // 'TOGGLE_EXPORTING',
  // 'EXPORT_SETTINGS',
];

const App = () => {
  const [tab, setTab] = useState<AppTab>(AppTab.Synths);
  const [state, dispatch] = useReducer(settingsReducer, INITIAL_STATE);
  const [initialized, setInitialized] = useState<boolean>(false);

  const wrappedDispatch = useCallback((action: SettingsAction) => {
    dispatch(action);

    if (ACTIONS_TO_SYNC.indexOf(action.type)) {
      handleSendSettings();
    }
  }, [dispatch]);

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

  const renderBody = () => {
    switch (tab) {
      case AppTab.Controller:
        return <Controller />;
      case AppTab.Synths:
        return <Synths />;
    }
  };

  return (
    <SettingsContext.Provider value={{ state, dispatch: wrappedDispatch }}>
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
