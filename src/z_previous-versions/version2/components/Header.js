import React, { useState } from 'react';
import '../App.css';
import MenuDesktop from './MenuDesktop';
import MenuMobile from './MenuMobile';
import { icon_menuburger, 
         title_a, title_b, title_c, title_d, title_e
} from '../data/assets';
import { displayName, ascii2, ascii3, ascii4 } from '../data/data';

function Header() {

const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <div className="header">
                <div className="header-body">

                    <div className="sitename" id="title">
                            <a href='/'>
                                <img className="site-title" src={ title_e } loading='lazy'/>
                                <img className="site-title" src={ title_d } loading='lazy'/>
                                <img className="site-title" src={ title_c } loading='lazy'/>
                                <img className="site-title" src={ title_b } loading='lazy'/>
                                <img className="site-title" src={ title_a } loading='lazy'/>
                            </a>
                        </div>         

                    <div className="menu">
                        <div className="menu-desktop">
                            <MenuDesktop />
                        </div>
                        <div className="menu-mobile">
                            <div onClick={() => setIsOpen(!isOpen)}>
                                <img className="menu-icon" src={ icon_menuburger } loading='lazy'/>
                            </div>
                            {isOpen && <MenuMobile isOpen={isOpen} setIsOpen={setIsOpen}/>}
                        </div>
                    </div>
                </div>
            </div>
            <div className="header-subtitle">
                <div className="header-subtitle-line">
                    <p>DATA ANALYTICS AND POWER BI ENTHUSIAST</p>
                </div>
            </div>

        </>
    )
}

export default Header;