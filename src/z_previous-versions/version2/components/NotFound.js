import React from 'react';
import '../App.css';
import Header from './Header';
import { image_onthewaypana } from '../data/assets';

export default function NotFound() {
    return (
        <div className='home'>
           <Header />
           <img className='notfound-image' src={ image_onthewaypana } loading='lazy'/>
            <div className='notfound'>
                <h1>The page you are looking for does not exist.</h1>
            </div>
        </div>
    )
}