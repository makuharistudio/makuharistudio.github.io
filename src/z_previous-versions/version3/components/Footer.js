import React from 'react';
import '../App.css';

function Footer() {

    let year =  new Date().getFullYear();

    return (
        <div className='footer'>
            <p>website happily coded by me using React.js | ⓒ {year}</p>
            <a href="https://www.flaticon.com/uicons" target='_blank'>User interface icons by Flaticon</a>
            <a href="https://storyset.com/data" target='_blank'>Data illustration by Storyset</a>
        </div>


    );
}

export default Footer;