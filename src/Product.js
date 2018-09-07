import React from 'react';
import './Product.css';
import { Switch, Button } from 'antd';

const Product = props => {
  return [<div className="btn-blue">my Product</div>, <Switch />, <Button>salut</Button>];
};

export default Product;
