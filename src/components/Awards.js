import React from 'react';
import '../App.css';
import Separator from './Separator';
import awards from '../data/awards';
import Award from './Award';

function Awards() {

    const data = awards;

    return (

        <div className='awards' id='awards'>

            <Separator text="CERTIFICATION LINKS" />

            <div className='awards-carousel'>
                {data.map((award)=>{
                    return <Award award={award} />;
                })}
            </div>

        </div>

    );
}

export default Awards;