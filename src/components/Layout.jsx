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
  const [backgroundLoaded, setBackgroundLoaded] = useState(false); // Track if background is already loaded

  useEffect(() => {
    let isMounted = true;

    const loadBackground = async () => {
      // Only load if not already loaded
      if (backgroundLoaded) return;

      // Clean up if somehow previous exists (though shouldn't)
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }

      // Clear container
      if (containerRef.current) {
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
      }

      try {
        // Load based on initial path (or fallback to '/')
        const initialPath = location.pathname;
        const importFn = backgroundMapObject[initialPath] || backgroundMapObject['/'];

        const backgroundModule = await importFn();
        if (isMounted && containerRef.current) {
          const cleanup = backgroundModule.initialiseBackground(containerRef.current);
          cleanupRef.current = cleanup;
          setBackgroundLoaded(true); // Mark as loaded

        }
      } catch (error) {
        console.error(`Failed to load background:`, error);
      }
    };

    loadBackground();

    // Cleanup on unmount (e.g., if Layout ever unmounts, though it shouldn't in this setup)
    return () => {
      isMounted = false;
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, []); // Empty dependency array: load only once on mount

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