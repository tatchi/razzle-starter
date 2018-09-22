import React, { Component } from 'react';
import Loadable from 'react-loadable';
import './Home.css';
import Logo from './Logo';
import Intro from './Intro';
import Welcome from './Welcome';
import { Router, Link } from '@reach/router';

const Product = Loadable({
  loader: () => import(/* webpackPrefetch: true, webpackChunkName: 'Product' */ './Product'),
  loading: () => <div>loading...</div>,
});
const Product2 = Loadable({
  loader: () => import(/* webpackPrefetch: true */ './Product2'),
  loading: () => null,
});
const Product3 = Loadable({
  loader: () => import(/* webpackPrefetch: true */ './Product3'),
  loading: () => null,
});
const Product4 = Loadable({
  loader: () => import(/* webpackPrefetch: true */ './Product4'),
  loading: () => null,
});

class Home extends Component {
  render() {
    return (
      <div className="Home">
        <div className="Home-header">
          <Logo />
          <Welcome />
        </div>
        <Intro />
        <ul className="Home-resources">
          <li>
            <Link to="product">Product</Link>
          </li>
          <li>
            <Link to="product2">Product2</Link>
          </li>
          <li>
            <Link to="product3">Product3</Link>
          </li>
          <li>
            <Link to="product4">Product4</Link>
          </li>
          <li>
            <a href="https://github.com/jaredpalmer/razzle">Docs</a>
          </li>
          <li>
            <a href="https://github.com/jaredpalmer/razzle/issues">Issues</a>
          </li>
          <li>
            <a href="https://palmer.chat">Community Slack</a>
          </li>
        </ul>
        <Router>
          <Product path="product" />
          <Product2 path="product2" />
          <Product3 path="product3" />
          <Product4 path="product4" />
        </Router>
      </div>
    );
  }
}

export default Home;
