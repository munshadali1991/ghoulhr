import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  Typography,
} from '@mui/material';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationUnreadCount,
  useNotifications,
} from '../hooks/useEmployeePortalQueries';

export function EmployeeNotificationsMenu() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const unreadQuery = useNotificationUnreadCount();
  const notificationsQuery = useNotifications(open);
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const unreadCount = unreadQuery.data?.unreadCount ?? 0;
  const items = notificationsQuery.data?.items ?? [];

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleItemClick = async (item) => {
    if (!item.readAt) {
      try {
        await markReadMutation.mutateAsync(item.id);
      } catch {
        /* ignore */
      }
    }

    if (item.type === 'LEAVE_PENDING_APPROVAL' && item.leaveRequestId) {
      handleClose();
      navigate('/leave/requests');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllReadMutation.mutateAsync();
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      <IconButton
        size="small"
        aria-label="Notifications"
        aria-controls={open ? 'notifications-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleOpen}
      >
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <NotificationsNoneRoundedIcon />
        </Badge>
      </IconButton>
      <Menu
        id="notifications-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 360, maxHeight: 420 } } }}
      >
        <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle2" fontWeight={700}>
            Notifications
          </Typography>
          {unreadCount > 0 ? (
            <Button
              size="small"
              onClick={handleMarkAllRead}
              disabled={markAllReadMutation.isPending}
            >
              Mark all read
            </Button>
          ) : null}
        </Box>
        <Divider />
        {notificationsQuery.isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : items.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 3 }}>
            No notifications yet
          </Typography>
        ) : (
          <List dense disablePadding sx={{ maxHeight: 320, overflow: 'auto' }}>
            {items.map((item) => (
              <ListItemButton
                key={item.id}
                onClick={() => handleItemClick(item)}
                sx={{
                  bgcolor: item.readAt ? 'transparent' : 'action.hover',
                  alignItems: 'flex-start',
                }}
              >
                <ListItemText
                  primary={item.title}
                  secondary={item.body}
                  slotProps={{
                    primary: { variant: 'body2', fontWeight: item.readAt ? 400 : 600 },
                    secondary: { variant: 'caption' },
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </Menu>
    </>
  );
}
