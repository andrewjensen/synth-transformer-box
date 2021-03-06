import React, { useMemo } from 'react';
import styled from 'styled-components';

import { Parameter, ControllerMapping } from '../common/types';
import { range } from '../common/helpers';
import { getSynthById } from '../common/config/synths';
import Knob from '../common/components/Knob';
import FormElement from '../common/components/form/FormElement';

interface KnobSettingProps {
  synthId: number
  mapping: ControllerMapping
  onChangeMapping: (mapping: ControllerMapping) => void
}

const KnobSetting: React.FC<KnobSettingProps> = ({ synthId, mapping, onChangeMapping }) => {
  const synth = useMemo(() => getSynthById(synthId), [synthId]);

  const handleChangeOutput = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const valueStr = event.target.value;
    const value = parseInt(valueStr);
    onChangeMapping({
      ...mapping,
      out: value
    });
  };

  return (
    <Container>
      <Knob value={127} />
      <FormElement title="Input">
        <div>CC #{mapping.in}</div>
      </FormElement>

      <FormElement title="Output">
        <select
          value={mapping.out}
          onChange={handleChangeOutput}
        >
          {synth.parameters.map(param => (
            <option
              key={param.cc}
              value={param.cc}
            >{printParameter(param)}</option>
          ))}
        </select>
      </FormElement>
    </Container>
  );
};

export default KnobSetting;

const Container = styled.div`
`;

function printParameter(parameter: Parameter): string {
  return `${parameter.title} (CC #${parameter.cc})`;
}
