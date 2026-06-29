import { Avatar, Box, Button, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import BusinessIcon from '@mui/icons-material/Business';

const LOGO_UPLOAD_INPUT_ID = 'org-logo-upload';
const MAX_LOGO_BYTES = 2 * 1024 * 1024;

/**
 * @param {{ logoPreview: string | null, onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void }} props
 */
export function LogoUploadField({ logoPreview, onUpload }) {
  const handleChange = (event) => {
    const file = event.target.files?.[0];
    if (file && file.size > MAX_LOGO_BYTES) {
      event.target.value = '';
      return;
    }
    onUpload(event);
  };

  return (
    <Box
      sx={{
        p: 3,
        textAlign: 'center',
        border: '2px dashed',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.default',
        transition: 'border-color 0.2s ease, background-color 0.2s ease',
        '&:hover': {
          borderColor: 'primary.main',
          bgcolor: 'action.hover',
        },
      }}
    >
      <Avatar
        src={logoPreview || undefined}
        sx={{
          width: 120,
          height: 120,
          mb: 2,
          mx: 'auto',
          border: '3px solid',
          borderColor: 'background.paper',
          boxShadow: (theme) => theme.shadows[2],
        }}
      >
        {!logoPreview && <BusinessIcon sx={{ fontSize: 56 }} />}
      </Avatar>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
        Organization logo
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
        PNG or JPG, max 2 MB
      </Typography>
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id={LOGO_UPLOAD_INPUT_ID}
        type="file"
        onChange={handleChange}
      />
      <label htmlFor={LOGO_UPLOAD_INPUT_ID}>
        <Button
          variant="outlined"
          component="span"
          startIcon={<CloudUploadIcon />}
          size="small"
          fullWidth
        >
          Upload logo
        </Button>
      </label>
    </Box>
  );
}
