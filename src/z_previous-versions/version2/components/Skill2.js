import React from 'react';
import '../App.css';

/*

            <CircularProgressbarWithChildren
                strokeWidth={3}
                value={100 - skill.score}
                styles={buildStyles({
                    pathColor: "#23a9f2",
                    trailColor: "#E9F6FE"
                })}>
                <label className='skill-name'>{ skill.shortname }</label>
                <img className='skill-icon'
                  src={ skill.icon }
                  alt={ skill.name }
                />
                <label className='skill-score'>Top {`${ skill.score }%`} of {skill.taken}</label>
                <label className='skill-date'>{skill.shortdate}</label>
            </CircularProgressbarWithChildren>

*/


function Skill2({ skill }) {
    let progress = 100 - skill.score;

    return (
        <div className='skill2'>

            <div className='skill2-iconcontainer'>
                <img className='skill2-icon'
                    src={ skill.icon }
                    alt={ skill.name }
                    loading='lazy'
                />
            </div>

            <div className='skill2-bar'>

                <div className='skill2-progress-bar'>

                    <div className='skill2-progress-bar-fill' style={{width: progress+"%"}} >
                        Top {`${ skill.score }%`} of
                    </div>

                    <div className='skill2-progress-bar-fill-end'>

                </div>

                </div>

                <div className='skill2-subtext'>
                    <label className='skill2-name'>{ skill.shortname }</label>
                    <label className='skill2-people'>{ skill.taken +" people"}</label>
                </div>

            </div>

        </div>
    )
}

export default Skill2;