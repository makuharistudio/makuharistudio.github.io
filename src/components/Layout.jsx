import { Outlet, useLocation } from 'react-router-dom';
import MenuHeader from './MenuHeader';
import MenuFooter from './MenuFooter';
import useScrollToTop from '../scripts/useScrollToTop';
import { useEffect, useRef, useState } from 'react';
import { backgroundMap } from '../data/assets';

// Convert backgroundMap array to object for compatibility
const backgroundMapObject = backgroundMap.reduce((acc, { path, script }) => {
  acc[path] = script;
  return acc;
}, {});

export default function Layout() {
  useScrollToTop();
  const containerRef = useRef(null);
  const location = useLocation();
  const cleanupRef = useRef(null);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadBackground = async () => {
      if (backgroundLoaded) return;

      const initialPath = location.pathname;
      if (initialPath.startsWith('/game') || initialPath === '/games' ) return;

      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }

      if (containerRef.current) {
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
      }

      try {
        const path = location.pathname;
        const backgroundKey = Object.keys(backgroundMapObject).find(key => path.startsWith(key)) || '/';
        const importFn = backgroundMapObject[backgroundKey];
        const backgroundModule = await importFn();
        if (isMounted && containerRef.current) {
          const cleanup = backgroundModule.initialiseBackground(containerRef.current);
          cleanupRef.current = cleanup;
          setBackgroundLoaded(true);
        }
      } catch (error) {
        console.error(`Failed to load background:`, error);
      }
    };

    loadBackground();

    return () => {
      isMounted = false;
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, []); // Load once on mount

  useEffect(() => {
    const path = location.pathname;
    const isGamePath = path.startsWith('/game') || path === '/games';

    if (isGamePath) {
      // Game: cleanup space-earth, set black
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      if (containerRef.current) {
        containerRef.current.style.backgroundColor = '#000000';
        containerRef.current.style.backgroundImage = 'none';
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
      }
    } else if (!cleanupRef.current) {
      // Non-game & cleaned: reload space-earth
      const loadSpaceEarth = async () => {
        try {
          const spaceEarthFn = backgroundMapObject['/'];
          const module = await spaceEarthFn();
          if (containerRef.current) {
            const cleanup = module.initialiseBackground(containerRef.current);
            cleanupRef.current = cleanup;
          }
        } catch (error) {
          console.error('Reload space-earth failed:', error);
        }
      };
      loadSpaceEarth();
    }
  }, [location.pathname]); // Switch on navigation

  return (
    <>
      <MenuHeader />
      <div id="outlet">
        <br />
        <br />
        <Outlet />
      </div>
      <MenuFooter />
      <div
        id="bg-space"
        ref={containerRef}
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}
      />
    </>
  );
}