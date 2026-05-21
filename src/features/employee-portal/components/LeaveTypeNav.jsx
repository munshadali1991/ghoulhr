import { List, ListItemButton, ListItemText, Paper } from '@mui/material';

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
