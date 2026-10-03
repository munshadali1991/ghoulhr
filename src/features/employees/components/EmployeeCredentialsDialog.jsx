import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import { CrudButton } from '@/shared/components/ui/CrudButton';
import { emailEmployeeCredentials } from '@/features/employees/api/employeesApi';

/**
 * @param {{
 *   open: boolean,
 *   title?: string,
 *   credentials: null | {
 *     employeeId?: string,
 *     employeeCode?: string,
 *     name?: string,
 *     email?: string,
 *     temporaryPassword?: string,
 *     expiresAt?: string,
 *     loginUrl?: string,
 *     organizationName?: string,
 *   },
 *   onClose: () => void,
 *   onNotify?: (message: string, severity?: 'success' | 'error' | 'info') => void,
 * }} props
 */
export function EmployeeCredentialsDialog({
  open,
  title = 'Employee Credentials',
  credentials,
  onClose,
  onNotify,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [emailing, setEmailing] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      onNotify?.(`${label} copied to clipboard`, 'success');
    } catch {
      onNotify?.(`Unable to copy ${label}`, 'error');
    }
  };

  const copyAll = () => {
    if (!credentials) return;
    const text = [
      credentials.organizationName
        ? `Organization: ${credentials.organizationName}`
        : null,
      credentials.employeeCode ? `Employee code: ${credentials.employeeCode}` : null,
      `Name: ${credentials.name || '-'}`,
      `Email: ${credentials.email || '-'}`,
      `Temporary password: ${credentials.temporaryPassword || '-'}`,
      `Login URL: ${credentials.loginUrl || '-'}`,
      credentials.expiresAt
        ? `Expires: ${new Date(credentials.expiresAt).toLocaleString()}`
        : null,
      'Employee must change password on first login.',
    ]
      .filter(Boolean)
      .join('\n');
    copyToClipboard(text, 'Credentials');
  };

  const handleSendEmail = async () => {
    if (!credentials?.employeeId || !credentials?.temporaryPassword) return;
    setEmailError('');
    setEmailSuccess('');
    setEmailing(true);
    try {
      const result = await emailEmployeeCredentials(
        credentials.employeeId,
        credentials.temporaryPassword,
      );
      const message = result?.message || `Credentials emailed to ${credentials.email}`;
      setEmailSuccess(message);
      onNotify?.(message, 'success');
    } catch (err) {
      const message = err?.message || 'Failed to email credentials';
      setEmailError(message);
      onNotify?.(message, 'error');
    } finally {
      setEmailing(false);
    }
  };

  const handleClose = () => {
    setShowPassword(false);
    setEmailError('');
    setEmailSuccess('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircleRoundedIcon color="success" />
          <Typography variant="h6">{title}</Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {credentials ? (
          <Stack spacing={2}>
            <Alert severity="warning">
              Copy or email these credentials now. The temporary password will not be shown again.
              The employee must change the password on first login.
            </Alert>

            {emailError ? <Alert severity="error">{emailError}</Alert> : null}
            {emailSuccess ? <Alert severity="success">{emailSuccess}</Alert> : null}

            <Grid container spacing={1.5}>
              {credentials.employeeCode ? (
                <Grid size={6}>
                  <Typography variant="caption">Employee Code</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {credentials.employeeCode}
                  </Typography>
                </Grid>
              ) : null}
              <Grid size={credentials.employeeCode ? 6 : 12}>
                <Typography variant="caption">Name</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {credentials.name || '-'}
                </Typography>
              </Grid>
              <Grid size={12}>
                <Typography variant="caption">Email</Typography>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography variant="body2" fontWeight={600} sx={{ wordBreak: 'break-all' }}>
                    {credentials.email || '-'}
                  </Typography>
                  {credentials.email ? (
                    <IconButton
                      size="small"
                      onClick={() => copyToClipboard(credentials.email, 'Email')}
                    >
                      <ContentCopyRoundedIcon fontSize="small" />
                    </IconButton>
                  ) : null}
                </Stack>
              </Grid>
              <Grid size={12}>
                <Typography variant="caption">Login URL</Typography>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography variant="body2" fontWeight={600} sx={{ wordBreak: 'break-all' }}>
                    {credentials.loginUrl || '-'}
                  </Typography>
                  {credentials.loginUrl ? (
                    <IconButton
                      size="small"
                      onClick={() => copyToClipboard(credentials.loginUrl, 'Login URL')}
                    >
                      <ContentCopyRoundedIcon fontSize="small" />
                    </IconButton>
                  ) : null}
                </Stack>
              </Grid>
              <Grid size={12}>
                <Typography variant="caption">Temporary Password</Typography>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    sx={{ fontFamily: 'monospace', flex: 1 }}
                  >
                    {showPassword
                      ? credentials.temporaryPassword
                      : '••••••••••••••••'}
                  </Typography>
                  <IconButton size="small" onClick={() => setShowPassword((v) => !v)}>
                    {showPassword ? (
                      <VisibilityOffRoundedIcon fontSize="small" />
                    ) : (
                      <VisibilityRoundedIcon fontSize="small" />
                    )}
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() =>
                      copyToClipboard(credentials.temporaryPassword, 'Password')
                    }
                  >
                    <ContentCopyRoundedIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Grid>
              {credentials.expiresAt ? (
                <Grid size={12}>
                  <Typography variant="caption">Expires At</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {new Date(credentials.expiresAt).toLocaleString()}
                  </Typography>
                </Grid>
              ) : null}
            </Grid>
          </Stack>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1, flexWrap: 'wrap' }}>
        <Button variant="outlined" startIcon={<ContentCopyRoundedIcon />} onClick={copyAll}>
          Copy All
        </Button>
        <Button
          variant="outlined"
          startIcon={<EmailRoundedIcon />}
          onClick={handleSendEmail}
          disabled={
            emailing || !credentials?.temporaryPassword || !credentials?.employeeId
          }
        >
          {emailing ? 'Sending…' : 'Send to Email'}
        </Button>
        <Box sx={{ flex: 1 }} />
        <CrudButton intent="save" onClick={handleClose}>
          Done
        </CrudButton>
      </DialogActions>
    </Dialog>
  );
}
