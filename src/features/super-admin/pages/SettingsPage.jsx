import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  CardContent,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import { PageCard } from '@/shared/components/ui/PageCard';
import { getEmailStatus, sendTestEmail } from '@/features/super-admin/api/emailApi';

export function SettingsPage() {
  const [to, setTo] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [sesEnabled, setSesEnabled] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingStatus(true);
      try {
        const status = await getEmailStatus();
        if (!cancelled) {
          setSesEnabled(Boolean(status?.enabled));
        }
      } catch (err) {
        if (!cancelled) {
          setSesEnabled(false);
          setError(err?.message || 'Unable to check email status');
        }
      } finally {
        if (!cancelled) {
          setLoadingStatus(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSendTestEmail(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    const recipient = to.trim();
    if (!recipient) {
      setError('Enter a recipient email address');
      return;
    }

    setSending(true);
    try {
      const result = await sendTestEmail({ to: recipient });
      setSuccess(result?.message || `Test email sent to ${recipient}`);
    } catch (err) {
      setError(err?.message || 'Failed to send test email');
    } finally {
      setSending(false);
    }
  }

  return (
    <Stack spacing={2}>
      <PageCard>
        <CardContent>
          <Stack spacing={2} component="form" onSubmit={handleSendTestEmail}>
            <Stack direction="row" spacing={1} alignItems="center">
              <EmailRoundedIcon color="primary" />
              <Typography variant="h6" fontWeight={700}>
                Email (Amazon SES)
              </Typography>
            </Stack>

            <Typography variant="body2" color="text.secondary">
              Send a test email using the configured Amazon SES SMTP service.
            </Typography>

            {loadingStatus ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={18} />
                <Typography variant="body2">Checking SES status…</Typography>
              </Stack>
            ) : (
              <Alert severity={sesEnabled ? 'success' : 'warning'}>
                {sesEnabled
                  ? 'Amazon SES SMTP is configured on the server.'
                  : 'Amazon SES SMTP is not configured. Set AWS_SES_* env vars and restart the backend.'}
              </Alert>
            )}

            {error ? <Alert severity="error">{error}</Alert> : null}
            {success ? <Alert severity="success">{success}</Alert> : null}

            <TextField
              label="Recipient email"
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="you@example.com"
              required
              fullWidth
            />

            <Button
              type="submit"
              variant="contained"
              startIcon={sending ? <CircularProgress size={16} color="inherit" /> : <EmailRoundedIcon />}
              disabled={sending || loadingStatus || sesEnabled === false}
              sx={{ alignSelf: 'flex-start' }}
            >
              {sending ? 'Sending…' : 'Send Test Email'}
            </Button>
          </Stack>
        </CardContent>
      </PageCard>
    </Stack>
  );
}
