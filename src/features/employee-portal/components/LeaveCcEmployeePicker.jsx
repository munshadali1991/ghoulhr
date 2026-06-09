import { useEffect, useMemo, useState } from 'react';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useColleaguesSearch } from '../hooks/useEmployeePortalQueries';

/**
 * Searchable multi-select list for leave Cc recipients.
 * @param {{
 *   value: string[],
 *   onChange: (ids: string[]) => void,
 *   excludeEmployees?: { id: string, name: string }[],
 * }} props
 */
export function LeaveCcEmployeePicker({ value, onChange, excludeEmployees = [] }) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState({});

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setSelectedEmployees((prev) => {
      const next = {};
      for (const id of value) {
        if (prev[id]) next[id] = prev[id];
      }
      return next;
    });
  }, [value]);

  const colleaguesQuery = useColleaguesSearch(debouncedSearch);
  const excluded = useMemo(
    () => new Set(excludeEmployees.map((e) => e.id)),
    [excludeEmployees],
  );

  const allResults = colleaguesQuery.data?.employees ?? [];

  const options = useMemo(
    () => allResults.filter((e) => !excluded.has(e.id)),
    [allResults, excluded],
  );

  const hiddenBecauseExcluded = useMemo(
    () => allResults.filter((e) => excluded.has(e.id)),
    [allResults, excluded],
  );

  const selectedList = useMemo(
    () => value.map((id) => selectedEmployees[id]).filter(Boolean),
    [value, selectedEmployees],
  );

  const emptyMessage = useMemo(() => {
    if (colleaguesQuery.isError) {
      return colleaguesQuery.error?.message ?? 'Could not load colleagues';
    }
    if (hiddenBecauseExcluded.length > 0 && options.length === 0) {
      const names = hiddenBecauseExcluded.map((e) => e.name).join(', ');
      return `${names} ${hiddenBecauseExcluded.length === 1 ? 'is' : 'are'} already your approver and will be notified through the approval flow.`;
    }
    return 'No employees match your search';
  }, [colleaguesQuery.isError, colleaguesQuery.error, hiddenBecauseExcluded, options.length]);

  const toggleEmployee = (employee) => {
    const isSelected = value.includes(employee.id);
    if (isSelected) {
      onChange(value.filter((id) => id !== employee.id));
      setSelectedEmployees((prev) => {
        const next = { ...prev };
        delete next[employee.id];
        return next;
      });
      return;
    }

    onChange([...value, employee.id]);
    setSelectedEmployees((prev) => ({ ...prev, [employee.id]: employee }));
  };

  const removeEmployee = (employeeId) => {
    onChange(value.filter((id) => id !== employeeId));
    setSelectedEmployees((prev) => {
      const next = { ...prev };
      delete next[employeeId];
      return next;
    });
  };

  return (
    <Stack spacing={1.5}>
      <TextField
        size="small"
        fullWidth
        placeholder="Search by name, employee code, or email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          },
        }}
      />

      {selectedList.length > 0 ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {selectedList.map((employee) => (
            <Chip
              key={employee.id}
              size="small"
              label={employee.label ?? employee.name}
              onDelete={() => removeEmployee(employee.id)}
            />
          ))}
        </Box>
      ) : null}

      {!debouncedSearch ? (
        <Typography variant="body2" color="text.secondary">
          Type a name, employee code, or email to search colleagues
        </Typography>
      ) : (
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        {colleaguesQuery.isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={22} />
          </Box>
        ) : options.length === 0 ? (
          <Box sx={{ px: 2, py: 3 }}>
            {colleaguesQuery.isError ? (
              <Stack spacing={1.5} alignItems="center">
                <Alert severity="error" sx={{ width: '100%' }}>
                  {emptyMessage}
                </Alert>
                <Button size="small" onClick={() => colleaguesQuery.refetch()}>
                  Retry
                </Button>
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center">
                {emptyMessage}
              </Typography>
            )}
          </Box>
        ) : (
          <List dense disablePadding sx={{ maxHeight: 240, overflow: 'auto' }}>
            {options.map((employee) => {
              const checked = value.includes(employee.id);
              return (
                <ListItemButton
                  key={employee.id}
                  onClick={() => toggleEmployee(employee)}
                  sx={{
                    py: 0.75,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-of-type': { borderBottom: 'none' },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Checkbox edge="start" checked={checked} tabIndex={-1} disableRipple size="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={employee.name}
                    secondary={employee.employeeCode}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItemButton>
              );
            })}
          </List>
        )}
      </Box>
      )}

      <Typography variant="caption" color="text.secondary">
        Selected colleagues will receive an email and in-app notification when you submit this leave
        request. Your approver is notified separately.
      </Typography>
    </Stack>
  );
}
