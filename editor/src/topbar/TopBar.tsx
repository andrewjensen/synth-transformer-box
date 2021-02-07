import React from 'react';
import styled from 'styled-components';

import { AppTab } from '../App';

interface TopBarProps {
  activeTab: AppTab
  onChangeTab: (tab: AppTab) => void
}

const TopBar: React.FC<TopBarProps> = ({ activeTab, onChangeTab }) => {
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
