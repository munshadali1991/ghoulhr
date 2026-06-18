import { useMemo, useState } from 'react';
import {
  Autocomplete,
  Box,
  Chip,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';

/**
 * @param {{
 *   roles: import('@/features/rbac/types/rbac.types').RbacRole[],
 *   selectedRoleId: string,
 *   onSelect: (roleId: string) => void,
 *   onClone: (role: import('@/features/rbac/types/rbac.types').RbacRole) => void,
 *   onDeactivate: (role: import('@/features/rbac/types/rbac.types').RbacRole) => void,
 *   canManage: boolean,
 * }} props
 */
export function RoleCatalogPanel({
  roles,
  selectedRoleId,
  onSelect,
  onClone,
  onDeactivate,
  canManage,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [search, setSearch] = useState('');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuRole, setMenuRole] = useState(null);

  const filteredRoles = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q),
    );
  }, [roles, search]);

  const systemRoles = filteredRoles.filter((r) => r.isSystem);
  const customRoles = filteredRoles.filter((r) => !r.isSystem);

  const selectedRole = roles.find((r) => r.id === selectedRoleId) ?? null;

  const openMenu = (event, role) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setMenuRole(role);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuRole(null);
  };

  const renderRoleItem = (role) => (
    <ListItemButton
      key={role.id}
      selected={role.id === selectedRoleId}
      onClick={() => onSelect(role.id)}
      sx={{
        borderRadius: 1,
        mb: 0.5,
        borderLeft: 3,
        borderColor: role.id === selectedRoleId ? 'primary.main' : 'transparent',
        bgcolor: role.id === selectedRoleId ? 'action.selected' : undefined,
      }}
    >
      <ListItemText
        primary={
          <Stack direction="row" alignItems="center" spacing={0.5} flexWrap="wrap">
            <Typography variant="body2" fontWeight={600} noWrap>
              {role.name}
            </Typography>
            <Chip
              label={role.isSystem ? 'System' : 'Custom'}
              size="small"
              color={role.isSystem ? 'default' : 'primary'}
              variant="outlined"
              sx={{ height: 20, fontSize: '0.65rem' }}
            />
          </Stack>
        }
        secondary={
          <Typography variant="caption" color="text.secondary">
            {role.permissionCount ?? 0} permissions · {role.assignedEmployeeCount ?? 0} people
          </Typography>
        }
      />
      {canManage && (
        <IconButton size="small" onClick={(e) => openMenu(e, role)}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
      )}
    </ListItemButton>
  );

  const renderSection = (title, sectionRoles) => {
    if (sectionRoles.length === 0) return null;
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="overline" color="text.secondary" sx={{ px: 1 }}>
          {title} ({sectionRoles.length})
        </Typography>
        <List dense disablePadding>
          {sectionRoles.map(renderRoleItem)}
        </List>
      </Box>
    );
  };

  if (isMobile) {
    return (
      <Box sx={{ mb: 2 }}>
        <Autocomplete
          options={filteredRoles}
          getOptionLabel={(role) => role.name}
          value={selectedRole}
          onChange={(_, role) => role && onSelect(role.id)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select role"
              size="small"
              placeholder="Search roles..."
            />
          )}
          renderOption={(props, role) => (
            <Box component="li" {...props} key={role.id}>
              <Stack>
                <Typography variant="body2" fontWeight={600}>
                  {role.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {role.isSystem ? 'System' : 'Custom'} · {role.permissionCount ?? 0} permissions
                </Typography>
              </Stack>
            </Box>
          )}
          isOptionEqualToValue={(opt, val) => opt.id === val.id}
          fullWidth
        />
        {canManage && selectedRole && (
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Chip
              label="Clone role"
              size="small"
              clickable
              onClick={() => onClone(selectedRole)}
            />
            {selectedRole.isDeletable && (
              <Chip
                label="Deactivate"
                size="small"
                color="error"
                variant="outlined"
                clickable
                onClick={() => onDeactivate(selectedRole)}
              />
            )}
          </Stack>
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: 300,
        flexShrink: 0,
        borderRight: 1,
        borderColor: 'divider',
        pr: 2,
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 640,
      }}
    >
      <TextField
        placeholder="Search roles..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        size="small"
        fullWidth
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      <Box sx={{ overflow: 'auto', flex: 1 }}>
        {renderSection('System roles', systemRoles)}
        {renderSection('Custom roles', customRoles)}
        {filteredRoles.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
            No roles match your search.
          </Typography>
        )}
      </Box>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem
          onClick={() => {
            if (menuRole) onClone(menuRole);
            closeMenu();
          }}
        >
          Clone role
        </MenuItem>
        {menuRole?.isDeletable && (
          <MenuItem
            onClick={() => {
              if (menuRole) onDeactivate(menuRole);
              closeMenu();
            }}
            sx={{ color: 'error.main' }}
          >
            Deactivate role
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
}
