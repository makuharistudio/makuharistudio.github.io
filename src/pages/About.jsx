import CertificationList from '../components/CertificationList'
import LinkList from '../components/LinkList'
import { avatar, title_a, title_b, title_c } from '../data/assets'
import projects from '../data/projects'
import posts from '../data/posts'
import Panel from '../assets/theme/accent/components/Panel'

export default function About() {

    const totalProjects = projects.length;
    const totalPosts = posts.length;

    return (
        <content className='content-no-bg'>
            <center><h1>ABOUT</h1></center>
            <br />
            <br />
            <Panel>
            <div id='about'>
                <div id='avatar-image'>
                    <img src={ avatar } alt='avatar' />
                </div>
                <div id='about-desc'>
                    <div id='about-title'>
                        <img src={ title_a } alt='' /><img src={ title_b } alt='' /><img src={ title_c } alt='' />
                    </div>
                    <p>Consultant with 12+ years in client services for software and healthcare industries.</p>
                    <p>Technical generalist with application problem-solving and data analysis experience.</p>
                    <ul>
                        <li>{totalProjects} side projects since October 2021</li>
                        <li>{totalPosts} blog posts since Sep 2021</li>
                    </ul>
                </div>
            </div>
            </Panel>
            <br />
            <br />
            <br />
            <CertificationList />
            <br />
            <br />
            <br />
            <LinkList />
            <br />
            <br />
            <br />
            <center><h2>SITE CREDITS</h2></center>
            <Panel>
            <div>
                <p>I designed this site and incorporated code from:</p>
                <ul>
                    <li><p><a href='https://www.linkedin.com/learning/react-creating-and-hosting-a-full-stack-site-24928483/defining-environment-variables' target='_blank'>Creating a React site with URL path management by Shaun Wassell.</a></p></li>
                    <li><p><a href='https://www.youtube.com/watch?v=gT1v33oA1gI&list=PLASldBPN_pkBfRXOkBOaeCJYzCnISw5-Z' target='_blank'>JavaScript that renders multiple page data from markdown by Will Ward.</a></p></li>
                    <li><p><a href='https://www.youtube.com/watch?v=FntV9iEJ0tU' target='_blank'>Three.js code for a rotating Earth by Robot Bobby.</a></p></li>
                </ul>
                <p><a href='https://github.com/makuharistudio/makuharistudio.github.io' target='_blank'>Visit this site's README on GitHub.</a></p>
                </div>
            </Panel>
        </content>
    );
}