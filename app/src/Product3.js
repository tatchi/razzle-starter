import React from 'react';
import styled, { css } from 'react-emotion';
import SharedComp from './SharedComp';

const myStyle = css`
  color: red;
`;

const Product3 = props => {
  return (
    <div>
      <SharedComp />
      <div className={myStyle}>test red</div>
    </div>
  );
};

export default Product3;
