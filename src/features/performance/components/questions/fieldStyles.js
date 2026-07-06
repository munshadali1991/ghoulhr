/**
 * Accent colors that echo the legacy UI: the employee response field carries a
 * rose left/outline accent, the supplementary comment field a green accent.
 */
export const RESPONSE_ACCENT = '#e57373';
export const COMMENT_ACCENT = '#66bb6a';

/** Outlined-input sx that tints the resting border with an accent color. */
export function accentOutlineSx(color) {
  return {
    '& .MuiOutlinedInput-notchedOutline': { borderColor: color },
    '&:hover .MuiOutlinedInput-root:not(.Mui-focused) .MuiOutlinedInput-notchedOutline':
      { borderColor: color },
  };
}

export const answerFieldSx = accentOutlineSx(RESPONSE_ACCENT);
export const commentFieldSx = accentOutlineSx(COMMENT_ACCENT);
