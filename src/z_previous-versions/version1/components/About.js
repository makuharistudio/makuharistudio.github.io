import React from 'react'
import '../App.css'
import Banner from './Banner'
import Footer from './Footer'
import aboutText from '../data/about.json'
import ReactMarkdown from 'react-markdown'


export default function About() {
    return (
        <>
            <Banner />

            <div className='post'>
                <center>
                    <div className='post-body'>
                        <ReactMarkdown >{aboutText[0].content}</ReactMarkdown>
                    </div>
                </center>
            </div>
            <Footer />
        </>
    )
}