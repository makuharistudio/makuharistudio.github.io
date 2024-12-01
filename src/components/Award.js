import React from 'react';
import '../App.css';
import { assetURL } from '../data/data';
import { Link } from 'react-router-dom';

function Award({ award }) {
    return (

        <a href={award.awardurl} target='_blank'>

            <div className='award'>

                <div className='post-preview-background'></div>
                <div className='award-tech-icon-container'>
                    <img src= { award.stack} alt='' loading='lazy'/>
                </div>
                <div className='award-panel'></div>
                <div className='award-title'><p>{award.name}</p></div>
                <div className='award-id'><p>ID: {award.awardid}</p></div>

            </div>

        </a>

        );
    }
    
    export default Award;