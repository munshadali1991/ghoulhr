import { Button, CircularProgress, Stack } from '@mui/material';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import { CrudButton } from '@/shared/components/ui/CrudButton';

/**
 * The primary action cluster (Save as Draft / Submit / Save as PDF), reused in
 * the sticky header control bar and the footer baseline.
 * @param {{
 *   onSaveDraft?: () => void,
 *   onSubmit?: () => void,
 *   onSavePdf?: () => void,
 *   savingDraft?: boolean,
 *   submitting?: boolean,
 *   disabled?: boolean,
 *   showDraft?: boolean,
 *   showSubmit?: boolean,
 *   showPdf?: boolean,
 *   size?: 'small' | 'medium',
 * }} props
 */
export function AssessmentActions({
  onSaveDraft,
  onSubmit,
  onSavePdf,
  savingDraft = false,
  submitting = false,
  disabled = false,
  showDraft = true,
  showSubmit = true,
  showPdf = true,
  size = 'small',
}) {
  const busy = savingDraft || submitting;

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ rowGap: 1 }}>
      {showDraft ? (
        <Button
          type="button"
          variant="outlined"
          size={size}
          onClick={onSaveDraft}
          disabled={disabled || busy}
          startIcon={
            savingDraft ? <CircularProgress size={16} color="inherit" /> : <SaveRoundedIcon />
          }
        >
          Save as Draft
        </Button>
      ) : null}
      {showSubmit ? (
        <CrudButton
          intent="save"
          type="button"
          size={size}
          onClick={onSubmit}
          disabled={disabled || busy}
          startIcon={
            submitting ? <CircularProgress size={16} color="inherit" /> : <CheckCircleRoundedIcon />
          }
        >
          Submit
        </CrudButton>
      ) : null}
      {showPdf ? (
        <Button
          type="button"
          variant="outlined"
          size={size}
          onClick={onSavePdf}
          startIcon={<PictureAsPdfRoundedIcon />}
        >
          Save assessment as PDF
        </Button>
      ) : null}
    </Stack>
  );
}
