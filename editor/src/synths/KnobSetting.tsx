import React from 'react';
import styled from 'styled-components';

import { Parameter } from '../common/types';
import { SYNTHS } from '../common/config/synths';
import Knob from '../common/components/Knob';

const MOCK_PARAMETERS = SYNTHS[0].parameters;

const KnobSetting = () => (
  <Container>
    <Knob value={127} />
    <select>
      {MOCK_PARAMETERS.map(param => (
        <option
          key={param.cc}
          value={param.cc}
        >{printParameter(param)}</option>
      ))}
    </select>
  </Container>
);

export default KnobSetting;

const Container = styled.div`
`;

function printParameter(parameter: Parameter): string {
  return `${parameter.title} (CC #${parameter.cc})`;
}
