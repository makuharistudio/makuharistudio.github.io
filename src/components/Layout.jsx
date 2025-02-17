import { Outlet } from 'react-router-dom'
import MenuHeader from './MenuHeader'
import MenuFooter from './MenuFooter'
import useScrollToTop from '../scripts/useScrollToTop'
import scrollIntoView from '../scripts/scrollIntoView.js'

/* Space background */
import React, { useEffect, useRef } from 'react';
import { initSpaceBackground } from '../assets/theme/background/scripts/bg-space.js';


export default function Layout() {

  useScrollToTop();
  scrollIntoView();

  const containerRef = useRef();
  
  useEffect(() => {
      let cleanup;
      if (containerRef.current) {
        cleanup = initSpaceBackground(containerRef.current);
      }
      return () => {
        if (cleanup) cleanup();
      };
    }, []
  );
  

  return (
      <>
        <MenuHeader />
        <div id="outlet">
          <Outlet />
        </div>
        <MenuFooter />
        <div id="bg-space" ref={containerRef}></div>
      </>
    )

}