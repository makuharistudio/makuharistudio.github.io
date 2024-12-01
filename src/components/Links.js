import React from 'react';
import '../App.css';
import { LinkData } from '../data/links';

function Links() {
    const data = LinkData;
    return (
        <div className='links'>

                {data.map((item)=>{
                    return(
                            <li>
                                <a href={item.link} target='_blank'>
                                    <img src={item.icon} className='link-icon' loading='lazy'/>
                                </a>
                                <div className="link-gradient"></div>
                                <div className="link-border"></div>
                            </li>
                    )
                })}

        </div>);
}

export default Links;