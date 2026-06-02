import {
  Box,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { WORK_TYPES, TASK_STATUSES, PRIORITIES } from '../../constants/timesheetEnums';

function labelFor(options, value) {
  return options.find((o) => o.value === value)?.label ?? value;
}

/**
 * @param {{ entry: object }} props
 */
function TimesheetEntryCard({ entry, editable, onEdit, onDelete }) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="subtitle2" fontWeight={700}>
            {entry.taskName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {entry.projectName}
          </Typography>
        </Box>
        <Typography variant="subtitle2" fontWeight={700}>
          {Number(entry.hoursSpent).toFixed(1)}h
        </Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {entry.taskDescription}
      </Typography>
      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
        <Typography variant="caption">{labelFor(WORK_TYPES, entry.workType)}</Typography>
        <Typography variant="caption">·</Typography>
        <Typography variant="caption">{labelFor(TASK_STATUSES, entry.taskStatus)}</Typography>
        <Typography variant="caption">·</Typography>
        <Typography variant="caption">{labelFor(PRIORITIES, entry.priority)}</Typography>
      </Stack>
      {editable ? (
        <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<EditOutlinedIcon />}
            onClick={() => onEdit(entry)}
          >
            Edit
          </Button>
          <Button
            size="small"
            color="error"
            variant="text"
            startIcon={<DeleteOutlineIcon />}
            onClick={() => onDelete(entry)}
          >
            Delete
          </Button>
        </Stack>
      ) : null}
    </Box>
  );
}

/**
 * @param {{
 *   entries: object[],
 *   editable: boolean,
 *   onEdit: (entry: object) => void,
 *   onDelete: (entry: object) => void,
 * }} props
 */
export function TimesheetEntryList({ entries, editable, onEdit, onDelete }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (isMobile) {
    return (
      <Stack spacing={1.5}>
        {entries.map((entry, index) => (
          <TimesheetEntryCard
            key={entry.id ?? `entry-${index}`}
            entry={entry}
            editable={editable}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </Stack>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Project</TableCell>
            <TableCell>Task</TableCell>
            <TableCell>Work type</TableCell>
            <TableCell align="right">Hours</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Priority</TableCell>
            {editable ? <TableCell align="right">Actions</TableCell> : null}
          </TableRow>
        </TableHead>
        <TableBody>
          {entries.map((entry, index) => (
            <TableRow key={entry.id ?? `entry-${index}`} hover>
              <TableCell>{entry.projectName}</TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={600}>
                  {entry.taskName}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200, display: 'block' }}>
                  {entry.taskDescription}
                </Typography>
              </TableCell>
              <TableCell>{labelFor(WORK_TYPES, entry.workType)}</TableCell>
              <TableCell align="right">{Number(entry.hoursSpent).toFixed(1)}</TableCell>
              <TableCell>{labelFor(TASK_STATUSES, entry.taskStatus)}</TableCell>
              <TableCell>{labelFor(PRIORITIES, entry.priority)}</TableCell>
              {editable ? (
                <TableCell align="right">
                  <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditOutlinedIcon />}
                      onClick={() => onEdit(entry)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => onDelete(entry)}
                    >
                      Delete
                    </Button>
                  </Stack>
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
