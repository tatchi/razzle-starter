import React from 'react';
import { Button, Switch } from 'antd';
import './Product.css';

const Product = props => {
  return (
    <div>
      <div className="btn-blue">my Product</div>
      <Button>Coucou</Button>
      <Switch defaultChecked={true} />
    </div>
  );
};

export default Product;
