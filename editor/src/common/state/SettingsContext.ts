import React from 'react';
import { INITIAL_STATE, SettingsState, SettingsAction } from './settingsReducer';

interface SettingsContextState {
  state: SettingsState
  dispatch: React.Dispatch<SettingsAction>
}

const SettingsContext = React.createContext<SettingsContextState>({
  state: INITIAL_STATE,
  dispatch: () => {}
});

export default SettingsContext;
