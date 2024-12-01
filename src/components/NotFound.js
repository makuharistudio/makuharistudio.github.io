import React from 'react';
import '../App.css';
import Header from './Header';
import Footer from './Footer';

function NotFound() {
    return (
        <div className='container page'>
        
            <div className="interface">
                <Header mp3credit='♪♪♪ Now playing: Time Flows by Evgeny_Bardyuzha @ pixabay.com' mp3='https://github.com/makuharistudio/makuharistudio.github.io/raw/main/src/assets-theme/music-evgeny-bardyuzha-time-flows.mp3' />

                <div className='not-found'>
                    <p>The blog post ID number in your browser address bar is not valid. Please navigate to the PORTFOLIO section below to find my blog posts.</p>
                    <div className='not-found-glow-left'></div>
                    <div className='not-found-glow-right'></div>
                    <div className='not-found-gradient'></div>
                    <div className='not-found-rectangle'></div>
                </div>

                <Footer />
            </div>

            <div className="bg-blue">
                <div lassName="bg-blue-map">
                    <div className="bg-blue-tiles">
                        <center>
                            <div className='gear-blue-1 gear-1-spin'></div>
                            <div className='gear-blue-2 gear-2-spin'></div>
                        </center>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default NotFound;