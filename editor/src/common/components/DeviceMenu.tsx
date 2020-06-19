import React from 'react';
import styled from 'styled-components';

export const DeviceMenu: React.FC = ({ children }) => (
  <MenuContainer>
    {children}
  </MenuContainer>
);

interface DeviceMenuItemProps {
  title: string
  active: boolean
  onSelect: () => void
}

export const DeviceMenuItem: React.FC<DeviceMenuItemProps> = ({ title, active, onSelect }) => (
  <ItemContainer active={active} onClick={onSelect}>{title}</ItemContainer>
);

const MenuContainer = styled.div`
  background-color: #f0f0f0;
`;

interface ItemContainerProps {
  readonly active: boolean
}

const ItemContainer = styled.div<ItemContainerProps>`
  font-size: 20px;
  padding: 20px;
  cursor: pointer;

  ${props => props.active
    ? `border: 5px solid black;`
    : `border: 5px solid #ccc;`
  }
`;
