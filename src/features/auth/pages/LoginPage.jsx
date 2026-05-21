import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BadgeIcon from '@mui/icons-material/Badge';
import { BrandedButton } from '@/shared/components/ui/BrandedButton';

export function LoginPage({
  mode,
  setMode,
  form,
  onFieldChange,
  onSubmit,
  loading,
  error,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        py: { xs: 2, md: 4 },
        background: (theme) => theme.palette.custom.login.pageBackground,
      }}
    >
      <Container maxWidth="lg">
        <Card
          elevation={0}
          sx={{
            border: (theme) => `1px solid ${theme.palette.custom.login.cardBorder}`,
            borderRadius: 5,
            overflow: 'hidden',
            backdropFilter: 'blur(6px)',
            boxShadow: (theme) => theme.palette.custom.login.cardShadow,
          }}
        >
          <Grid container>
            <Grid
              size={{ xs: 0, md: 6 }}
              sx={{
                display: { xs: 'none', md: 'flex' },
                background: (theme) => theme.palette.custom.brand.gradientLogin,
                color: (theme) => theme.palette.custom.brand.onBrand,
                p: 4,
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  width: 230,
                  height: 230,
                  borderRadius: '50%',
                  bgcolor: (theme) => theme.palette.custom.brand.decorativeOrb,
                  top: -70,
                  right: -70,
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  width: 180,
                  height: 180,
                  borderRadius: '50%',
                  bgcolor: (theme) => theme.palette.custom.brand.decorativeOrbSoft,
                  bottom: -60,
                  left: -60,
                }}
              />

              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="h4" fontWeight={800}>
                  GhoulHRMS
                </Typography>
                <Typography sx={{ mt: 1, opacity: 0.95 }}>
                  Next-gen multi-tenant workspace for modern HR operations.
                </Typography>
              </Box>

              <Stack spacing={1.25} sx={{ position: 'relative', zIndex: 1 }}>
                <Chip
                  icon={<AutoGraphRoundedIcon />}
                  label="Real-time insights"
                  sx={{
                    bgcolor: (theme) => theme.palette.custom.brand.chipOnBrandSoft,
                    color: (theme) => theme.palette.custom.brand.onBrand,
                  }}
                />
                <Chip
                  icon={<SecurityRoundedIcon />}
                  label="Tenant-isolated security"
                  sx={{
                    bgcolor: (theme) => theme.palette.custom.brand.chipOnBrandSoft,
                    color: (theme) => theme.palette.custom.brand.onBrand,
                  }}
                />
                <Chip
                  icon={<GroupsRoundedIcon />}
                  label="Built for distributed teams"
                  sx={{
                    bgcolor: (theme) => theme.palette.custom.brand.chipOnBrandSoft,
                    color: (theme) => theme.palette.custom.brand.onBrand,
                  }}
                />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                <Typography variant="h5" fontWeight={800}>
                  Welcome back
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2.5 }}>
                  {mode === 'admin' 
                    ? 'Sign in with your admin credentials to continue.'
                    : 'Sign in with your employee credentials to continue.'
                  }
                </Typography>

                <Tabs
                  value={mode}
                  onChange={(_, value) => setMode(value)}
                  variant="fullWidth"
                  sx={{
                    mb: 2,
                    '& .MuiTabs-indicator': { display: 'none' },
                    '& .MuiTab-root': {
                      borderRadius: 2,
                      minHeight: 40,
                      textTransform: 'none',
                      border: '1px solid transparent',
                    },
                    '& .Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'white !important',
                    },
                  }}
                >
                  <Tab label="Admin Login" value="admin" icon={<AdminPanelSettingsIcon />} iconPosition="start" />
                  <Tab label="Employee Login" value="employee" icon={<BadgeIcon />} iconPosition="start" />
                </Tabs>

                {mode === 'admin' && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    For Super Admin & Organization Admin accounts
                  </Alert>
                )}

                {mode === 'employee' && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    For Employees & Managers
                  </Alert>
                )}

                <Box component="form" onSubmit={onSubmit}>
                  <Stack spacing={2}>
                    <TextField
                      label="Work Email"
                      type="email"
                      value={form.email}
                      onChange={onFieldChange('email')}
                      required
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailRoundedIcon fontSize="small" color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={onFieldChange('password')}
                      required
                      fullWidth
                      inputProps={{ minLength: 8 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockRoundedIcon fontSize="small" color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              edge="end"
                              onClick={() => setShowPassword((prev) => !prev)}
                            >
                              {showPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    {error ? <Alert severity="error">{error}</Alert> : null}

                    <BrandedButton
                      type="submit"
                      brandVariant="login"
                      size="large"
                      disabled={loading}
                      sx={{ py: 1.25, fontWeight: 700 }}
                    >
                      {loading ? 'Please wait...' : 'Sign In'}
                    </BrandedButton>
                  </Stack>
                </Box>

                <Divider sx={{ my: 2.25 }} />
                <Typography variant="caption" color="text.secondary">
                  By signing in, you agree to secure access policies for your organization.
                </Typography>
              </CardContent>
            </Grid>
          </Grid>
        </Card>
      </Container>
    </Box>
  );
}
