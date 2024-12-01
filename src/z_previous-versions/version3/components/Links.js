import React from 'react';
import '../App.css';
import { SocialData } from '../data/social';

  function Links() {
    const data = SocialData;
    return (
        <div className='links'>
            <ul>
                {data.map((item)=>{
                    return(
                            <li>
                                <a href={item.link} target='_blank'>
                                    <div className='link'>
                                        <div className='link-icon-container'>
                                            <img src={item.icon} className='link-icon' loading='lazy'/>
                                        </div>
                                        <div className='link-text'>
                                            {item.platform}
                                        </div>
                                    </div>
                                </a>
                            </li>
                    )
                })}
            </ul>
        </div>);
}

export default Links;