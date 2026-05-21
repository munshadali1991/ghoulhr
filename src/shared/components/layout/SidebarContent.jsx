import {
  Avatar,
  Box,
  Chip,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

export function SidebarContent({ user, navItems, onItemClick, pathname = '' }) {
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
        {navItems.map((item) => {
          const hasChildren = Array.isArray(item.children) && item.children.length > 0;
          const submenuOpen =
            hasChildren &&
            (item.submenuOpen !== undefined
              ? item.submenuOpen
              : Boolean(item.expandPathPrefix) && pathname.startsWith(item.expandPathPrefix));

          if (!hasChildren) {
            return (
              <ListItemButton
                key={item.key ?? item.label}
                selected={Boolean(item.active)}
                sx={{ borderRadius: 2, mb: 0.75 }}
                onClick={() => onItemClick?.(item)}
              >
                <ListItemIcon sx={{ minWidth: 38 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            );
          }

          return (
            <Box key={item.key ?? item.label} sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={Boolean(item.active)}
                sx={{ borderRadius: 2, mb: 0.25 }}
                onClick={() => onItemClick?.(item)}
              >
                <ListItemIcon sx={{ minWidth: 38 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
                {submenuOpen ? <ExpandLess sx={{ color: 'text.secondary' }} /> : <ExpandMore sx={{ color: 'text.secondary' }} />}
              </ListItemButton>
              <Collapse in={submenuOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ pl: 1, pb: 0.5 }}>
                  {item.children.map((child) => (
                    <ListItemButton
                      key={child.key ?? child.path ?? child.label}
                      selected={Boolean(child.path) && pathname === child.path}
                      sx={{ borderRadius: 2, py: 0.75, pl: 5 }}
                      onClick={() => onItemClick?.(child)}
                    >
                      <ListItemText
                        primary={child.label}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: pathname === child.path ? 600 : 500 }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            </Box>
          );
        })}
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
