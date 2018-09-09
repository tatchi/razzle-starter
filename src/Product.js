import React from 'react';
import './Product.css';
import MyCommonComp from './MyCommonComp';
import { Switch, Button } from 'antd';

const Product = props => {
  return (
    <div>
      <div className="btn-blue">my Product</div>, <Switch />, <Button>salut</Button>
      <MyCommonComp />
    </div>
  );
};

export default Product;
