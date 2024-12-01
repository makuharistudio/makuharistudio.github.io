import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import '../App.css';
import Header from './Header';
import About from './About';
import Awards from './Awards';
import Footer from './Footer';
import { music_home } from '../data/assets';
import { useClickRipple } from '../assets-style/useClickRipple';

function Home() {
  const screenRef = useRef();
  const location = useLocation();

  useClickRipple(screenRef, {});

  // Add stars effect
  useEffect(() => {
    const bgHomeDiv = document.querySelector('.bg-home-stars');
    if (bgHomeDiv) {
      const containerHeight = bgHomeDiv.clientHeight;
      const containerWidth = bgHomeDiv.clientWidth;
      const fragment = document.createDocumentFragment();
  
      for (let i = 0; i < 1500; i++) {
        const star = document.createElement('div');
        star.className = 'bg-home-star';
  
        // Generate a random multiplier between 1 and 3
        const sizeMultiplier = 1 + Math.random() * 2;
  
        // Apply the size to width and height
        star.style.width = `${0.1 * sizeMultiplier}vw`;
        star.style.height = `${0.1 * sizeMultiplier}vw`;
        star.style.borderRadius = `${0.25 * sizeMultiplier}vw`;
  
        star.style.animation = `bg-home-twinkle ${(Math.random() * 5) + 5}s linear ${(Math.random() * 5) + 5}s infinite`;
        star.style.top = Math.random() * containerHeight + 'px';
        star.style.left = Math.random() * containerWidth + 'px';
        fragment.appendChild(star);
      }
      bgHomeDiv.appendChild(fragment);
    }
  }, []);

  return (
    <div className='container page' ref={screenRef}>
      <div className="interface">
        <Header mp3credit='♪♪♪ Now playing: Dreamy Inspiring Electronic by Evgeny_Bardyuzha @ pixabay.com' mp3={music_home} />
        <About />
        <br /><br />
        <Awards />
        <br /><br /><br /><br /><br /><br />
        <Footer />
      </div>

      <div className="bg-home">
        <div className="bg-home-planet">
          <div className="bg-home-mars-halo"></div>
          <div className="bg-home-mars">
            <div className="bg-home-mars-map"></div>
          </div>
        </div>

        <div className="bg-home-stars"></div>

      </div>

    </div>
  );
}

export default Home;