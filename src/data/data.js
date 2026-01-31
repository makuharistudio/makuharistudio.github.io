import { link_x, link_github, link_linkedin, link_x_active, link_github_active, link_linkedin_active } from './assets';

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
        name: '𝕏',
        icon: link_x,
        hover: link_x_active,
        link: xURL
    },
    {
        name: 'GITHUB',
        icon: link_github,
        hover: link_github_active,
        link: githubURL 
    },
    {
        name: 'LINKEDIN',
        icon: link_linkedin,
        hover: link_linkedin_active,
        link: ascii1 + ascii2 + ascii3 
    }
];

export { displayName, assetURL }