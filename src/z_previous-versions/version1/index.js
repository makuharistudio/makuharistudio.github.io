import React from 'react'
import ReactDOM from 'react-dom'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import reportWebVitals from './reportWebVitals'
import './index.css';
import Projects from './components/Projects'
import Blog from './components/Blog'
import Post from './components/Post'
import About from './components/About'
import NotFound from './components/NotFound'
/* import App from './App'; */
/* import About from './components/About'; */

ReactDOM.render(
    <div>
      <Router>
        <Routes>
          <Route exact path="/" component={Projects} />
          <Route exact path="/blog" component={Blog} />
          <Route exact path="/about" component={About} />
          <Route exact path="/404" component={NotFound} />
          <Route exact path="/post/:id" render={props => <Post {...props} />}
          />
        </Routes>
      </Router>
    </div>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
