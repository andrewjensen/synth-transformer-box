import React from 'react';
import styled from 'styled-components';

import { AppTab } from '../App';

interface TopBarProps {
  activeTab: AppTab
  onChangeTab: (tab: AppTab) => void
  onImport: () => void
  onExport: () => void
}

const TopBar: React.FC<TopBarProps> = ({ activeTab, onChangeTab, onImport, onExport }) => {
  // TODO: connect hasWarning for export

  return (
    <Container>
      <Tabs>
        <Tab
          title="Controller"
          active={activeTab === AppTab.Controller}
          onClick={() => onChangeTab(AppTab.Controller)}
          />
        <Tab
          title="Synths"
          active={activeTab === AppTab.Synths}
          onClick={() => onChangeTab(AppTab.Synths)}
        />
      </Tabs>
      <Controls>
        <SerialControl>
          <SerialControlButton
            hasWarning={false}
            onClick={onImport}
          >Import settings</SerialControlButton>
        </SerialControl>
        <SerialControl>
          <SerialControlButton
            hasWarning={false}
            onClick={onExport}
          >Export settings</SerialControlButton>
        </SerialControl>
      </Controls>
    </Container>
  );
}

export default TopBar;

interface TabProps {
  title: string
  active: boolean
  onClick: () => void
}

const Tab: React.FC<TabProps> = ({ title, active, onClick }) => {
  return (
    <TabContainer linkActive={active}>
      <TabLink onClick={onClick}>{title}</TabLink>
    </TabContainer>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  background-color: black;
  color: white;
`;

const Tabs = styled.div`
  padding-left: 2rem;
  display: flex;
  flex-direction: row;
`;

interface TabContainerProps {
  linkActive: boolean
}

const TabContainer = styled.div<TabContainerProps>`
  cursor: pointer;

  &:hover {
    background-color: #333;
  }

  ${(props) => props.linkActive && `
      background-color: #333;
  `}
`;

const TabLink = styled.div`
  display: block;
  padding: 1rem;
  color: white;
  text-decoration: none;
  font-weight: bold;
`;

const Controls = styled.div`
  display: flex;
  flex-direction: row;
`;

const SerialControl = styled.div`
  margin: 0.5rem;
  margin-left: 0;
`;

interface SerialControlButtonProps {
  hasWarning: boolean
}

const SerialControlButton = styled.button<SerialControlButtonProps>`
  border: 1px solid black;
  padding: 0.5rem 1rem;
  border-radius: 5px;

  ${(props) => props.hasWarning
    ? `background-color: #ff0000;`
    : `background-color: #dddddd;`
  }
`;
