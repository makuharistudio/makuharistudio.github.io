import { useLocation } from 'react-router-dom';
import { HashLink as Link } from 'react-router-hash-link';
import {
  menu_about, menu_project, menu_blog, menu_reading,
  menu_about_active, menu_project_active, menu_blog_active, menu_reading_active,
} from '../data/assets';

export default function MenuHeader() {

  const location = useLocation();
  const currentPath = location.pathname;

  const linkConfigs = [
    {
      to: '/',
      label: 'ABOUT',
      isActive: currentPath === '/',
      iconDefault: menu_about,
      iconActive: menu_about_active,      
      lightActive: 'menu-header-light-highlight-red',
    },
    {
      to: '/projects',
      label: 'PROJECT',
      isActive: currentPath.includes('/project'),
      iconDefault: menu_project,
      iconActive: menu_project_active,
      lightActive: 'menu-header-light-highlight-purple',
    },
    {
      to: '/blog',
      label: 'BLOG',
      isActive: currentPath.includes('/blog'),
      iconDefault: menu_blog,
      iconActive: menu_blog_active,
      lightActive: 'menu-header-light-highlight-yellow',
    },
    {
      to: '/readings',
      label: 'READING',
      isActive: currentPath.includes('/reading'),
      iconDefault: menu_reading,
      iconActive: menu_reading_active,
      lightActive: 'menu-header-light-highlight-blue',
    },
  ];

  return (
    <nav id='menu-header'>
      {linkConfigs.map((link, index) => (
        <Link key={index} to={link.to}>
          <div className='menu-header-button'>
            {link.iconDefault && (
              <img src={link.isActive ? link.iconActive : link.iconDefault} alt={link.label}/>)}
          </div>
          <div className='menu-header-label'>
            <h3 className={link.isActive ? 'menu-header' : ''}>{link.label}</h3>
          </div>
        </Link>
      ))}
    </nav>
  )
}