import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';
import './index.css';
import Home from './components/Home';
import Portfolio from './components/Portfolio';
import Blog from './components/Blog';
import Post from './components/Post';
import NotFound from './components/NotFound';
import Project1 from './components-projects/ExcelCustomerSupportAgentPerformance';
import Project2 from './components-projects/ExcelInternationalMarketplaceProfitForecast';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/portfolio" element={<Portfolio />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/post/:id" element={<Post />} />
      <Route path="/404" element={<NotFound />} />
      <Route path="/project/excelcustomersupportagentperformance" element={<Project1 />} />
      <Route path="/project/excelinternationalmarketplaceprofitforecast" element={<Project2 />} />
    </Routes>
  </Router>
);

reportWebVitals();