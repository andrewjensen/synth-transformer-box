import React from 'react';
import styled from 'styled-components';

export const DeviceMenu: React.FC = ({ children }) => (
  <MenuContainer>
    {children}
  </MenuContainer>
);

interface DeviceMenuItemProps {
  title: string
}

export const DeviceMenuItem: React.FC<DeviceMenuItemProps> = ({ title }) => (
  <ItemContainer>{title}</ItemContainer>
);

const MenuContainer = styled.div`
  background-color: #f0f0f0;
`;

const ItemContainer = styled.div`
  font-size: 20px;
  padding: 20px;
  border: 5px solid #ccc;
`;
