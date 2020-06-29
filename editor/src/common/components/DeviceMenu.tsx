import React from 'react';
import styled from 'styled-components';

import { Synth } from '../types';
import { getSynthById } from '../config/synths';

export const DeviceMenu: React.FC = ({ children }) => (
  <MenuContainer>
    {children}
  </MenuContainer>
);

interface DeviceMenuItemProps {
  synthId: number
  active: boolean
  onSelect: () => void
}

export const DeviceMenuItem: React.FC<DeviceMenuItemProps> = ({ synthId, active, onSelect }) => {
  const synth: Synth = getSynthById(synthId);
  return (
    <ItemContainer active={active} onClick={onSelect}>
      <Manufacturer>{synth.manufacturer}</Manufacturer>
      <SynthTitle>{synth.title}</SynthTitle>
    </ItemContainer>
  );
};

const MenuContainer = styled.div`
  background-color: #f0f0f0;
`;

interface ItemContainerProps {
  readonly active: boolean
}

const ItemContainer = styled.div<ItemContainerProps>`
  padding: 0.75rem;
  cursor: pointer;

  ${props => props.active
    ? `border: 5px solid black;`
    : `border: 5px solid #ccc;`
  }
`;

const Manufacturer = styled.div`
  text-transform: uppercase;
  font-size: 12px;
`;

const SynthTitle = styled.div`
  font-size: 20px;
`;
