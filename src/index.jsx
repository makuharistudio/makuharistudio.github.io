import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout';
import NotFound from './pages/NotFound';
import About from './pages/About';
import Portfolio from './pages/Portfolio';
import Project from './pages/Project';
import Blog from './pages/Blog';
import Post from './pages/Post';
import Readings from './pages/Readings';
import Reading from './pages/Reading';
import Applications from './pages/Applications';
import Application from './pages/Application';
import Test from './pages/Test';
import './App.css';

const routes = [{ 
  path: '/',
  element: <Layout />,
  errorElement: <NotFound />,
  children: [
    { path: '/', element: <About /> },
    { path: '/portfolio', element: <Portfolio /> },
    { path: '/portfolio/:name', element: <Project /> },
    { path: '/blog', element: <Blog /> },
    { path: '/blog/:name', element: <Post /> },
    { path: '/readings', element: <Readings /> },
    { path: '/readings/:name', element: <Reading /> },
    { path: '/applications', element: <Applications />},
    { path: '/applications/:name', element: <Application />},
    { path: '/test', element: <Test /> }
  ]
}];

const router = createHashRouter(routes);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);