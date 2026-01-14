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
                <img src={ avatar } alt='avatar' />
                <div id='about-desc'>
                    <div id='about-title'>
                        <img id='avatar-image' src={ title_a } alt='' /><img src={ title_b } alt='' /><img src={ title_c } alt='' />
                    </div>
                    <p>A tech-savvy consultant with over 12 years client services experience in the advertising software and healthcare industries.</p>
                    <p>Specialist in application problem-solving and performing data analysis with SQL querying, Excel data models, and Power BI.</p>
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
                <div id='credits'>
                <p>I designed and coded this website, but also incorporated the following:</p>
                <ul>
                    <li><p>Creating a React site with URL path management: a LinkedIn Learning course by Shaun Wassell <a href='https://www.linkedin.com/learning/react-creating-and-hosting-a-full-stack-site-24928483/defining-environment-variables' target='_blank'>https://www.linkedin.com/learning/react-creating-and-hosting-a-full-stack-site-24928483/defining-environment-variables</a>.</p></li>
                    <li><p>JavaScript code that renders multiple page data from markdown: a YouTube tutorial by Will Ward <a href='https://www.youtube.com/watch?v=gT1v33oA1gI&list=PLASldBPN_pkBfRXOkBOaeCJYzCnISw5-Z' target='_blank'>https://www.youtube.com/watch?v=gT1v33oA1gI&list=PLASldBPN_pkBfRXOkBOaeCJYzCnISw5-Z</a>.</p></li>
                    <li><p>Three.js code for a rotating Earth: a YouTube tutorial by Robot Bobby <a href='https://www.youtube.com/watch?v=FntV9iEJ0tU' target='_blank'>https://www.youtube.com/watch?v=FntV9iEJ0tU</a>.</p></li>
                </ul>
                <p>To create your own GitHub Pages site using React, you can refer to this site's <a href='https://github.com/makuharistudio/makuharistudio.github.io' target='_blank'>README</a> on GitHub.</p>
                </div>
            </Panel>
        </content>
    );
}