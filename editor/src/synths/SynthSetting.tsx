import React, { useMemo } from 'react';
import { SYNTHS, printSynthTitle } from '../common/config/synths';
import { Synth } from '../common/types';

interface SynthSettingProps {
  synthId: number
  onChangeSynth: (synthId: number) => void
}

function sortByManufacturerAndTitle(a: Synth, b: Synth): number {
  const manufacturersCompared = a.manufacturer.localeCompare(b.manufacturer);
  if (manufacturersCompared !== 0) {
    return manufacturersCompared;
  }

  return a.title.localeCompare(b.title);
}

const SynthSetting: React.FC<SynthSettingProps> = ({ synthId, onChangeSynth}) => {

  const availableSynths = useMemo<Synth[]>(() => {
    return SYNTHS
      .filter(synth => synth.parameters.length > 0)
      .sort(sortByManufacturerAndTitle);
  }, [SYNTHS]);

  const handleChangeSynth = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const synthId = parseInt(event.target.value, 10);
    onChangeSynth(synthId);
  };

  return (
    <select
      value={synthId}
      onChange={handleChangeSynth}
    >
      <option value={0}></option>
      {availableSynths.map(synth => (
        <option
          key={synth.id}
          value={synth.id}
        >{printSynthTitle(synth.id)}</option>
      ))}
    </select>
  );
};

export default SynthSetting;
