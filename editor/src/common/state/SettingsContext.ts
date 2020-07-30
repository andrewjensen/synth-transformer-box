import React from 'react';
import { INITIAL_STATE, PresetsState, PresetsAction } from './settingsReducer';

interface SettingsContextState {
  state: PresetsState
  dispatch: React.Dispatch<PresetsAction>
}

const SettingsContext = React.createContext<SettingsContextState>({
  state: INITIAL_STATE,
  dispatch: () => {}
});

export default SettingsContext;
