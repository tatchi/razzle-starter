import React from 'react';
import Home from './Home';
import { Router } from '@reach/router';
import './App.css';

const Lol = () => <div>salut</div>;

const App = () => (
  <Router>
    <Home path="/*" />
  </Router>
);

export default App;
