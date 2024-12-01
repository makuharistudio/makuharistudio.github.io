import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Routes, Route } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';
import './index.css';
import Home from './components/Home';
import Portfolio from './components/Portfolio';
import Blog from './components/Blog';

import Post from './components/Post';
import NotFound from './components/NotFound';

import Project1 from './components-projects/ExcelCustomerSupportAgentPerformance';
import Project2 from './components-projects/ExcelInternationalMarketplaceProfitForecast';

ReactDOM.render(
  <div>
    <Router>
      <Routes>
        <Route exact path="/" component={Home} />
        <Route exact path="/portfolio" component={Portfolio} />
        <Route exact path="/blog" component={Blog} />
        <Route exact path="/post/:id" render={props => <Post {...props} />} />
        <Route exact path="/404" component={NotFound} />
        <Route exact path="/project/excelcustomersupportagentperformance" component={Project1} />
        <Route exact path="/project/excelinternationalmarketplaceprofitforecast" component={Project2} />
      </Routes>
    </Router>
  </div>,

  document.getElementById('root')
);

reportWebVitals();
