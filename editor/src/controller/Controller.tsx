import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import { range } from '../common/helpers';
import { Title } from '../common/components/Typography';
import FormElement from '../common/components/form/FormElement';
import Knob from '../common/components/Knob';
import SettingsContext from '../common/state/SettingsContext';

const MAX_ROW_COUNT = 8;
const MAX_COL_COUNT = 16;

function getCellIndex(rowIdx: number, colIdx: number, colCount: number) {
  return (rowIdx * colCount) + colIdx;
}

const Controller = () => {
  const { state, dispatch } = useContext(SettingsContext);
  const { controllerRows, controllerColumns, inputCCs } = state;

  const handleChangeRowCount = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const countStr = event.target.value;
    const newRowCount = parseInt(countStr);
    dispatch({
      type: 'CHANGE_CONTROLLER_ROWS',
      rows: newRowCount
    });
  };

  const handleChangeColCount = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const countStr = event.target.value;
    const newColCount = parseInt(countStr);
    dispatch({
      type: 'CHANGE_CONTROLLER_COLUMNS',
      columns: newColCount
    });
  };

  const handleChangeInputCC = (inputIdx: number, event: React.ChangeEvent<HTMLSelectElement>) => {
    const ccStr = event.target.value;
    const newCC = parseInt(ccStr);
    dispatch({
      type: 'CHANGE_INPUT_CC',
      inputIdx,
      cc: newCC
    });
  };

  const renderCell = (inputIdx: number) => {
    const inputCC = inputCCs[inputIdx];
    return (
      <ControlMappingContainer key={inputIdx}>
        <Knob value={127} />
        <select
          value={inputCC}
          onChange={(event) => handleChangeInputCC(inputIdx, event)}
        >
          {range(1, 128).map(n => (
            <option
              key={n}
              value={n}
            >CC #{n}</option>
          ))}
        </select>
      </ControlMappingContainer>
    );
  };

  return (
    <Container>
      <Title>Controller Settings</Title>
      <FormElement title="Number of rows">
        <select
          value={controllerRows}
          onChange={handleChangeRowCount}
        >
          {range(1, MAX_ROW_COUNT + 1).map(n => (
            <option
              key={n}
              value={n}
            >{n}</option>
          ))}
        </select>
      </FormElement>

      <FormElement title="Controls per row">
        <select
          value={controllerColumns}
          onChange={handleChangeColCount}
        >
          {range(1, MAX_COL_COUNT + 1).map(n => (
            <option
              key={n}
              value={n}
            >{n}</option>
          ))}
        </select>
      </FormElement>

      <FormElement title="Layout">
        {range(0, controllerRows).map(rowIdx => (
          <ControlRow key={rowIdx}>
            {range(0, controllerColumns).map(colIdx => {
              const inputIdx = getCellIndex(rowIdx, colIdx, controllerColumns);
              return renderCell(inputIdx);
            })}
          </ControlRow>
        ))}
      </FormElement>

    </Container>
  );
}

export default Controller;

const Container = styled.div`
  padding: 2rem;
`;

const ControlRow = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 1rem;
`;

const ControlMappingContainer = styled.div`
  margin-right: 1rem;
  padding: 1rem;
  border: 1px solid #ccc;

  &:last-child {
    margin-right: 0;
  }
`;
