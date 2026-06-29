import {
    link_x_light, link_x_light_active, link_x_dark, link_x_dark_active,
    link_github_light, link_github_light_active, link_github_dark, link_github_dark_active,
    link_linkedin_light, link_linkedin_light_active, link_linkedin_dark, link_linkedin_dark_active,
} from './assets';

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
        icons: {
            light: { default: link_x_light, active: link_x_light_active },
            dark: { default: link_x_dark, active: link_x_dark_active },
        },
        link: xURL
    },
    {
        name: 'GITHUB',
        icons: {
            light: { default: link_github_light, active: link_github_light_active },
            dark: { default: link_github_dark, active: link_github_dark_active },
        },
        link: githubURL
    },
/*    {
        name: 'LINKEDIN',
        icons: {
            light: { default: link_linkedin_light, active: link_linkedin_light_active },
            dark: { default: link_linkedin_dark, active: link_linkedin_dark_active },
        },
        link: ascii1 + ascii2 + ascii3
    }
*/
];

export { displayName, assetURL }