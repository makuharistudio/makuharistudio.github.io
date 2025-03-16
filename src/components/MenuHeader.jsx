import { useLocation } from 'react-router-dom';
import { HashLink as Link } from 'react-router-hash-link';

export default function MenuHeader() {

  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav id='menu-header'>
        <ul>
            <li className={currentPath === '/' ? 'menu-header-highlight' : 'menu-header'}><Link to='/'>ABOUT</Link></li>
            <li className={currentPath.includes('/portfolio') ? 'menu-header-highlight' : 'menu-header'}><Link to='/portfolio'>PORTFOLIO</Link></li>
            <li className={currentPath.includes('/blog') ? 'menu-header-highlight' : 'menu-header'}><Link to='/blog'>BLOG</Link></li>
            <li className={currentPath.includes('/readings') ? 'menu-header-highlight' : 'menu-header'}><Link to='/readings'>READINGS</Link></li>
        </ul>
    </nav>
  )
}