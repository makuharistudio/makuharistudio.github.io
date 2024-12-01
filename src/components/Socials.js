import React from 'react';
import '../App.css';
import { SocialData } from '../data/socials';

function Socials() {
    const data = SocialData;
    return (
        <div className='socials'>

                {data.map((item)=>{
                    return(
                            <li>
                                <a href={item.link} target='_blank'>{item.name}</a>
                                <div className='social-gradient'></div>
                                <div className='social-border'></div>
                            </li>
                    )
                })}

        </div>);
}

export default Socials;