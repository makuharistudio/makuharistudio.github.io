import React from 'react'
import '../App.css'
import Banner from './Banner'
import Footer from './Footer'
import portfolio from '../data/portfolio'

export default function Projects() {
    return (
        <>
            <Banner />
            <div className='projects'>
                <center>
                    <div className='project-set'>
                    {
                        portfolio.map(function(port, index){
                            return (
                                <div key={index} className='project-tile'>
                                    <span className='stack-overlay'><img src={ port.stack } alt='' loading='lazy'/></span>
                                        <div className='stamp-overlay'>{ port.stamp }</div>
                                        <div className='stack-overlaybg'></div>
                                    <img src={ port.photo } alt='' loading='lazy'/>
                                    <div className='project-desc'>
                                        <p className='project-title'>{port.title}</p>
                                        <p>{port.description}</p>
                                    </div>
                                    <div className='project-link'>
                                        <a href={ port.siteURL } target='_blank'>SITE</a>
                                        <a href={ port.codeURL } target='_blank'>CODE</a>
                                    </div>
                                </div>
                            )
                        })
                    }
                    </div>
                </center>
            </div>
            <Footer />
        </>
    )
}