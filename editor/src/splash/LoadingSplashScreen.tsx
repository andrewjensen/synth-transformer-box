import React from 'react';
import styled from 'styled-components';

interface Props {
}

const LoadingSplashScreen: React.FC<Props> = () => {
  return (
    <Container>
      <Title>Universal Traveler</Title>
      <Subtitle>MIDI translator</Subtitle>
      <StatusText>Connecting to device...</StatusText>
    </Container>
  );
}

export default LoadingSplashScreen;

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Title = styled.h1`
  text-align: center;
  margin-top: 10rem;
  margin-bottom: 0.5rem;
  font-size: 42px;
  font-weight: bold;
`;

const Subtitle = styled.h2`
  text-align: center;
  margin: 0;
  font-size: 30px;
  font-weight: bold;
`;

const StatusText = styled.p`
  text-align: center;
  margin-top: 10rem;
  margin-bottom: 0;
  font-size: 16px;
  font-weight: normal;
`;
