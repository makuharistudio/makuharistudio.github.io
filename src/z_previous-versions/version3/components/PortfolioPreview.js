import React from 'react';
import '../App.css';
import Project from './Project';
import portfolio from '../data/portfolio';
import { Link } from 'react-router-dom';

function PortfolioPreview() {
    const data = portfolio;
    const countAllProjects = data.length;
    return (
        <div className='portfolio' id='portfolio'>

            <div className='section-title'>
                <div className='section-title-glow' />
                <div className='section-title-text'>MY PORTFOLIO PREVIEW</div>
            </div>

            <div className='portfolio-preview'>
                {data.map((project)=>{
                    return <Project project={project} />;
                })}
            </div>

            <Link to='/portfolio'>
                <div className='section-button'>
                    <p>CLICK HERE FOR ALL { countAllProjects } PROJECTS WITH CODE LINKS</p>
                </div>
            </Link>

        </div>
    );
}

export default PortfolioPreview;