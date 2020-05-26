import React from 'react';
import styled from 'styled-components';

import { Parameter, ControllerMapping } from '../common/types';
import { SYNTHS } from '../common/config/synths';
import Knob from '../common/components/Knob';

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
      <FormElement>
        <div>In: {mapping.in}</div>
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

      <FormElement>
        <div>Out: {mapping.out}</div>
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

const FormElement = styled.div`
  margin-bottom: 1rem;

  &:last-child {
    margin-bottom: 0;
  }

  > select {
    width: 100%;
  }
`;

function printParameter(parameter: Parameter): string {
  return `${parameter.title} (CC #${parameter.cc})`;
}

function range(min: number, max: number): number[] {
  const results = [];
  for (let i = min; i < max; i++) {
    results.push(i);
  }
  return results;
}
