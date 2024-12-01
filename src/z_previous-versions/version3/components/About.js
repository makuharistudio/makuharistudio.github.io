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

                <div className='section-title'>
                    <div className='section-title-glow' />
                    <div className='section-title-text'>ABOUT ME</div>
                </div>

            <div className='about-top'>

                <div className='about-info'>

                    <div className='about-title'>

                        <div className='about-avatar-outer-border'>
                            <div className='about-avatar-mid-border'>
                                <div className='about-avatar-inner-border'>
                                    <img className='about-avatar' src={ avatar } loading='lazy'/>
                                </div>
                            </div>
                        </div>

                    </div>

                    <p>Software support veteran with data analysis skills.</p>
                    <p>| Excel | Power BI | SQL |</p>

                </div>

                <div className='about-info'>

                    <p>My portfolio summary:</p>

                    <ul>
                        <li>5 x published Power BI projects</li>
                        <li>2 x downloadable Excel projects</li>
                        <li>1 x SQL Server project</li>
                        <li>1 x this React.js site</li>
                        <li>18 blog spots since Sep 2021</li>
                    </ul>

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