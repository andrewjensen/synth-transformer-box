import React from 'react';
import styled from 'styled-components';

const TopBar: React.FC = () => {
  return (
    <Container>
      <Tabs>
        <Tab title="Controllers" link="/controllers" />
        <Tab title="Synths" link="/synths" />
      </Tabs>
    </Container>
  );
}

export default TopBar;

interface TabProps {
  title: string
  link: string
}

const Tab: React.FC<TabProps> = ({ title, link }) => {
  const routeMatch = false;

  return (
    <TabContainer linkActive={!!routeMatch}>
      <TabLink>{title}</TabLink>
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
  display: flex;
  flex-direction: row;
`;

interface TabContainerProps {
  linkActive: boolean
}

const TabContainer = styled.div<TabContainerProps>`
  &:hover {
    background-color: #333;
  }

  ${(props) => props.linkActive && `
      background-color: #333;
  `}
`;

const TabLink = styled.div`
  display: block;
  padding: 10px;
  color: white;
  text-decoration: none;
  font-weight: bold;
`;
