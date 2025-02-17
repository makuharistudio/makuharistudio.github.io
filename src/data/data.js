import { logo_linkedin, logo_x, logo_github, logo_powerbi, logo_tableau } from './assets';

/* GENERAL */
const displayName = 'ｍａｋｕｈａｒｉｓｔｕｄｉｏ';
const githubURL = 'https://github.com/makuharistudio'
const powerbiURL = 'https://community.powerbi.com/t5/forums/recentpostspage/post-type/message/category-id/PBI_Comm_Galleries/user-id/331466'
const xURL = 'https://x.com/makuhari_studio'
const tableauURL = 'https://public.tableau.com/app/profile/makuharistudio/vizzes'
const assetURL = 'https://raw.githubusercontent.com/makuharistudio/makuharistudio.github.io/main/src/assets/theme'
const ascii1 = String.fromCharCode(104,116,116,112,115,58,47,47,119,119,119,46,108,105,110,107,101,100,105,110,46,99,111,109,47,105,110,47);
const ascii2 = String.fromCharCode(77,65,75,85);
const ascii3 = String.fromCharCode(72,65,82,73);

/* LINKS */
export const LinkData = [
    {
        name: 'LINKEDIN',
        icon: logo_linkedin,
        link: ascii1 + ascii2 + ascii3 
    },
    {
        name: '𝕏',
        icon: logo_x,
        link: xURL
    },  
    {
        name: 'GITHUB',
        icon: logo_github,
        link: githubURL 
    },
    {
        name: 'POWER BI',
        icon: logo_powerbi,
        link: powerbiURL
    },
    {
        name: 'TABLEAU',
        icon: logo_tableau,
        link: tableauURL
    }
];

export { displayName, assetURL }