import React from 'react';
import styled from 'styled-components';
import { Link, useRouteMatch } from 'react-router-dom';

const TopBar: React.FC = () => {

  const handleExport = () => {
    alert("TODO: handle export");
  };

  return (
    <Container>
      <Tabs>
        <Tab title="Controllers" link="/controllers" />
        <Tab title="Synths" link="/synths" />
      </Tabs>
      <ExportButton onClick={handleExport}>Export</ExportButton>
    </Container>
  );
}

export default TopBar;

interface TabProps {
  title: string
  link: string
}

const Tab: React.FC<TabProps> = ({ title, link }) => {
  const routeMatch = useRouteMatch({
    path: link,
    exact: true
  });

  return (
    <TabContainer linkActive={!!routeMatch}>
      <TabLink to={link}>{title}</TabLink>
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

const TabLink = styled(Link)`
  display: block;
  padding: 10px;
  color: white;
  text-decoration: none;
  font-weight: bold;
`;

const ExportButton = styled.div`
  padding: 10px;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    background-color: #333;
  }
`;
