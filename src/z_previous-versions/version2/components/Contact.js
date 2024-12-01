import React from 'react';
import '../App.css';
import Separator from './Separator';
import Links from './Links';

function Contact() {
    return (
        <div className='contact' id='contact'>
            <Separator />
            <label className='section-title'>CONTACT</label>
            <p>Please feel free to contact me on these platforms:</p>
            <Links />
        </div>
    );
}

export default Contact;