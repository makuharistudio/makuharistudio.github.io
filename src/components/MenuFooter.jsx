import { useLocation } from 'react-router-dom';
import { HashLink as Link } from 'react-router-hash-link';
import { icon_modeportrait, icon_modeportrait_highlight, icon_charthistogram, icon_charthistogram_highlight, icon_edit, icon_edit_highlight, icon_bookopen, icon_bookopen_highlight } from '../data/assets';

export default function MenuFooter() {

  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav id='menu-footer'>

        <Link to='/'>
            <div className={`menu-footer-button-border ${currentPath === '/' ? 'menu-footer-button-border-highlight' : 'menu-footer-button-border'}`}>
                <img src={currentPath === '/' ? icon_modeportrait_highlight : icon_modeportrait} alt='About'/>
            </div>
            <div className={`menu-footer-button-light ${currentPath === '/' ? 'menu-footer-button-light-highlight' : 'menu-footer-button-light-white'}`}></div>
            <h6 className={currentPath === '/'  ? 'menu-footer' : ''}>ABOUT</h6>
        </Link>
        
        <Link to='/portfolio'>
            <div className={`menu-footer-button-border ${currentPath.includes('/portfolio') ? 'menu-footer-button-border-highlight' : 'menu-footer-button-border'}`}>
                <img src={currentPath.includes('/portfolio') ? icon_charthistogram_highlight : icon_charthistogram} alt='Portfolio'/>
            </div>
            <div className={`menu-footer-button-light ${currentPath.includes('/portfolio') ? 'menu-footer-button-light-highlight' : 'menu-footer-button-light-white'}`}></div>
            <h6 className={currentPath.includes('/portfolio') ? 'menu-footer' : ''}>PORTFOLIO</h6>
        </Link>
    
        <Link to='/blog'>
            <div className={`menu-footer-button-border ${currentPath.includes('/blog') ? 'menu-footer-button-border-highlight' : 'menu-footer-button-border'}`}>
                <img src={currentPath.includes('/blog') ? icon_edit_highlight : icon_edit} alt='Blog'/>
            </div>
            <div className={`menu-footer-button-light ${currentPath.includes('/blog') ? 'menu-footer-button-light-highlight' : 'menu-footer-button-light-white'}`}></div>
            <h6 className={currentPath.includes('/blog') ? 'menu-footer' : ''}>BLOG</h6>
        </Link>

        <Link to='/'>
            <div className='menu-footer-button-border menu-footer-button-border'></div>
            <div className='menu-footer-button-light menu-footer-button-light-white'></div>
            <h6>- - - - -</h6>
        </Link>


        <Link to='/'>
            <div className='menu-footer-button-border menu-footer-button-border'></div>
            <div className='menu-footer-button-light menu-footer-button-light-white'></div>
            <h6>- - - - -</h6>
        </Link>

        <Link to='/'>
            <div className='menu-footer-button-border menu-footer-button-border'></div>
            <div className='menu-footer-button-light menu-footer-button-light-white'></div>
            <h6>- - - - -</h6>
        </Link>

    </nav>
  )
}