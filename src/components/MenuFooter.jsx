import { useLocation } from 'react-router-dom';
import { HashLink as Link } from 'react-router-hash-link';
import {
  menu_about, menu_project, menu_blog, menu_reading, menu_blank,
  menu_about_active, menu_project_active, menu_blog_active, menu_reading_active,
} from '../data/assets';

export default function MenuFooter() {
  const location = useLocation();
  const currentPath = location.pathname;

  // Map each route to its default and active images (hover removed)
  const linkConfigs = [
    {
      to: '/',
      label: 'ABOUT',
      isActive: currentPath === '/',
      iconDefault: menu_about,
      iconActive: menu_about_active,      
      lightDefault: 'menu-footer-light-highlight-teal',
      lightActive: 'menu-footer-light-highlight-red',
    },
    {
      to: '/projects',
      label: 'PROJECT',
      isActive: currentPath.includes('/project'),
      iconDefault: menu_project,
      iconActive: menu_project_active,
      lightDefault: 'menu-footer-light-highlight-teal',
      lightActive: 'menu-footer-light-highlight-purple',
    },
    {
      to: '/blog',
      label: 'BLOG',
      isActive: currentPath.includes('/blog'),
      iconDefault: menu_blog,
      iconActive: menu_blog_active,
      lightDefault: 'menu-footer-light-highlight-teal',
      lightActive: 'menu-footer-light-highlight-yellow',
    },
    {
      to: '/readings',
      label: 'READING',
      isActive: currentPath.includes('/reading'),
      iconDefault: menu_reading,
      iconActive: menu_reading_active,
      lightDefault: 'menu-footer-light-highlight-teal',
      lightActive: 'menu-footer-light-highlight-blue',
    },
    {
      to: '/',
      label: '- - - - -',
      iconDefault: menu_blank,
      iconActive: menu_blank,
      isActive: false,
      lightDefault: 'menu-footer-light-highlight-white',
      lightActive: 'menu-footer-light-highlight-white',
    },
    {
      to: '/',
      label: '- - - - -',
      iconDefault: menu_blank,
      iconActive: menu_blank,
      isActive: false,
      lightDefault: 'menu-footer-light-highlight-white',
      lightActive: 'menu-footer-light-highlight-white',
    },
  ];

  return (
    <nav id="menu-footer">
      {linkConfigs.map((link, index) => (
        <Link key={index} to={link.to}>
          <div className='menu-footer-button'>
            {link.iconDefault && (
              <img src={link.isActive ? link.iconActive : link.iconDefault} alt={link.label}/>)}
          </div>
          <div className={`menu-footer-light ${ link.isActive ? link.lightActive : link.lightDefault }`}>
          </div>
          <div className='menu-footer-label'>
            <h6 className={link.isActive ? 'menu-footer' : ''}>{link.label}</h6>
          </div>
        </Link>
      ))}
    </nav>
  );
}