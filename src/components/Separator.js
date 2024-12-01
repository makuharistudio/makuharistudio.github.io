import React from 'react';
import '../App.css';

/* Example use in other components <Separator text="Hello, world!" /> */

function Separator(props) {
    return (
            <>
                <div className='separator'>
                    <div className='separator-glow'></div>
                    <p>{props.text}</p>
                </div>
            </>
        );
}

export default Separator;
