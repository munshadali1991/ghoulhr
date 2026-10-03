import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
} from '@mui/material';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import PolicyRoundedIcon from '@mui/icons-material/PolicyRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import { DOCUMENT_CENTRE_TABS } from '../constants';

const ICONS = {
  form16: DescriptionRoundedIcon,
  policies: PolicyRoundedIcon,
  forms: AssignmentRoundedIcon,
};

/**
 * @param {{ value: string, onChange: (value: string) => void }} props
 */
export function DocumentCentreRail({ value, onChange }) {
  return (
    <Paper
      elevation={0}
      sx={{
        width: { xs: '100%', md: 220 },
        flexShrink: 0,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
      <List disablePadding>
        {DOCUMENT_CENTRE_TABS.map((item) => {
          const Icon = ICONS[item.value];
          const selected = value === item.value;
          return (
            <ListItemButton
              key={item.value}
              selected={selected}
              onClick={() => onChange(item.value)}
              sx={{
                py: 1.25,
                px: 1.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': { bgcolor: 'primary.dark' },
                  '& .MuiListItemIcon-root': { color: 'inherit' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: 'text.secondary' }}>
                {Icon ? <Icon fontSize="small" /> : null}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontWeight: selected ? 700 : 600, variant: 'body2' }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Paper>
  );
}
