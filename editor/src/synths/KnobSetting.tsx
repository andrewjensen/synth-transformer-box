import React from 'react';
import styled from 'styled-components';

import { Parameter, ControllerMapping } from '../common/types';
import { range } from '../common/helpers';
import { SYNTHS } from '../common/config/synths';
import Knob from '../common/components/Knob';
import FormElement from '../common/components/form/FormElement';

const MOCK_PARAMETERS = SYNTHS[0].parameters;

interface KnobSettingProps {
  mapping: ControllerMapping
  onChangeMapping: (mapping: ControllerMapping) => void
}

const KnobSetting: React.FC<KnobSettingProps> = ({ mapping, onChangeMapping }) => {

  const handleChangeInput = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const valueStr = event.target.value;
    const value = parseInt(valueStr);
    onChangeMapping({
      ...mapping,
      in: value
    });
  };

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
        <select
          value={mapping.in}
          onChange={handleChangeInput}
        >
          {range(1, 128).map(n => (
            <option
              key={n}
              value={n}
            >CC #{n}</option>
          ))}
        </select>
      </FormElement>

      <FormElement title="Output">
        <select
          value={mapping.out}
          onChange={handleChangeOutput}
        >
          {MOCK_PARAMETERS.map(param => (
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
