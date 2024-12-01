import React from 'react';
import About from './About';
import PortfolioPreview from './PortfolioPreview';
import Skills from './Skills';
import BlogPreview from './BlogPreview';
import Contact from './Contact';

function Body() {
    return (
        <div className='body'>
            <About />
            <PortfolioPreview />
            <BlogPreview />
            <Skills />
            <Contact />
        </div>
    );
}

export default Body;