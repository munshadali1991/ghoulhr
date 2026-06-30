import { Chip, List, ListItemButton, ListItemText, Paper, Stack } from '@mui/material';
import { useIsMobileLayout } from '@/shared/hooks/useIsMobileLayout';

const LEAVE_TYPE_ITEMS = [
  { key: 'leave', label: 'Leave' },
  { key: 'restricted-holiday', label: 'Restricted Holiday' },
  { key: 'leave-cancel', label: 'Leave Cancel' },
  { key: 'comp-off', label: 'Comp Off Grant' },
];

/**
 * @param {{ value: string, onChange: (key: string) => void }} props
 */
export function LeaveTypeNav({ value, onChange }) {
  const isMobileLayout = useIsMobileLayout();

  if (isMobileLayout) {
    return (
      <Stack
        direction="row"
        spacing={1}
        sx={{
          width: '100%',
          overflowX: 'auto',
          pb: 0.5,
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {LEAVE_TYPE_ITEMS.map((item) => (
          <Chip
            key={item.key}
            label={item.label}
            onClick={() => onChange(item.key)}
            color={value === item.key ? 'secondary' : 'default'}
            variant={value === item.key ? 'filled' : 'outlined'}
            sx={{ flexShrink: 0 }}
          />
        ))}
      </Stack>
    );
  }

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', minWidth: { md: 180 } }}>
      <List disablePadding>
        {LEAVE_TYPE_ITEMS.map((item) => (
          <ListItemButton
            key={item.key}
            selected={value === item.key}
            onClick={() => onChange(item.key)}
            sx={{
              borderLeft: '3px solid',
              borderColor: value === item.key ? 'secondary.main' : 'transparent',
              py: 1.25,
            }}
          >
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                variant: 'body2',
                fontWeight: value === item.key ? 700 : 500,
              }}
            />
          </ListItemButton>
        ))}
      </List>
    </Paper>
  );
}
