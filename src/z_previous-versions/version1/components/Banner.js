import React from 'react'
import { Link } from 'react-router-dom'
import '../App.css'
import { avatar, background, 
         logo_github, logo_linkedin, logo_powerbi, logo_tableau, logo_twitter, 
         logoblue_github, logoblue_linkedin, logoblue_powerbi, logoblue_tableau, logoblue_twitter 
       } from '../data/assets'
import { displayName, ascii0, ascii1, ascii2, ascii3, ascii4, bannerDescription, githubURL, powerbiURL, tableauURL, twitterURL } from '../data/data'

/* Animated banner title and swapping name loop */
var headings = [displayName, ascii2+ascii3+ascii4];
var i = 0;
var intervalId = setInterval(function() {
  document.getElementById("title").innerHTML = headings[i];
  if (i == (headings.length - 1)) {
    i = 0;
  } else {
    i++;
  }
}, 3000)
/**/

export default function Banner() {
    return (
        <div className='banner'>
            <div className='banner-navigation'>
                <div className='menu-overlay'>
                    <ul> 
                        <Link to='/'>
                            <li>
                                <div className='menu-overlay-glow'></div>
                                PORTFOLIO
                            </li>                            
                        </Link>
                        <Link to='/blog'>
                            <li>
                                <div className='menu-overlay-glow'></div>
                                BLOG
                            </li>
                        </Link>
                        <Link to='/about'>
                            <li>
                                <div className='menu-overlay-glow'></div>
                                ABOUT
                            </li>
                        </Link>
                    </ul>
                </div>
                <center>
                    <div className='banner-title'>
                        <h4 id='title'>{ displayName }</h4>
                        <p>{ bannerDescription }</p>
                    </div>
                    <div className='banner-elements'>
                        <img src={ avatar } class='banner-avatar' loading='lazy'/>
                            <ul className='banner-button-list'>
                                <li>
                                    <a href={ githubURL } target='_blank'>
                                        <span className='banner-icon'>
                                            <img src={ logoblue_github } loading='lazy'/>
                                            <img src={ logo_github } loading='lazy'/>
                                        </span>
                                        <span className='banner-label'>GitHub</span>
                                    </a>
                                </li>
                                <li>
                                    <a href={ powerbiURL } target='_blank'>
                                        <span className='banner-icon'>
                                            <img src={ logoblue_powerbi } loading='lazy'/>
                                            <img src={ logo_powerbi } loading='lazy'/>
                                        </span>
                                        <span className='banner-label'>Power BI</span>
                                    </a>
                                </li>
                                <li>
                                    <a href={ tableauURL } target='_blank'>
                                        <span className='banner-icon'>
                                            <img src={ logoblue_tableau } loading='lazy'/>
                                            <img src={ logo_tableau } loading='lazy'/>
                                        </span>
                                        <span className='banner-label'>Tableau</span>
                                    </a>
                                </li>
                                <li>
                                    <a href={ twitterURL } target='_blank'>
                                        <span className='banner-icon'>
                                            <img src={ logoblue_twitter } loading='lazy'/>
                                            <img src={ logo_twitter } loading='lazy'/>
                                        </span>
                                        <span className='banner-label'>Twitter</span>
                                    </a>
                                </li>
                                <li>
                                    <a href={ ascii0 + ascii2 + ascii3 } target='_blank'>
                                        <span className='banner-icon'>
                                            <img src={ logoblue_linkedin } loading='lazy'/>
                                            <img src={ logo_linkedin } loading='lazy'/>
                                        </span>
                                        <span className='banner-label'>LinkedIn</span>
                                    </a>
                                </li>
                            </ul>
                    </div>
                </center>
                <video class='banner-video' autoPlay loop muted playsinline width>
                    <source src={ background } type='video/mp4'/>
                </video>
            </div>
        </div>
    )
}