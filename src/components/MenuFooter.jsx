import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { HashLink as Link } from 'react-router-hash-link';
import {
  icon_modeportrait,
  icon_modeportrait_highlight,
  icon_charthistogram,
  icon_charthistogram_highlight,
  icon_edit,
  icon_edit_highlight,
  icon_bookopen,
  icon_bookopen_highlight,
} from '../data/assets';

export default function MenuFooter() {
  const location = useLocation();
  const currentPath = location.pathname;
  const [hoveredLink, setHoveredLink] = useState(null); // Track which link is hovered

  // Map each route to its default, highlight, and hover images
  const linkConfigs = [
    {
      to: '/',
      label: 'ABOUT',
      defaultIcon: icon_modeportrait,
      activeIcon: icon_modeportrait_highlight,
      hoverIcon: icon_modeportrait_highlight,
      isActive: currentPath === '/',
    },
    {
      to: '/portfolio',
      label: 'PORTFOLIO',
      defaultIcon: icon_charthistogram,
      activeIcon: icon_charthistogram_highlight,
      hoverIcon: icon_charthistogram_highlight,
      isActive: currentPath.includes('/portfolio'),
    },
    {
      to: '/blog',
      label: 'BLOG',
      defaultIcon: icon_edit,
      activeIcon: icon_edit_highlight,
      hoverIcon: icon_edit_highlight,
      isActive: currentPath.includes('/blog'),
    },
    {
      to: '/readings',
      label: 'READINGS',
      defaultIcon: icon_bookopen,
      activeIcon: icon_bookopen_highlight,
      hoverIcon: icon_bookopen_highlight,
      isActive: currentPath.includes('/readings'),
    },
    {
      to: '/',
      label: '- - - - -',
      defaultIcon: null,
      activeIcon: null,
      hoverIcon: null,
      isActive: false,
    },
    {
      to: '/',
      label: '- - - - -',
      defaultIcon: null,
      activeIcon: null,
      hoverIcon: null,
      isActive: false,
    },
  ];

  return (
    <nav id="menu-footer">
      {linkConfigs.map((link, index) => (
        <Link
          key={index}
          to={link.to}
          onMouseEnter={() => setHoveredLink(index)}
          onMouseLeave={() => setHoveredLink(null)}
        >
          <div
            className={`menu-footer-button-border ${
              link.isActive ? 'menu-footer-button-border-highlight' : 'menu-footer-button-border'
            }`}
          >
            {link.defaultIcon && (
              <img
                src={
                  hoveredLink === index
                    ? link.hoverIcon // Show hover image when hovered
                    : link.isActive
                    ? link.activeIcon // Show highlight image when active
                    : link.defaultIcon // Show default image otherwise
                }
                alt={link.label}
              />
            )}
          </div>
          <div
            className={`menu-footer-button-light ${
              link.isActive ? 'menu-footer-button-light-highlight' : 'menu-footer-button-light-white'
            }`}
          ></div>
          <h6 className={link.isActive ? 'menu-footer' : ''}>{link.label}</h6>
        </Link>
      ))}
    </nav>
  );
}