import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout';
import NotFound from './pages/NotFound';
import About from './pages/About';
import Projects from './pages/Projects';
import Project from './pages/Project';
import Blog from './pages/Blog';
import Post from './pages/BlogPost';
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
    { path: '/projects', element: <Projects /> },
    { path: '/project/:name', element: <Project /> },
    { path: '/blog', element: <Blog /> },
    { path: '/blog/:name', element: <Post /> },
    { path: '/readings', element: <Readings /> },
    { path: '/reading/:name', element: <Reading /> },
    { path: '/applications', element: <Applications />},
    { path: '/application/:name', element: <Application />},
    { path: '/test', element: <Test /> }
  ]
}];

const router = createHashRouter(routes);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);