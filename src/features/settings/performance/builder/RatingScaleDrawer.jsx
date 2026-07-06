import {
  Box,
  Button,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { RatingScaleTab } from '../components/rating/RatingScaleTab';

/**
 * Side drawer for editing rating scale without leaving the Form Builder.
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   ratingOptions: object[],
 *   form: object,
 *   readOnly?: boolean,
 *   onAddRating?: () => void,
 * }} props
 */
export function RatingScaleDrawer({
  open,
  onClose,
  ratingOptions,
  form,
  readOnly = false,
  onAddRating,
}) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 480, md: 560 } } }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 2.5, py: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Rating scale
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Define labels and weights for rating questions.
            </Typography>
          </Box>
          <IconButton aria-label="Close" onClick={onClose}>
            <CloseRoundedIcon />
          </IconButton>
        </Stack>

        <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
          {!ratingOptions.length && !readOnly && onAddRating ? (
            <Button
              variant="outlined"
              startIcon={<AddRoundedIcon />}
              onClick={onAddRating}
              sx={{ mb: 2 }}
            >
              Add first rating option
            </Button>
          ) : null}
          <RatingScaleTab ratingOptions={ratingOptions} form={form} readOnly={readOnly} />
        </Box>

        <Box
          sx={{
            px: 2.5,
            py: 2,
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Button variant="contained" onClick={onClose}>
            Done
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
