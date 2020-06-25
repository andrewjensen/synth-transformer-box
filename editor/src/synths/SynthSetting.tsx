import React from 'react';
import { SYNTHS, printSynthTitle } from '../common/config/synths';

interface SynthSettingProps {
  synthId: number
  onChangeSynth: (synthId: number) => void
}

const SynthSetting: React.FC<SynthSettingProps> = ({ synthId, onChangeSynth}) => {

  const handleChangeSynth = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const synthId = parseInt(event.target.value, 10);
    onChangeSynth(synthId);
  };

  return (
    <select
      value={synthId}
      onChange={handleChangeSynth}
    >
      {SYNTHS.map(synth => (
        <option
          key={synth.id}
          value={synth.id}
        >{printSynthTitle(synth.id)}</option>
      ))}
    </select>
  );
};

export default SynthSetting;
