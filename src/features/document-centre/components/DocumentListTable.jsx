import {
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { formatBytes } from '../constants';

/**
 * @param {{
 *   rows: object[],
 *   category: string,
 *   canManage: boolean,
 *   onPreview: (id: string) => void,
 *   onDownload: (id: string) => void,
 *   onDelete?: (id: string) => void,
 *   downloadingId?: string | null,
 * }} props
 */
export function DocumentListTable({
  rows,
  category,
  canManage,
  onPreview,
  onDownload,
  onDelete,
  downloadingId = null,
}) {
  const showEmployee = category === 'FORM16';
  const showFy = category === 'FORM16';

  if (!rows?.length) {
    return (
      <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
        No documents found.
      </Typography>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            {showEmployee && <TableCell>Employee</TableCell>}
            {showFy && <TableCell>Financial Year</TableCell>}
            <TableCell>File</TableCell>
            <TableCell>Size</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} hover>
              <TableCell>{row.title}</TableCell>
              {showEmployee && (
                <TableCell>
                  <Stack spacing={0}>
                    <Typography variant="body2">
                      {row.employeeName || '—'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.employeeCode || ''}
                    </Typography>
                  </Stack>
                </TableCell>
              )}
              {showFy && <TableCell>{row.financialYear || '—'}</TableCell>}
              <TableCell>{row.originalFileName}</TableCell>
              <TableCell>{formatBytes(row.sizeBytes)}</TableCell>
              <TableCell align="right">
                <Tooltip title="View">
                  <IconButton
                    size="small"
                    onClick={() => onPreview(row.id)}
                    aria-label="View"
                  >
                    <VisibilityRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download">
                  <IconButton
                    size="small"
                    onClick={() => onDownload(row.id)}
                    disabled={downloadingId === row.id}
                    aria-label="Download"
                  >
                    <DownloadRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                {canManage && onDelete ? (
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDelete(row.id)}
                      aria-label="Delete"
                    >
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ) : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
