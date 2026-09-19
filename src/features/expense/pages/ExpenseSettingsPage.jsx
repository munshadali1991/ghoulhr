import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Switch,
  TextField,
  Typography,
  FormControlLabel,
} from '@mui/material';
import { AppSnackbar } from '@/shared/components/feedback/AppSnackbar';
import { useAppSnackbar } from '@/shared/hooks/useAppSnackbar';
import {
  useAdminExpenseCategories,
  useExpensePolicy,
  useSaveAdminExpenseCategories,
  useSaveExpensePolicy,
} from '../hooks/useExpenseQueries';

/**
 * @param {{ organizationId: string }} props
 */
export function ExpenseSettingsPage({ organizationId: _organizationId }) {
  const categoriesQuery = useAdminExpenseCategories();
  const policyQuery = useExpensePolicy();
  const saveCategories = useSaveAdminExpenseCategories();
  const savePolicy = useSaveExpensePolicy();
  const { snackbar, show, close } = useAppSnackbar();
  const [categories, setCategories] = useState([]);
  const [policy, setPolicy] = useState({
    defaultClaimWindowDays: 90,
    maxLinesPerClaim: 50,
    maxClaimAmount: '500000',
  });

  useEffect(() => {
    if (categoriesQuery.data) setCategories(categoriesQuery.data);
  }, [categoriesQuery.data]);

  useEffect(() => {
    if (policyQuery.data) {
      setPolicy({
        defaultClaimWindowDays: policyQuery.data.defaultClaimWindowDays,
        maxLinesPerClaim: policyQuery.data.maxLinesPerClaim,
        maxClaimAmount: String(policyQuery.data.maxClaimAmount),
      });
    }
  }, [policyQuery.data]);

  const updateCategory = (index, patch) => {
    setCategories((rows) =>
      rows.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  };

  const addCategory = () => {
    setCategories((rows) => [
      ...rows,
      {
        code: '',
        name: '',
        isActive: true,
        receiptRequiredAboveAmount: '0',
      },
    ]);
  };

  const handleSaveCategories = async () => {
    try {
      await saveCategories.mutateAsync(categories);
      show('Categories saved', 'success');
    } catch (err) {
      show(err?.message || 'Failed to save categories', 'error');
    }
  };

  const handleSavePolicy = async () => {
    try {
      await savePolicy.mutateAsync(policy);
      show('Policy saved', 'success');
    } catch (err) {
      show(err?.message || 'Failed to save policy', 'error');
    }
  };

  if (categoriesQuery.isLoading || policyQuery.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Expense policy
        </Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            type="number"
            label="Claim window (days)"
            value={policy.defaultClaimWindowDays}
            onChange={(e) =>
              setPolicy((p) => ({
                ...p,
                defaultClaimWindowDays: Number(e.target.value),
              }))
            }
          />
          <TextField
            type="number"
            label="Max lines per claim"
            value={policy.maxLinesPerClaim}
            onChange={(e) =>
              setPolicy((p) => ({
                ...p,
                maxLinesPerClaim: Number(e.target.value),
              }))
            }
          />
          <TextField
            label="Max claim amount"
            value={policy.maxClaimAmount}
            onChange={(e) =>
              setPolicy((p) => ({ ...p, maxClaimAmount: e.target.value }))
            }
          />
        </Stack>
        <Button sx={{ mt: 2 }} variant="contained" onClick={handleSavePolicy}>
          Save policy
        </Button>
      </Box>

      <Box>
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6">Categories</Typography>
          <Button onClick={addCategory}>Add category</Button>
        </Stack>
        {categoriesQuery.isError && (
          <Alert severity="error">{categoriesQuery.error?.message}</Alert>
        )}
        <Stack spacing={2}>
          {categories.map((cat, index) => (
            <Stack
              key={cat.id || `new-${index}`}
              direction={{ xs: 'column', md: 'row' }}
              spacing={1}
              alignItems={{ md: 'center' }}
            >
              <TextField
                label="Code"
                value={cat.code}
                onChange={(e) => updateCategory(index, { code: e.target.value })}
                size="small"
              />
              <TextField
                label="Name"
                value={cat.name}
                onChange={(e) => updateCategory(index, { name: e.target.value })}
                size="small"
              />
              <TextField
                label="Receipt required above"
                value={cat.receiptRequiredAboveAmount ?? '0'}
                onChange={(e) =>
                  updateCategory(index, {
                    receiptRequiredAboveAmount: e.target.value,
                  })
                }
                size="small"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={cat.isActive !== false}
                    onChange={(e) =>
                      updateCategory(index, { isActive: e.target.checked })
                    }
                  />
                }
                label="Active"
              />
            </Stack>
          ))}
        </Stack>
        <Button sx={{ mt: 2 }} variant="contained" onClick={handleSaveCategories}>
          Save categories
        </Button>
      </Box>
      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={close}
      />
    </Stack>
  );
}
