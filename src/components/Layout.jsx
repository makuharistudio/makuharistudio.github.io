import { Outlet } from 'react-router-dom'
import MenuHeader from './MenuHeader'
import MenuFooter from './MenuFooter'
import useScrollToTop from '../scripts/useScrollToTop'

/* Space background */
import { useEffect, useRef } from 'react';
import { initSpaceBackground } from '../assets/theme/background/scripts/bg-space.js';

export default function Layout() {
  useScrollToTop();

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