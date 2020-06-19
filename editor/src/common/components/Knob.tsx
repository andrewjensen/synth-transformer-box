import React from 'react';
import styled from 'styled-components';

interface KnobProps {
  value: number
}

const Knob: React.FC<KnobProps> = ({ value }) => {
  return (
    <Container>
      <Graphic>🎚</Graphic>
    </Container>
  );
}

export default Knob;

const Container = styled.div`
  text-align: center;
`;

const Graphic = styled.div`
  font-size: 72px;
`;
