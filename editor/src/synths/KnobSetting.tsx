import React from 'react';
import styled from 'styled-components';

import Knob from '../common/components/Knob';

interface Parameter {
  id: string
  title: string
  cc: number
}

const MOCK_PARAMETERS: Parameter[] = [
  {
    id: 'vcf_cutoff',
    title: 'VCF Cutoff',
    cc: 1
  },
  {
    id: 'vca_level',
    title: 'VCA Level',
    cc: 2
  },
  {
    id: 'adsr_attack_time',
    title: 'ADSR: Attack Time',
    cc: 3
  }
];

const KnobSetting = () => (
  <Container>
    <Knob value={127} />
    <select>
      {MOCK_PARAMETERS.map(param => (
        <option
          key={param.id}
          value={param.id}
        >{param.title}</option>
      ))}
    </select>
  </Container>
);

export default KnobSetting;

const Container = styled.div`
`;
