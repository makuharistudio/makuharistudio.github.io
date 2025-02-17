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

  // Detect if the device is a desktop/laptop
  const isDesktop = () => {
    return (
      !/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) &&
      window.matchMedia('(min-width: 1024px)').matches
    );
  };

  if (isDesktop()) {
    scrollIntoView();
  }

  const containerRef = useRef();

  useEffect(() => {
    let cleanup;
    if (containerRef.current) {
      cleanup = initSpaceBackground(containerRef.current);
    }
    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  return (
    <>
      <MenuHeader />
      <div id="outlet">
        <Outlet />
      </div>
      <MenuFooter />
      <div id="bg-space" ref={containerRef}></div>
    </>
  );
}