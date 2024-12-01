import React from 'react';
import '../App.css';
import { icon_globe, logo_github } from '../data/assets';
import { assetURL } from '../data/data';

function Project({ project }) {
    return (

        <div className='project-shell'>

            <div className='blog-tile-header'>
                <div className='blog-title-header-rectangle'>
                    <span className='blogstamp-overlay'>
                        <img src= {`${project.stack}`} alt='' loading='lazy'/>
                    </span>
                    <a href={project.siteURL}>{project.tech}</a>
                </div>
                <div className='blog-title-header-triangle-dashes'>
                    <div className='blog-title-header-triangle' />
                    <div className='blog-title-header-dash gradient-grey-dark' />
                    <div className='blog-title-header-dash gradient-grey-medium' />
                    <div className='blog-title-header-dash gradient-grey-light' />
                </div>
            </div>

            <div className='project'>

                <div className='project-body'>

                    <div className='project-info'>
                        <label className='project-title'>{project.title}</label>

                        <p>{project.description}</p>

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

            </div>

        </div>

    );
}

export default Project;