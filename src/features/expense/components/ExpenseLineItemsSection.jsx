import {
  Box,
  Button,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { formatBytes } from '@/features/document-centre/constants';

/**
 * @param {{
 *   lines: Array<{
 *     id: string,
 *     lineNo?: number,
 *     categoryName?: string,
 *     expenseDate?: string,
 *     merchant?: string,
 *     description?: string,
 *     amount?: string,
 *     hasReceipt?: boolean,
 *     receiptFileName?: string,
 *     receiptMimeType?: string,
 *     receiptSizeBytes?: number,
 *   }>,
 *   currency?: string,
 *   onPreviewReceipt: (line: object) => void,
 *   onDownloadReceipt: (line: object) => void,
 *   receiptBusyLineId?: string | null,
 * }} props
 */
export function ExpenseLineItemsSection({
  lines = [],
  currency = 'INR',
  onPreviewReceipt,
  onDownloadReceipt,
  receiptBusyLineId = null,
}) {
  if (!lines.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        No expense lines on this claim.
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2" fontWeight={700}>
        Expense items ({lines.length})
      </Typography>
      {lines.map((line) => {
        const busy = receiptBusyLineId === line.id;
        const sizeLabel =
          line.receiptSizeBytes != null && line.receiptSizeBytes > 0
            ? formatBytes(line.receiptSizeBytes)
            : null;

        return (
          <Box
            key={line.id}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              p: 1.5,
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              spacing={1}
            >
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography fontWeight={700}>
                  #{line.lineNo} · {line.categoryName || 'Category'} · {currency}{' '}
                  {line.amount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {line.expenseDate} · {line.merchant}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {line.description}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                  <Chip
                    size="small"
                    color={line.hasReceipt ? 'success' : 'warning'}
                    label={line.hasReceipt ? 'Receipt attached' : 'Receipt missing'}
                  />
                  {line.hasReceipt && line.receiptFileName ? (
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {line.receiptFileName}
                      {sizeLabel ? ` · ${sizeLabel}` : ''}
                    </Typography>
                  ) : null}
                </Stack>
              </Box>

              {line.hasReceipt ? (
                <Stack direction="row" spacing={1} alignItems="flex-start" flexShrink={0}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<VisibilityOutlinedIcon />}
                    onClick={() => onPreviewReceipt(line)}
                    disabled={busy}
                  >
                    Preview
                  </Button>
                  <Button
                    size="small"
                    variant="text"
                    startIcon={<AttachFileRoundedIcon />}
                    onClick={() => onDownloadReceipt(line)}
                    disabled={busy}
                  >
                    Download
                  </Button>
                </Stack>
              ) : null}
            </Stack>
          </Box>
        );
      })}
    </Stack>
  );
}
