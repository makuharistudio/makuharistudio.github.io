import React from 'react';
import '../App.css';
import { icon_globe, logo_github } from '../data/assets';

function Project({ project }) {
    return (
        <div className='project'>
            <div className='project-info'>
                <label className='project-title'>{project.title}</label>
                <div className='project-links-date'>
                    <div className='project-links'>
                        {project.siteURL && (
                            <a href={project.siteURL} target='_blank'>
                                <div className='project-link-button'>
                                    <img className='project-link-icon' src={ icon_globe } loading='lazy'/>SITE
                                </div>
                            </a>
                        )}
                        {project.codeURL && (
                            <a href={project.codeURL} target='_blank'>
                                <div className='project-link-button'>
                                    <img className='project-link-icon' src={ logo_github } loading='lazy'/>CODE
                                </div>
                            </a>
                        )}
                    </div>
                    <div className='project-date'>
                        <label>{project.shortdate}</label>
                    </div>
                </div>
                <p>{project.description}</p>
                <div className='project-tags'>
                    {project.tags.map((tag) => {
                        return <label className='project-tag'>{tag}</label>;
                    })}
                </div>
            </div>
            <a href={project.siteURL} target='_blank'>
                <center>
                    <img src={project.photo} className='project-photo' loading='lazy'/>
                </center>
            </a>
        </div>
    );
}

export default Project;