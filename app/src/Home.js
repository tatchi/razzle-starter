import React, { Component } from 'react';
import Loadable from 'react-loadable';
import { Link, Route } from 'react-router-dom';
import './Home.css';
import Logo from './Logo';
import Intro from './Intro';
import Welcome from './Welcome';

const Product = Loadable({
  loader: () => import('./Product'),
  loading: () => <div>loading...</div>,
});
const Product2 = Loadable({
  loader: () => import('./Product2'),
  loading: () => null,
});
const Product3 = Loadable({
  loader: () => import('./Product3'),
  loading: () => null,
});
const Product4 = Loadable({
  loader: () => import('./Product4'),
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
            <Link to="/Product">Product</Link>
          </li>
          <li>
            <Link to="/Product2">Product2</Link>
          </li>
          <li>
            <Link to="/Product3">Product3</Link>
          </li>
          <li>
            <Link to="/product4">Product4</Link>
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
        <Route exact path="/product" component={Product} />
        <Route exact path="/product2" component={Product2} />
        <Route exact path="/product3" component={Product3} />
        <Route exact path="/product4" component={Product4} />
      </div>
    );
  }
}

export default Home;
