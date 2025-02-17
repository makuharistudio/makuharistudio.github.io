import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const useScrollIntoView = () => {
    const location = useLocation();

    useEffect(() => {
        
        // Elements that will SLIDE into screen from right to left
        const menuHeader = Array.from(document.querySelectorAll('#menu-header'));
        const menuFooter = Array.from(document.querySelectorAll('#menu-footer'));
        const aboutPhotos = Array.from(document.querySelectorAll('#about img'));
        const aboutParagraghs = Array.from(document.querySelectorAll('#about p'));
        const aboutListItems = Array.from(document.querySelectorAll('#about li'));
        const creditsParagraghs = Array.from(document.querySelectorAll('#credits p'));
        const creditsListItems = Array.from(document.querySelectorAll('#credits li'));
        const linkButtons = Array.from(document.querySelectorAll('#link-list a'));
        const certifications = Array.from(document.querySelectorAll('#certification-list a'));
        const filterButtons = Array.from(document.querySelectorAll('.filter button'));
        const blogPosts = Array.from(document.querySelectorAll('#blog-list a'));
        const portfolioProjects = Array.from(document.querySelectorAll('#portfolio-list a'));
        const readingsReading = Array.from(document.querySelectorAll('#readings-list a'));

        // Combine all elements for SLIDE animation into a single array
        const elementsToAnimateSlide = [...menuHeader, ...menuFooter, ...aboutPhotos, ...aboutParagraghs, ...aboutListItems, ...creditsParagraghs, ...creditsListItems, ...linkButtons, ...certifications, ...filterButtons, ...blogPosts, ...portfolioProjects, ...readingsReading];

        // Elements that will FADE into screen
        const pageTitles = Array.from(document.querySelectorAll('#outlet h1'));
        const aboutTitles = Array.from(document.querySelectorAll('#outlet h2'));
        const aboutSubTitles = Array.from(document.querySelectorAll('#outlet h3'));
        const menuHeaderText = Array.from(document.querySelectorAll('#menu-header ul li a'));
        const menuFooterText = Array.from(document.querySelectorAll('#menu-footer h6'));
        const elementsToAnimateFade = [...pageTitles, ...menuHeaderText, ...menuFooterText, ...aboutTitles, ...aboutSubTitles];

        // Set initial styles for elements to SLIDE animate (preferrably just titles)
        elementsToAnimateSlide.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateX(100%)';
        });

        // Set initial styles for titles to FADE animate
        elementsToAnimateFade.forEach(title => {
            title.style.opacity = '0';
        });

        const animateElements = () => {
            const clientHeight = document.documentElement.clientHeight;

            // Animate titles first
            elementsToAnimateFade.forEach(title => {
                const titleY = title.getBoundingClientRect().y;
                const titleHeight = title.getBoundingClientRect().height;

                if (clientHeight > titleY + (titleHeight * (1 / 4))) {
                    title.style.animation = 'fadeIn 3s forwards';
                }
            });

            // Animate other elements
            elementsToAnimateSlide.forEach(element => {
                const elementY = element.getBoundingClientRect().y;
                const elementHeight = element.getBoundingClientRect().height;

                if (clientHeight > elementY + (elementHeight * (1 / 4))) {
                    element.style.animation = 'slideLeft 3s forwards cubic-bezier(0.87, 0, 0.13, 1)';
                }
            });
        };

        // Initial check to animate elements already in the viewport
        animateElements();

        document.addEventListener('scroll', animateElements);

        // Cleanup the event listener on unmount
        return () => {
            document.removeEventListener('scroll', animateElements);
        };
    }, [location.pathname]); // Run effect whenever the location changes
};

export default useScrollIntoView;
