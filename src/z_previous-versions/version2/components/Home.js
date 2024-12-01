import React from 'react';
import '../App.css';
import Header from './Header';
import Body from './Body';
import Footer from './Footer';

function Home() {
    return (

        <>
            <Header />

            <div className="home">
                <Body />
            </div>

            <Footer />

        </>
    );
}

export default Home;