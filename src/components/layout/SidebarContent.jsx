import { Avatar, Box, Chip, List, ListItemButton, ListItemIcon, ListItemText, Paper, Stack, Typography } from '@mui/material';

export function SidebarContent({ user, navItems, onItemClick }) {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ bgcolor: 'primary.main' }}>GH</Avatar>
          <Box>
            <Typography fontWeight={700}>GhoulHRMS</Typography>
            <Typography variant="caption" color="text.secondary">
              Smart Workforce Platform
            </Typography>
          </Box>
        </Stack>
      </Box>

      <List sx={{ p: 1.5, flexGrow: 1 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.label}
            selected={Boolean(item.active)}
            sx={{ borderRadius: 2, mb: 0.75 }}
            onClick={() => onItemClick?.(item)}
          >
            <ListItemIcon sx={{ minWidth: 38 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>

      <Paper
        variant="outlined"
        sx={{ m: 2, p: 1.5, borderRadius: 2, bgcolor: 'grey.50' }}
      >
        <Typography variant="body2" fontWeight={600} noWrap>
          {user?.email}
        </Typography>
        <Chip
          size="small"
          color="primary"
          variant="outlined"
          label={user?.role?.replace('_', ' ') ?? 'USER'}
          sx={{ mt: 1 }}
        />
      </Paper>
    </Box>
  );
}
