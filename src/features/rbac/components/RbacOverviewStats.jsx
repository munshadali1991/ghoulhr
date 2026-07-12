import { Box, Stack, Typography } from '@mui/material';

/**
 * @param {{
 *   roles: import('@/features/rbac/types/rbac.types').RbacRole[],
 * }} props
 */
export function RbacOverviewStats({ roles }) {
  const totalRoles = roles.length;
  const customRoles = roles.filter((r) => !r.isSystem).length;
  const employeesAssigned = roles.reduce(
    (sum, r) => sum + (r.assignedEmployeeCount ?? 0),
    0,
  );

  const chips = [
    { num: totalRoles, label: 'Roles' },
    { num: customRoles, label: 'Custom roles' },
    { num: employeesAssigned, label: 'Employee assignments' },
  ];

  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{ my: 2.75 }}
      flexWrap="wrap"
      useFlexGap
    >
      {chips.map((chip) => (
        <Box
          key={chip.label}
          sx={{
            minWidth: 130,
            px: 2.25,
            py: 1.5,
            border: 1,
            borderColor: 'divider',
            borderRadius: 1.5,
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            gap: 0.25,
          }}
        >
          <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
            {chip.num}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {chip.label}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
}
