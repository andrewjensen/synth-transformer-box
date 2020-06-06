import React from 'react';
import styled from 'styled-components/macro';

interface FormElementProps {
  title: string
}

const FormElement: React.FC<FormElementProps> = ({ title, children }) => (
  <Container>
    <Title>{title}</Title>
    <Control>{children}</Control>
  </Container>
);

export default FormElement;

const Container = styled.div`
  margin: 0 0 2rem;
`;

const Title = styled.div`
  margin: 0 0 0.5rem;
  font-weight: bold;
`;

const Control = styled.div`
`;
