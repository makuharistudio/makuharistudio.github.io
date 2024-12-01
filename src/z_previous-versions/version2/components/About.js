import React from 'react';
import '../App.css';
import { avatar, image_sentimentanalysis_animated } from '../data/assets';
import { icon_menuburger, 
    title_a, title_b, title_c, title_d, title_e
} from '../data/assets';
import Links from './Links';

function About() {
    return (
        <div className='about'>

            <div className='about-top'>

                <div className='about-links'>
                    <Links />                    
                </div>


                <div className='about-info'>

                    <div className='about-title'>
                        <img className='about-avatar' src={ avatar } loading='lazy'/>
                        <label className='section-title'>ABOUT ME</label>
                    </div>
                    <p>Customer service veteran with strong foundational data skills from SaaS support work and personal projects.</p>
                    <p>My career goal is to constantly challenge myself learning data technologies and leveraging those skills to provide excellent solutions for clients.</p>

                </div>
                <div className='about-photo'>
                    <img className='about-image' src={ image_sentimentanalysis_animated } loading='lazy'/>
                </div>
            </div>

            <div className='about-bottom'>

            </div>

        </div>
    );
}

export default About;