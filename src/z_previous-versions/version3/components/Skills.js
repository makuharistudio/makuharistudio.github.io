import React from 'react';
import '../App.css';
import { LinkedInSkills } from '../data/linkedinskills';
import Skill from './Skill';

function Skills() {
    const data = LinkedInSkills
    return (
        <div className='skills' id='skills'>

            <div className='section-title'>
                <div className='section-title-glow' />
                <div className='section-title-text'>MY ASSESSED SKILLS</div>
            </div>

            <div className='skills-body'>
                <p>
                    These charts indicate my skill and rank among the number of people that took each LinkedIn Skills Assessment test.
                </p>
                <br />

                <div className='skills2-full-list'>
                    <div>
                        {data.map((item) => {
                            return (
                                <div className='skills2-section'>
                                    <label className='skills-section-title'>{item.type}</label>
                                    <div className='skills2-list'>
                                        {item.list.map((skill) => {
                                            return (
                                                <Skill skill={skill} />
                                            )
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                </div>
                
                <br />
                <p>
                    For more information on my other skills, please visit my LinkedIn profile.
                </p>
                <p>
                    For more information on LinkedIn's assessments, please visit the links below.
                </p>
                <ul>
                    <li>
                        <a href="https://www.linkedin.com/help/linkedin/answer/a507663" target='_blank'>How are LinkedIn Skill Assessments made and scored?</a>
                    </li>
                    <li>
                        <a href="https://www.linkedin.com/help/linkedin/answer/a507734" target='_blank'>What are the available LinkedIn Skill Assessments?</a>
                    </li>
                </ul>
            </div>

        </div>
    );
}

export default Skills;