import React from 'react';
import '../App.css';
import { icon_circleright, logo_github, sound_projectlink } from '../data/assets';

/*
Add above project-preview-blurb div, css is already done for portrait and landscape.
Decided not to include since it looks too "busy".
            <div className='project-tags'>
                {project.tags.map((tag) => {
                    return <label className='project-tag'>{tag}</label>;
                })}
            </div>
*/

function ProjectPreview({ project }) {

    let soundEffect = new Audio(sound_projectlink)
    const start = () => {
        soundEffect.play()
      }

    return (

        <div className='project-preview'>

            <div className='project-preview-header'>{project.title}</div>
            <div className='project-preview-tab-container'>
                <div className='separator-glow'></div>
                <div className='project-preview-tab'>
                    <p>{project.shortdate}</p>
                </div>
            </div>
            <div className='project-preview-background'></div>
            <div className='project-preview-photo'>
                <img src={project.photo} loading='lazy'/>
            </div>
            <div className='project-preview-blurb'><p>{project.description}</p></div>
            <div className='project-preview-footer'>
                <a className='code-link-button' href={project.codeURL} target='_blank'></a>
                <p className='code-link-label-position'>CODE</p>
                <div className='code-link-icon-container'>
                    <img className='code-link-icon' src={ logo_github } loading='lazy'/>
                </div>
                <a className='project-link-button' href={project.siteURL} target='_blank' onClick={start}></a>
                <p className='project-link-label-position'>OPEN</p>
                <div className='project-link-icon-container'>
                    <img className='project-link-icon' src={ icon_circleright } loading='lazy'/>
                </div>
            </div>
        </div>

    );
}

export default ProjectPreview;