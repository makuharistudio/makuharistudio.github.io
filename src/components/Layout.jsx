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
  const [currentBackground, setCurrentBackground] = useState(null);
  const cleanupRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const loadBackground = async () => {
      // Clean up previous background
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }

      // Clear container to prevent overlap
      if (containerRef.current) {
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
      }

      try {
        const importFn = backgroundMapObject[location.pathname] || backgroundMapObject['/'];
        console.log(`Loading background for path: ${location.pathname}`);
        const backgroundModule = await importFn();
        if (isMounted && containerRef.current) {
          const cleanup = backgroundModule.initialiseBackground(containerRef.current);
          cleanupRef.current = cleanup;
          setCurrentBackground(location.pathname);
          console.log(`Background loaded for: ${location.pathname}`);
        }
      } catch (error) {
        console.error(`Failed to load background for ${location.pathname}:`, error);
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
  }, [location.pathname]);

  return (
    <>
      <MenuHeader />
      <div id="outlet">
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