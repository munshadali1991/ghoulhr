/**
 * Theme-aware surface backgrounds and gradients for use in sx props.
 */

/** @param {import('@mui/material/styles').Theme} theme */
export function shiftBarGradient(theme) {
  return `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`;
}

/** @param {import('@mui/material/styles').Theme} theme */
export function sectionPanelGradient(theme) {
  if (theme.palette.mode === 'dark') {
    return `linear-gradient(135deg, ${theme.palette.primary.dark}22 0%, ${theme.palette.background.paper} 55%)`;
  }
  return `linear-gradient(135deg, ${theme.palette.primary.light}33 0%, ${theme.palette.grey[50]} 50%)`;
}

/** Semantic surface backgrounds — use as bgcolor: surface.subtle */
export const surface = {
  subtle: (theme) => theme.palette.custom.surfaces.subtle,
  muted: (theme) => theme.palette.custom.surfaces.muted,
  inset: (theme) => theme.palette.custom.surfaces.inset,
  progressTrack: (theme) => theme.palette.custom.surfaces.progressTrack,
  wash: (theme) => theme.palette.custom.surfaces.wash,
};
