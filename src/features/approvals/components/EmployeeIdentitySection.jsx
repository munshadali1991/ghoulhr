import { Box, Typography } from '@mui/material';

/**
 * @param {{ employee: import('../types/approvals.types').LeaveApprovalDetail['employee'] }} props
 */
export function EmployeeIdentitySection({ employee }) {
  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
        Employee
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 1.5,
        }}
      >
        <Field label="Name" value={employee.name} />
        <Field label="Employee ID" value={employee.employeeCode ?? '—'} />
        <Field label="Department" value={employee.departmentName ?? '—'} />
        <Field label="Designation" value={employee.designationName ?? '—'} />
      </Box>
    </Box>
  );
}

/**
 * @param {{ label: string, value: string }} props
 */
function Field({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {value}
      </Typography>
    </Box>
  );
}
