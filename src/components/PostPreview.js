import React from 'react';
import '../App.css';
import { assetURL } from '../data/data';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';

/*
Add above project-preview-blurb div, css is already done for portrait and landscape.
Decided not to include since it looks too "busy".
            <div className='project-tags'>
                {project.tags.map((tag) => {
                    return <label className='project-tag'>{tag}</label>;
                })}
            </div>
*/

function PostPreview({ post }) {
    return (

        <div className='post-preview'>

            
            <div className='post-preview-background'></div>
            <div className='post-preview-tech-icon-container'>
                <img src= {`${ assetURL }${post.tech}.svg`} alt='' loading='lazy'/>
            </div>
            <div className='post-preview-panel'></div>
            <div className='post-preview-date'><p>{post.date}</p></div>
            <div className='post-preview-title'><p>{post.title}</p></div>
            <div className='post-preview-excerpt'>
                <p><ReactMarkdown className='blog-desc-preview'>{post.excerpt}</ReactMarkdown></p>
            </div>
            <Link to={`/post/${post.id}`}></Link>

        </div>

    );
}

export default PostPreview;