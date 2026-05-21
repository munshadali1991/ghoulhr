import { Avatar, Box, Button, Paper, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import BusinessIcon from '@mui/icons-material/Business';

const LOGO_UPLOAD_INPUT_ID = 'org-logo-upload';

/**
 * @param {{ logoPreview: string | null, onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void }} props
 */
export function LogoUploadField({ logoPreview, onUpload }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        textAlign: 'center',
        border: '2px dashed',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.default',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: 'primary.main',
          bgcolor: 'action.hover',
        },
      }}
    >
      <Avatar
        src={logoPreview || undefined}
        sx={{
          width: 100,
          height: 100,
          mb: 2,
          mx: 'auto',
          border: '2px solid',
          borderColor: 'divider',
        }}
      >
        {!logoPreview && <BusinessIcon sx={{ fontSize: 48 }} />}
      </Avatar>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Organization Logo
      </Typography>
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id={LOGO_UPLOAD_INPUT_ID}
        type="file"
        onChange={onUpload}
      />
      <label htmlFor={LOGO_UPLOAD_INPUT_ID}>
        <Button
          variant="outlined"
          component="span"
          startIcon={<CloudUploadIcon />}
          size="small"
          fullWidth
        >
          Upload Logo
        </Button>
      </label>
    </Paper>
  );
}
