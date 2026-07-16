import { useMemo, useState } from 'react';
import {
  Autocomplete,
  Box,
  Chip,
  IconButton,
  InputAdornment,
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
import { PageCard } from '@/shared/components/ui/PageCard';

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

  const renderRoleItem = (role) => {
    const selected = role.id === selectedRoleId;
    return (
      <Box
        key={role.id}
        onClick={() => onSelect(role.id)}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 1,
          py: 1.25,
          px: 1.5,
          mb: 0.25,
          borderRadius: 1,
          borderLeft: 3,
          borderLeftColor: selected ? 'secondary.main' : 'transparent',
          bgcolor: selected
            ? (t) =>
                t.palette.mode === 'dark'
                  ? 'rgba(96, 165, 250, 0.12)'
                  : 'rgba(59, 130, 246, 0.08)'
            : 'transparent',
          cursor: 'pointer',
          '&:hover': {
            bgcolor: selected
              ? undefined
              : (t) => t.palette.custom?.surfaces?.subtle ?? 'action.hover',
          },
        }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={0.75} flexWrap="wrap" useFlexGap>
            <Typography variant="body2" fontWeight={600} noWrap>
              {role.name}
            </Typography>
            <Chip
              label={role.isSystem ? 'System' : 'Custom'}
              size="small"
              sx={{
                height: 20,
                typography: 'micro',
                fontWeight: 700,
                bgcolor: role.isSystem
                  ? (t) => t.palette.custom?.surfaces?.muted ?? 'action.hover'
                  : (t) =>
                      t.palette.mode === 'dark'
                        ? 'rgba(96, 165, 250, 0.16)'
                        : 'rgba(59, 130, 246, 0.12)',
                color: role.isSystem ? 'text.secondary' : 'secondary.main',
                border: 'none',
              }}
            />
          </Stack>
          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.35 }}>
            {role.permissionCount ?? 0} permissions · {role.assignedEmployeeCount ?? 0} people
          </Typography>
        </Box>
        {canManage ? (
          <IconButton
            size="small"
            onClick={(e) => openMenu(e, role)}
            sx={{ color: 'text.disabled', flexShrink: 0 }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        ) : null}
      </Box>
    );
  };

  const renderSection = (title, sectionRoles) => {
    if (sectionRoles.length === 0) return null;
    return (
      <Box sx={{ mb: 1.5 }}>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            px: 0.5,
            mb: 1,
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'text.disabled',
          }}
        >
          {title} ({sectionRoles.length})
        </Typography>
        {sectionRoles.map(renderRoleItem)}
      </Box>
    );
  };

  const menu = (
    <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
      <MenuItem
        onClick={() => {
          if (menuRole) onClone(menuRole);
          closeMenu();
        }}
      >
        Clone role
      </MenuItem>
      {menuRole?.isDeletable ? (
        <MenuItem
          onClick={() => {
            if (menuRole) onDeactivate(menuRole);
            closeMenu();
          }}
          sx={{ color: 'error.main' }}
        >
          Deactivate role
        </MenuItem>
      ) : null}
    </Menu>
  );

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
        {canManage && selectedRole ? (
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Chip label="Clone role" size="small" clickable onClick={() => onClone(selectedRole)} />
            {selectedRole.isDeletable ? (
              <Chip
                label="Deactivate"
                size="small"
                color="error"
                variant="outlined"
                clickable
                onClick={() => onDeactivate(selectedRole)}
              />
            ) : null}
          </Stack>
        ) : null}
      </Box>
    );
  }

  return (
    <PageCard sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <TextField
        placeholder="Search roles..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        size="small"
        fullWidth
        sx={{
          mb: 1.5,
          '& .MuiOutlinedInput-root': {
            bgcolor: (t) => t.palette.custom?.surfaces?.subtle ?? 'background.default',
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
      />

      <Box sx={{ overflow: 'auto', flex: 1, maxHeight: 600 }}>
        {renderSection('System roles', systemRoles)}
        {renderSection('Custom roles', customRoles)}
        {filteredRoles.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ px: 0.5 }}>
            No roles match your search.
          </Typography>
        ) : null}
      </Box>

      {menu}
    </PageCard>
  );
}
