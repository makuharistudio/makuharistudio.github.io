import React from 'react';
import { useLocation } from 'react-router-dom';
import '../App.css';
import { icon_charthistogram, icon_edit, icon_modeportrait, sound_menubutton } from '../data/assets';
import { HashLink as Link } from 'react-router-hash-link';

function Menu() {
    let soundEffect = new Audio(sound_menubutton);
    const start = () => {
        soundEffect.play();
    }

    const location = useLocation();
    const currentPath = location.pathname;

    const isActive = (path) => {
        const regex = new RegExp(`^${path}`);
        return regex.test(currentPath);
    }

    return (
        <div className='menu-container'>
            <div className='menu-buttons-container'>
                <Link to="/" onClick={start}>
                    <div className='menu-button-border menu-button-border-square'></div>
                    <div className={`menu-button-highlight menu-button-highlight-square ${currentPath === '/' ? 'menu-button-highlight-orange' : 'menu-button-highlight-blue'}`}></div>
                    <div className={`menu-button-gradient menu-button-gradient-square ${currentPath === '/' ? 'menu-button-gradient-orange' : 'menu-button-gradient-blue'}`}></div>
                    <img className='menu-button-icon' src={icon_modeportrait} loading='lazy' alt='Profile'/>
                </Link>

                <Link to="/portfolio" onClick={start}>
                    <div className='menu-button-border menu-button-border-square'></div>
                    <div className={`menu-button-highlight menu-button-highlight-square ${isActive('/portfolio') || isActive('/project') ? 'menu-button-highlight-orange' : 'menu-button-highlight-blue'}`}></div>
                    <div className={`menu-button-gradient menu-button-gradient-square  ${isActive('/portfolio') || isActive('/project') ? 'menu-button-gradient-orange' : 'menu-button-gradient-blue'}`}></div>
                    <img className='menu-button-icon' src={icon_charthistogram} loading='lazy' alt='Portfolio'/>
                </Link>

                <Link to="/blog" onClick={start}>
                    <div className='menu-button-border menu-button-border-square'></div>
                    <div className={`menu-button-highlight menu-button-highlight-square ${isActive('/blog') || isActive('/post') ? 'menu-button-highlight-orange' : 'menu-button-highlight-blue'}`}></div>
                    <div className={`menu-button-gradient menu-button-gradient-square ${isActive('/blog') || isActive('/post') ? 'menu-button-gradient-orange' : 'menu-button-gradient-blue'}`}></div>
                    <img className='menu-button-icon' src={icon_edit} loading='lazy' alt='Blog'/>
                </Link>
            </div>

            <div className='menu-labels-container'>
                <div className='menu-label'>
                    <div className={`menu-label-light ${currentPath === '/' ? 'menu-label-light-orange' : 'menu-label-light-blue'}`}></div>
                    <p>PROFILE</p>
                </div>

                <div className='menu-label'>
                    <div className={`menu-label-light ${(currentPath.includes('/portfolio') || currentPath.includes('/project')) ? 'menu-label-light-orange' : 'menu-label-light-blue'}`}></div>
                    <p>PORTFOLIO</p>
                </div>

                <div className='menu-label'>
                    <div className={`menu-label-light ${(currentPath.includes('/blog') || currentPath.includes('/post')) ? 'menu-label-light-orange' : 'menu-label-light-blue'}`}></div>
                    <p>BLOG</p>
                </div>
            </div>

            <div className='menu-shade-background'></div>
        </div>
    );
}

export default Menu;