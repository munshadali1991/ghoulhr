import { Box, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { PageCard } from '@/shared/components/ui/PageCard';

/**
 * @param {{
 *   request: import('../types/approvals.types').LeaveApprovalRequest,
 *   selected: boolean,
 *   onSelect: () => void,
 * }} props
 */
export function LeaveRequestListItem({ request, selected, onSelect }) {
  return (
    <PageCard
      sx={{
        mb: 1,
        cursor: 'pointer',
        border: '2px solid',
        borderColor: selected ? 'primary.main' : 'transparent',
        bgcolor: selected ? 'action.selected' : 'background.paper',
      }}
      onClick={onSelect}
    >
      <Box sx={{ px: 1.5, py: 1.25 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight={700} noWrap>
              {request.employeeName}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" noWrap>
              {request.leaveType} · {request.daysCount} day(s)
            </Typography>
            {request.departmentName ? (
              <Typography variant="caption" color="text.secondary" display="block" noWrap>
                {request.departmentName}
              </Typography>
            ) : null}
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
            {dayjs(request.appliedOn).format('DD MMM')}
          </Typography>
        </Stack>
      </Box>
    </PageCard>
  );
}
