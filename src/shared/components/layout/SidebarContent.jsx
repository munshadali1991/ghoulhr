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
import { Link } from 'react-router-dom';
import { APP_BRAND_INITIALS, APP_NAME } from '@/app/config/appConfig';

const navLinkStyle = {
  textDecoration: 'none',
  color: 'inherit',
  display: 'block',
};

function userInitials(user) {
  const name = user?.name?.trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  const email = user?.email?.trim();
  return email ? email[0].toUpperCase() : 'U';
}

/**
 * @param {{
 *   item: object,
 *   onNavigate?: () => void,
 *   onItemClick?: (item: object) => void,
 *   children: import('react').ReactNode,
 * }} props
 */
function SidebarNavWrapper({ item, onNavigate, onItemClick, children }) {
  if (item.path) {
    return (
      <Link to={item.path} style={navLinkStyle} onClick={() => onNavigate?.()}>
        {children}
      </Link>
    );
  }

  return (
    <Box
      component="div"
      onClick={() => onItemClick?.(item)}
      sx={{ display: 'block' }}
    >
      {children}
    </Box>
  );
}

export function SidebarContent({
  user,
  navItems,
  onItemClick,
  pathname = '',
  onNavigate,
  brandName = APP_NAME,
  brandLogo = null,
  brandInitials = APP_BRAND_INITIALS,
}) {
  const headerAvatarSrc = user?.profilePhotoUrl || brandLogo || undefined;
  const headerInitials = headerAvatarSrc ? null : userInitials(user) || brandInitials;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar src={headerAvatarSrc} sx={{ bgcolor: 'primary.main' }}>
            {headerInitials}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography fontWeight={700} noWrap>
              {brandName}
            </Typography>
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
              <SidebarNavWrapper
                key={item.key ?? item.label}
                item={item}
                onNavigate={onNavigate}
                onItemClick={onItemClick}
              >
                <ListItemButton
                  component="div"
                  selected={Boolean(item.active)}
                  sx={{ borderRadius: 2, mb: 0.75 }}
                >
                  <ListItemIcon sx={{ minWidth: 38 }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </SidebarNavWrapper>
            );
          }

          return (
            <Box key={item.key ?? item.label} sx={{ mb: 0.5 }}>
              <SidebarNavWrapper item={item} onNavigate={onNavigate} onItemClick={onItemClick}>
                <ListItemButton
                  component="div"
                  selected={Boolean(item.active)}
                  sx={{ borderRadius: 2, mb: 0.25 }}
                >
                  <ListItemIcon sx={{ minWidth: 38 }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                  {submenuOpen ? (
                    <ExpandLess sx={{ color: 'text.secondary' }} />
                  ) : (
                    <ExpandMore sx={{ color: 'text.secondary' }} />
                  )}
                </ListItemButton>
              </SidebarNavWrapper>
              <Collapse in={submenuOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ pl: 1, pb: 0.5 }}>
                  {item.children.map((child) => (
                    <SidebarNavWrapper
                      key={child.key ?? child.path ?? child.label}
                      item={child}
                      onNavigate={onNavigate}
                      onItemClick={onItemClick}
                    >
                      <ListItemButton
                        component="div"
                        selected={Boolean(child.active)}
                        sx={{ borderRadius: 2, py: 0.75, pl: 5 }}
                      >
                        <ListItemText
                          primary={child.label}
                          primaryTypographyProps={{
                            variant: 'body2',
                            fontWeight: child.active ? 600 : 500,
                          }}
                        />
                      </ListItemButton>
                    </SidebarNavWrapper>
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
