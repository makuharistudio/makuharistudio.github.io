import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom'; // Import useLocation
import '../App.css';
import Header from './Header';
import About from './About';
import Awards from './Awards';
import Footer from './Footer';
import { music_home } from '../data/assets';
import { useClickRipple } from '../assets-style/useClickRipple';

function Home() {
  const screenRef = useRef();
  const location = useLocation(); // Get the current route

  useClickRipple(screenRef, {});

  useEffect(() => {
    if (location.pathname === '/') { // Only run this if the current page is "/"
      const linesContainer = document.getElementById('bg-home-lines-container');
      const numberOfLines = 500;

      if (linesContainer) {
        for (let i = -Math.floor(numberOfLines / 2); i <= Math.floor(numberOfLines / 2); i++) {
          const line = document.createElement('div');
          line.className = 'bg-home-line';
          line.style.setProperty('--i', i);
          linesContainer.appendChild(line);
        }
      }

      // Function to create and animate the squares
      const createSquare = () => {
        const square = document.createElement('div');
        square.className = 'bg-home-square';

        const startPosX = Math.random() * (window.innerWidth - 100); 
        const startPosY = Math.random() * (window.innerHeight - 100);

        square.style.left = startPosX + 'px';
        square.style.bottom = startPosY + 'px';

        const riseDuration = Math.random() * (25 - 10) + 10;
        const spinAnimation = `square-spin${Math.floor(Math.random() * 3) + 1}`;
        square.style.animation = `square-rise ${riseDuration}s linear forwards, square-sway 5s ease-in-out infinite, ${spinAnimation} ${riseDuration}s linear infinite`;

        document.querySelector('.container').appendChild(square);

        setTimeout(() => {
          square.remove();
        }, riseDuration * 1000);
      };

      const generateWave = () => {
        const numSquares = Math.floor(Math.random() * 8) + 1;
        for (let i = 0; i < numSquares; i++) {
          setTimeout(createSquare, i * 500);
        }
      };

      // Start the wave initially and repeat every 15 seconds
      const intervalId = setInterval(generateWave, 15000);
      generateWave(); // Start the wave animation

      return () => {
        clearInterval(intervalId); // Clean up interval on unmount
      };
    }
  }, [location.pathname]); // Re-run this effect when the location changes

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
        <div className="bg-home-sphere-container bg-home-sphere-container-1">
          <div className="bg-home-sphere bg-home-sphere-1"></div>
        </div>

        <div className="bg-home-sphere-container bg-home-sphere-container-2">
          <div className="bg-home-sphere bg-home-sphere-2"></div>
        </div>

        <div className="bg-home-map-1"></div>
        <div className="bg-home-map-2"></div>

        <div className="bg-home-gear-orbit-container">
          <div className="bg-home-gear-orbit-gear bg-home-gear-orbit-gear-1"></div>
          <div className="bg-home-gear-orbit-gear bg-home-gear-orbit-gear-2"></div>
        </div>

        <div className="bg-home-lines-container" id="bg-home-lines-container"></div>
        <div className="bg-home-background"></div>
      </div>
    </div>
  );
}

export default Home;