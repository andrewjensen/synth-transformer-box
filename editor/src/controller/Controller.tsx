import React, { useState } from 'react';
import styled from 'styled-components';
import { range } from '../common/helpers';
import { Title } from '../common/components/Typography';
import FormElement from '../common/components/form/FormElement';
import Knob from '../common/components/Knob';

const INITIAL_ROW_COUNT = 2;
const INITIAL_COL_COUNT = 4;
const MAX_ROW_COUNT = 8;
const MAX_COL_COUNT = 16;

function getCellIndex(rowIdx: number, colIdx: number, colCount: number) {
  return (rowIdx * colCount) + colIdx;
}

const getInitialCCs = (rowCount: number, colCount: number) => {
  const totalControls = rowCount * colCount;
  return range(1, totalControls + 1);
};

const Controller = () => {
  const [rowCount, setRowCount] = useState<number>(INITIAL_ROW_COUNT);
  const [colCount, setColCount] = useState<number>(INITIAL_COL_COUNT);
  const [inputCCs, setInputCCs] = useState<number[]>(getInitialCCs(rowCount, colCount));

  const handleChangeRowCount = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const countStr = event.target.value;
    const newRowCount = parseInt(countStr);
    setRowCount(newRowCount);
    setInputCCs(getInitialCCs(newRowCount, colCount));
  };

  const handleChangeColCount = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const countStr = event.target.value;
    const newColCount = parseInt(countStr);
    setColCount(newColCount);
    setInputCCs(getInitialCCs(rowCount, newColCount));
  };

  const handleChangeInputCC = (inputIdx: number, event: React.ChangeEvent<HTMLSelectElement>) => {
    const ccStr = event.target.value;
    const newCC = parseInt(ccStr);
    const updatedCCs = inputCCs.map(
      (inputCC, idx) =>
        idx === inputIdx
          ? newCC
          : inputCC
    );
    setInputCCs(updatedCCs);
  };

  const renderCell = (inputIdx: number) => {
    const inputCC = inputCCs[inputIdx];
    return (
      <ControlMappingContainer>
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
          value={rowCount}
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
          value={colCount}
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
        {range(0, rowCount).map(rowIdx => (
          <ControlRow>
            {range(0, colCount).map(colIdx => {
              const inputIdx = getCellIndex(rowIdx, colIdx, colCount);
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
