import { Button, Stack, Typography } from '@mui/material';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';

/**
 * @param {{
 *   document: import('../types/approvals.types').LeaveApprovalDetail['supportingDocument'],
 *   onDownload: () => void,
 *   downloading?: boolean,
 * }} props
 */
export function AttachmentSection({ document, onDownload, downloading }) {
  if (!document) {
    return (
      <Typography variant="body2" color="text.secondary">
        No supporting document attached.
      </Typography>
    );
  }

  const sizeKb = Math.round(document.sizeBytes / 1024);

  return (
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <AttachFileRoundedIcon fontSize="small" color="action" />
      <BoxGrow>
        <Typography variant="body2" fontWeight={600}>
          {document.fileName}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {document.mimeType} · {sizeKb} KB
        </Typography>
      </BoxGrow>
      <Button size="small" variant="outlined" onClick={onDownload} disabled={downloading}>
        Download
      </Button>
    </Stack>
  );
}

function BoxGrow({ children }) {
  return <div style={{ flex: 1, minWidth: 0 }}>{children}</div>;
}
