import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Container,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import { BrandedButton } from '@/shared/components/ui/BrandedButton';
import { changePasswordRequest } from '@/features/auth/api/authApi';
import { useAuth } from '@/app/providers/useAuth';
import { getDefaultDashboardPath } from '@/features/auth/config/dashboardRegistry';

const PASSWORD_HINT =
  'At least 12 characters with uppercase, lowercase, number, and special character (@$!%*?&#).';

const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{12,}$/;

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const { refreshSession, session, logout } = useAuth();
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (form.newPassword !== form.confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    if (!PASSWORD_PATTERN.test(form.newPassword)) {
      setError(PASSWORD_HINT);
      return;
    }

    setLoading(true);
    try {
      await changePasswordRequest(form.currentPassword, form.newPassword);
      const updated = await refreshSession();
      const landing = getDefaultDashboardPath(updated ?? session);
      navigate(landing, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        py: 4,
        background: (theme) => theme.palette.custom.login.pageBackground,
      }}
    >
      <Container maxWidth="sm">
        <Card
          elevation={0}
          sx={{
            border: (theme) => `1px solid ${theme.palette.custom.login.cardBorder}`,
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={3} component="form" onSubmit={handleSubmit}>
              <Box>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  Set your new password
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  For security, you must choose a new password before accessing the portal.
                </Typography>
              </Box>

              {error ? <Alert severity="error">{error}</Alert> : null}

              <TextField
                label="Current password (from email)"
                type={showCurrent ? 'text' : 'password'}
                value={form.currentPassword}
                onChange={handleChange('currentPassword')}
                required
                fullWidth
                autoComplete="current-password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockRoundedIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowCurrent((v) => !v)}
                        edge="end"
                        aria-label="toggle current password visibility"
                      >
                        {showCurrent ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="New password"
                type={showNew ? 'text' : 'password'}
                value={form.newPassword}
                onChange={handleChange('newPassword')}
                required
                fullWidth
                autoComplete="new-password"
                helperText={PASSWORD_HINT}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockRoundedIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowNew((v) => !v)}
                        edge="end"
                        aria-label="toggle new password visibility"
                      >
                        {showNew ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Confirm new password"
                type={showNew ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={handleChange('confirmPassword')}
                required
                fullWidth
                autoComplete="new-password"
              />

              <BrandedButton type="submit" fullWidth loading={loading}>
                Update password and continue
              </BrandedButton>

              <BrandedButton
                type="button"
                variant="text"
                fullWidth
                onClick={() => logout()}
              >
                Sign out
              </BrandedButton>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
