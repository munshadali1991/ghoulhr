import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Avatar,
  Box,
  Chip,
  Collapse,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Popover,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import KeyboardDoubleArrowLeftRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowLeftRounded';
import KeyboardDoubleArrowRightRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowRightRounded';
import { Link } from 'react-router-dom';
import { APP_BRAND_INITIALS, APP_NAME } from '@/app/config/appConfig';

const FLYOUT_CLOSE_DELAY_MS = 120;

const navLinkStyle = {
  textDecoration: 'none',
  color: 'inherit',
  display: 'block',
};

const selectedNavSx = {
  borderRadius: 2,
  borderLeft: '3px solid',
  borderColor: 'transparent',
  '&.Mui-selected': {
    bgcolor: (theme) => theme.palette.custom.surfaces.subtle,
    borderColor: 'primary.main',
    '&:hover': {
      bgcolor: (theme) => theme.palette.custom.surfaces.muted,
    },
  },
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
    <Box component="div" onClick={() => onItemClick?.(item)} sx={{ display: 'block' }}>
      {children}
    </Box>
  );
}

/**
 * @param {{
 *   open: boolean,
 *   anchorEl: HTMLElement | null,
 *   item: object,
 *   onClose: () => void,
 *   onFlyoutEnter: () => void,
 *   onFlyoutLeave: () => void,
 *   onNavigate?: () => void,
 *   onItemClick?: (item: object) => void,
 * }} props
 */
function SidebarNavFlyout({
  open,
  anchorEl,
  item,
  onClose,
  onFlyoutEnter,
  onFlyoutLeave,
  onNavigate,
  onItemClick,
}) {
  if (!item) return null;

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      disableRestoreFocus
      disableAutoFocus
      disableEnforceFocus
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      sx={{ pointerEvents: 'none' }}
      slotProps={{
        paper: {
          onMouseEnter: onFlyoutEnter,
          onMouseLeave: onFlyoutLeave,
          sx: {
            pointerEvents: 'auto',
            ml: 0.5,
            minWidth: 200,
            borderRadius: 2,
            overflow: 'hidden',
          },
        },
      }}
    >
      <Box sx={{ px: 1.5, pt: 1.25, pb: 0.5 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          {item.label}
        </Typography>
      </Box>
      <List dense disablePadding sx={{ py: 0.5 }}>
        {(item.children ?? []).map((child) => (
          <SidebarNavWrapper
            key={child.key ?? child.path ?? child.label}
            item={child}
            onNavigate={() => {
              onNavigate?.();
              onClose();
            }}
            onItemClick={(navItem) => {
              onItemClick?.(navItem);
              onClose();
            }}
          >
            <ListItemButton
              component="div"
              selected={Boolean(child.active)}
              sx={{ ...selectedNavSx, mx: 0.5, mb: 0.25, py: 0.75 }}
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
    </Popover>
  );
}

/**
 * @param {{
 *   user: object,
 *   navItems: object[],
 *   onItemClick?: (item: object) => void,
 *   pathname?: string,
 *   onNavigate?: () => void,
 *   brandName?: string,
 *   brandLogo?: string | null,
 *   brandInitials?: string,
 *   collapsed?: boolean,
 *   onToggleCollapsed?: () => void,
 * }} props
 */
export function SidebarContent({
  user,
  navItems,
  onItemClick,
  pathname = '',
  onNavigate,
  brandName = APP_NAME,
  brandLogo = null,
  brandInitials = APP_BRAND_INITIALS,
  collapsed = false,
  onToggleCollapsed,
}) {
  const headerAvatarSrc = user?.profilePhotoUrl || brandLogo || undefined;
  const headerInitials = headerAvatarSrc ? null : userInitials(user) || brandInitials;

  const [flyoutKey, setFlyoutKey] = useState(null);
  const [flyoutAnchor, setFlyoutAnchor] = useState(null);
  const closeTimerRef = useRef(null);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current != null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const openFlyout = useCallback(
    (key, anchor) => {
      clearCloseTimer();
      setFlyoutKey(key);
      setFlyoutAnchor(anchor);
    },
    [clearCloseTimer],
  );

  const scheduleCloseFlyout = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setFlyoutKey(null);
      setFlyoutAnchor(null);
      closeTimerRef.current = null;
    }, FLYOUT_CLOSE_DELAY_MS);
  }, [clearCloseTimer]);

  const closeFlyoutNow = useCallback(() => {
    clearCloseTimer();
    setFlyoutKey(null);
    setFlyoutAnchor(null);
  }, [clearCloseTimer]);

  useEffect(() => () => clearCloseTimer(), [clearCloseTimer]);

  useEffect(() => {
    if (collapsed) return;
    closeFlyoutNow();
  }, [collapsed, closeFlyoutNow]);

  const flyoutItem = navItems.find((item) => (item.key ?? item.label) === flyoutKey) ?? null;

  const toggleButton = onToggleCollapsed ? (
    <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} placement="right">
      <IconButton
        size="small"
        onClick={onToggleCollapsed}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        sx={{
          flexShrink: 0,
          width: 36,
          height: 36,
          border: '1.5px solid',
          borderColor: 'primary.main',
          bgcolor: (theme) => theme.palette.custom.surfaces.subtle,
          color: 'primary.main',
          boxShadow: (theme) => `0 0 0 3px ${theme.palette.primary.main}22`,
          transition: (theme) =>
            theme.transitions.create(['background-color', 'box-shadow', 'transform'], {
              duration: theme.transitions.duration.shorter,
            }),
          '&:hover': {
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            boxShadow: (theme) => `0 0 0 4px ${theme.palette.primary.main}33`,
            transform: 'scale(1.06)',
          },
        }}
      >
        {collapsed ? (
          <KeyboardDoubleArrowRightRoundedIcon fontSize="small" />
        ) : (
          <KeyboardDoubleArrowLeftRoundedIcon fontSize="small" />
        )}
      </IconButton>
    </Tooltip>
  ) : null;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          p: collapsed ? 1.25 : 2.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        {collapsed ? (
          <Stack alignItems="center" spacing={1}>
            <Avatar src={headerAvatarSrc} sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
              {headerInitials}
            </Avatar>
            {toggleButton}
          </Stack>
        ) : (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar src={headerAvatarSrc} sx={{ bgcolor: 'primary.main' }}>
              {headerInitials}
            </Avatar>
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography fontWeight={700} noWrap>
                {brandName}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                Smart Workforce Platform
              </Typography>
            </Box>
            {toggleButton}
          </Stack>
        )}
      </Box>

      <List sx={{ p: collapsed ? 1 : 1.5, flexGrow: 1, overflowY: 'auto' }}>
        {navItems.map((item) => {
          const itemKey = item.key ?? item.label;
          const hasChildren = Array.isArray(item.children) && item.children.length > 0;
          const submenuOpen =
            hasChildren &&
            (item.submenuOpen !== undefined
              ? item.submenuOpen
              : Boolean(item.expandPathPrefix) && pathname.startsWith(item.expandPathPrefix));

          if (collapsed) {
            if (!hasChildren) {
              return (
                <Tooltip key={itemKey} title={item.label} placement="right" arrow>
                  <Box>
                    <SidebarNavWrapper
                      item={item}
                      onNavigate={onNavigate}
                      onItemClick={onItemClick}
                    >
                      <ListItemButton
                        component="div"
                        selected={Boolean(item.active)}
                        sx={{
                          ...selectedNavSx,
                          justifyContent: 'center',
                          px: 1,
                          mb: 0.75,
                          minHeight: 44,
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center' }}>
                          {item.icon}
                        </ListItemIcon>
                      </ListItemButton>
                    </SidebarNavWrapper>
                  </Box>
                </Tooltip>
              );
            }

            const sectionActive =
              Boolean(item.active) ||
              (item.children ?? []).some((child) => child.active) ||
              (Boolean(item.expandPathPrefix) && pathname.startsWith(item.expandPathPrefix));

            return (
              <Tooltip
                key={itemKey}
                title={flyoutKey === itemKey ? '' : item.label}
                placement="right"
                arrow
              >
                <Box
                  onMouseEnter={(e) => openFlyout(itemKey, e.currentTarget)}
                  onMouseLeave={scheduleCloseFlyout}
                >
                  <ListItemButton
                    component="div"
                    selected={sectionActive}
                    sx={{
                      ...selectedNavSx,
                      justifyContent: 'center',
                      px: 1,
                      mb: 0.75,
                      minHeight: 44,
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center' }}>
                      {item.icon}
                    </ListItemIcon>
                  </ListItemButton>
                </Box>
              </Tooltip>
            );
          }

          if (!hasChildren) {
            return (
              <SidebarNavWrapper
                key={itemKey}
                item={item}
                onNavigate={onNavigate}
                onItemClick={onItemClick}
              >
                <ListItemButton
                  component="div"
                  selected={Boolean(item.active)}
                  sx={{ ...selectedNavSx, mb: 0.75 }}
                >
                  <ListItemIcon sx={{ minWidth: 38 }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </SidebarNavWrapper>
            );
          }

          return (
            <Box key={itemKey} sx={{ mb: 0.5 }}>
              <SidebarNavWrapper item={item} onNavigate={onNavigate} onItemClick={onItemClick}>
                <ListItemButton
                  component="div"
                  selected={Boolean(item.active)}
                  sx={{ ...selectedNavSx, mb: 0.25 }}
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
                        sx={{
                          ...selectedNavSx,
                          py: 0.75,
                          pl: 5,
                        }}
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

      {!collapsed ? (
        <Paper
          variant="outlined"
          sx={{
            m: 2,
            p: 1.5,
            borderRadius: 2,
            bgcolor: (theme) => theme.palette.custom.surfaces.subtle,
          }}
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
      ) : null}

      {collapsed ? (
        <SidebarNavFlyout
          open={Boolean(flyoutKey && flyoutAnchor && flyoutItem)}
          anchorEl={flyoutAnchor}
          item={flyoutItem}
          onClose={closeFlyoutNow}
          onFlyoutEnter={clearCloseTimer}
          onFlyoutLeave={scheduleCloseFlyout}
          onNavigate={onNavigate}
          onItemClick={onItemClick}
        />
      ) : null}
    </Box>
  );
}
