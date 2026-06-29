/**
 * Central registry for theme-specific assets and helpers.
 * Add new light/dark asset pairs here as the site grows.
 */

import panelDarkBackgroundlines from '../assets/theme/accent/images/panel-dark-backgroundlines.svg';
import panelDarkBackgroundlinesHover from '../assets/theme/accent/images/panel-dark-backgroundlines-hover.svg';
import panelDarkCorneredge from '../assets/theme/accent/images/panel-dark-corneredge.svg';
import panelDarkCorneredgeHover from '../assets/theme/accent/images/panel-dark-corneredge-hover.svg';
import panelLightBackgroundlines from '../assets/theme/accent/images/panel-light-backgroundlines.svg';
import panelLightBackgroundlinesHover from '../assets/theme/accent/images/panel-light-backgroundlines-hover.svg';
import panelLightCorneredge from '../assets/theme/accent/images/panel-light-corneredge.svg';
import panelLightCorneredgeHover from '../assets/theme/accent/images/panel-light-corneredge-hover.svg';

export const themeAssets = {
  panel: {
    dark: {
      backgroundlines: panelDarkBackgroundlines,
      backgroundlinesHover: panelDarkBackgroundlinesHover,
      corneredge: panelDarkCorneredge,
      corneredgeHover: panelDarkCorneredgeHover,
    },
    light: {
      backgroundlines: panelLightBackgroundlines,
      backgroundlinesHover: panelLightBackgroundlinesHover,
      corneredge: panelLightCorneredge,
      corneredgeHover: panelLightCorneredgeHover,
    },
  },
};

export function getThemeAssets(category, theme) {
  return themeAssets[category][theme] || themeAssets[category]['light'];
}

export function getPanelAssets(theme) {
  return getThemeAssets('panel', theme);
}

export function getPanelStyleVars(theme) {
  const assets = getPanelAssets(theme);
  return {
    '--panel-background-image': assets.backgroundlines,
    '--panel-background-image-hover': assets.backgroundlinesHover,
    '--panel-corner-image': assets.corneredge,
    '--panel-corner-image-hover': assets.corneredgeHover,
  };
}
