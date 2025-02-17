/* This hook will scroll the user to the top of the page when they navigate to a new page. */
/* A page fade is used in css to hide the abrupt nature of the scroll. */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const useScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const scrollTimeout = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 500);

    return () => clearTimeout(scrollTimeout);
  }, [pathname]);
};

export default useScrollToTop;