import { Outlet, useLocation } from 'react-router-dom';
import MenuHeader from './MenuHeader';
import MenuFooter from './MenuFooter';
import ThemeToggle from './ThemeToggle';
import useScrollToTop from '../scripts/useScrollToTop';
import { useEffect, useMemo, useRef } from 'react';
import { themeBackgroundMap } from '../data/assets';
import { useTheme } from './ThemeToggle';

// Only /game/:name (Game.jsx) uses the lightweight blank background.
// /games and all other routes share the same themed background so it keeps
// running across navigation and avoids redundant WebGL teardown/init.
function isGamePlayRoute(pathname) {
  return pathname.startsWith('/game/');
}

function getBackgroundImport(theme, pathname) {
  if (pathname.startsWith('/test')) {
    return () => import('../assets/theme/background/scripts/bg-avatarsummon.js');
  }

  const map = themeBackgroundMap[theme];
  return isGamePlayRoute(pathname) ? map.game : map.default;
}

function getBackgroundKey(theme, pathname) {
  if (pathname.startsWith('/test')) {
    return 'test';
  }

  return `${theme}-${isGamePlayRoute(pathname) ? 'game' : 'default'}`;
}

export default function Layout() {
  useScrollToTop();
  const containerRef = useRef(null);
  const location = useLocation();
  const cleanupRef = useRef(null);
  const { theme } = useTheme();

  const backgroundKey = useMemo(
    () => getBackgroundKey(theme, location.pathname),
    [theme, location.pathname]
  );

  useEffect(() => {
    let isMounted = true;

    const loadBackground = async () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }

      const container = containerRef.current;
      if (!container) return;

      container.style.backgroundColor = '';
      container.style.backgroundImage = '';
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }

      try {
        const importFn = getBackgroundImport(theme, location.pathname);
        const backgroundModule = await importFn();
        if (isMounted && containerRef.current) {
          const cleanup = backgroundModule.initialiseBackground(containerRef.current);
          cleanupRef.current = cleanup;
        }
      } catch (error) {
        console.error('Failed to load background:', error);
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
  }, [backgroundKey, theme, location.pathname]);

  return (
    <>
      <ThemeToggle />
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
