/**
 * Accent outline styles for performance question fields.
 * Colors resolve from theme.palette.custom.accent.
 */

/** Outlined-input sx that tints the resting border with an accent color. */
export function accentOutlineSx(colorResolver) {
  return (theme) => {
    const color =
      typeof colorResolver === 'function' ? colorResolver(theme) : colorResolver;
    return {
      '& .MuiOutlinedInput-notchedOutline': { borderColor: color },
      '&:hover .MuiOutlinedInput-root:not(.Mui-focused) .MuiOutlinedInput-notchedOutline':
        { borderColor: color },
    };
  };
}

export const answerFieldSx = accentOutlineSx(
  (theme) => theme.palette.custom.accent.response,
);

export const commentFieldSx = accentOutlineSx(
  (theme) => theme.palette.custom.accent.comment,
);
