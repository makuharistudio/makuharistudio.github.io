/* ASSET FILES FOR SITE THEME */

import avatar from '../assets/theme/avatar/avatar-vertical-transparent-bg.png'
import title_a from '../assets/theme/avatar/title-y-a.png'
import title_b from '../assets/theme/avatar/title-y-b.png'
import title_c from '../assets/theme/avatar/title-y-c.png'

/* Menu Buttons */
import menu_about from '../assets/theme/accent/images/menu-footer-button-about-teal.svg'
import menu_project from '../assets/theme/accent/images/menu-footer-button-project-teal.svg'
import menu_blog from '../assets/theme/accent/images/menu-footer-button-blog-teal.svg'
import menu_reading from '../assets/theme/accent/images/menu-footer-button-reading-teal.svg'
import menu_blank from '../assets/theme/accent/images/menu-footer-button.svg'
import menu_about_active from '../assets/theme/accent/images/menu-footer-button-about-red.svg'
import menu_project_active from '../assets/theme/accent/images/menu-footer-button-project-purple.svg'
import menu_blog_active from '../assets/theme/accent/images/menu-footer-button-blog-yellow.svg'
import menu_reading_active from '../assets/theme/accent/images/menu-footer-button-reading-blue.svg'

/* Links */
import link_linkedin from '../assets/theme/logo/linkedin-blue.svg'
import link_x from '../assets/theme/logo/x-blue.svg'
import link_github from '../assets/theme/logo/github-blue.svg'
import link_powerbi from '../assets/theme/logo/powerbi-blue.svg'
import link_tableau from '../assets/theme/logo/tableau-blue.svg'

import link_linkedin_active from '../assets/theme/logo/linkedin-white.svg'
import link_x_active from '../assets/theme/logo/x-white.svg'
import link_github_active from '../assets/theme/logo/github-white.svg'
import link_powerbi_active from '../assets/theme/logo/powerbi-white.svg'
import link_tableau_active from '../assets/theme/logo/tableau-white.svg'

/* Logos */
import logo_aws from '../assets/theme/logo/aws.svg'
import logo_azure from '../assets/theme/logo/azure.svg'
import logo_css from '../assets/theme/logo/css.svg'
import logo_excel from '../assets/theme/logo/excel.svg'
import logo_github from '../assets/theme/logo/github.svg'
import logo_linkedin from '../assets/theme/logo/linkedin.svg'
import logo_neo4j from '../assets/theme/logo/neo4j.svg'
import logo_powerbi from '../assets/theme/logo/powerbi.svg'
import logo_python from '../assets/theme/logo/python.svg'
import logo_sqlserver from '../assets/theme/logo/sqlserver.svg'
import logo_tableau from '../assets/theme/logo/tableau.svg'
import logo_x from '../assets/theme/logo/x.svg'

/* Background */
import mars_mosaic_1 from '../assets/theme/background/images/space/planetary-mosaic-mars-1.jpg'
import earth_mosaic_1 from '../assets/theme/background/images/space/planetary-mosaic-earth-1.jpg'
import earth_mosaic_2_specular from '../assets/theme/background/images/space/planetary-mosaic-earth-2-specular.jpg'
import earth_mosaic_3_bump from '../assets/theme/background/images/space/planetary-mosaic-earth-3-bump.jpg'
import earth_mosaic_4_lights from '../assets/theme/background/images/space/planetary-mosaic-earth-4-lights.jpg'
import earth_mosaic_5_clouds from '../assets/theme/background/images/space/planetary-mosaic-earth-5-clouds.jpg'
import earth_mosaic_6_clouds_transparent from '../assets/theme/background/images/space/planetary-mosaic-earth-6-cloudstransparent.jpg'
import star from '../assets/theme/background/images/space/star.png'

/* Background Scripts */
export const backgroundMap = [
  { path: '/', script: () => import('../assets/theme/background/scripts/bg-space.js') },
  { path: '/portfolio', script: () => import('../assets/theme/background/scripts/bg-space.js') },
  { path: '/blog', script: () => import('../assets/theme/background/scripts/bg-space.js') },
  { path: '/readings', script: () => import('../assets/theme/background/scripts/bg-space.js') },
  { path: '/applications', script: () => import('../assets/theme/background/scripts/bg-blank.js') },
  { path: '/test', script: () => import('../assets/theme/background/scripts/bg-avatarsummon.js') },
];

export { avatar, title_a, title_b, title_c,
         menu_about, menu_project, menu_blog, menu_reading, menu_blank,
         menu_about_active, menu_project_active, menu_blog_active, menu_reading_active,
         logo_aws, logo_azure, logo_css, logo_excel, logo_github, logo_linkedin, logo_neo4j, logo_powerbi, logo_python, logo_sqlserver, logo_tableau, logo_x,
         link_linkedin, link_x, link_github, link_powerbi, link_tableau,
         link_linkedin_active, link_x_active, link_github_active, link_powerbi_active, link_tableau_active,
         mars_mosaic_1, 
         earth_mosaic_1, earth_mosaic_2_specular, earth_mosaic_3_bump, earth_mosaic_4_lights, earth_mosaic_5_clouds, earth_mosaic_6_clouds_transparent,
         star
}