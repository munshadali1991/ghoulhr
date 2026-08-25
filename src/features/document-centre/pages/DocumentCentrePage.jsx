import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import { PageCard } from '@/shared/components/ui';
import { useAuthorization } from '@/features/auth/hooks/useAuthorization';
import {
  deleteDocument,
  downloadDocument,
  listDocuments,
} from '../api/documentCentreApi';
import { DOCUMENT_CENTRE_TABS, POLICY_SUBTABS } from '../constants';
import { DocumentListTable } from '../components/DocumentListTable';
import { DocumentCentreRail } from '../components/DocumentCentreRail';
import { DocumentCentreSubtabs } from '../components/DocumentCentreSubtabs';
import { DocumentPreviewDialog } from '../components/DocumentPreviewDialog';
import { Form16UploadDialog } from '../components/Form16UploadDialog';
import { PublicDocumentUploadDialog } from '../components/PublicDocumentUploadDialog';

export function DocumentCentrePage() {
  const { can } = useAuthorization();
  const canManage = can('documents:write');
  const queryClient = useQueryClient();

  const [tab, setTab] = useState('form16');
  const [policySubtab, setPolicySubtab] = useState('GENERAL');
  const [form16Open, setForm16Open] = useState(false);
  const [publicOpen, setPublicOpen] = useState(false);
  const [previewId, setPreviewId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [actionError, setActionError] = useState('');

  const activeTab = DOCUMENT_CENTRE_TABS.find((t) => t.value === tab);
  const category = activeTab?.category || 'FORM16';

  const listParams = useMemo(() => {
    const params = { category };
    if (category === 'POLICY') {
      params.subcategory = policySubtab;
    }
    return params;
  }, [category, policySubtab]);

  const queryKey = ['document-centre', listParams];

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey,
    queryFn: () => listDocuments(listParams),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteDocument(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['document-centre'] }),
    onError: (err) => setActionError(err?.message || 'Delete failed'),
  });

  const rows = Array.isArray(data) ? data : [];

  const handleDownload = async (id) => {
    setActionError('');
    setDownloadingId(id);
    try {
      await downloadDocument(id);
    } catch (err) {
      setActionError(err?.message || 'Download failed');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this document?')) return;
    setActionError('');
    deleteMutation.mutate(id);
  };

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['document-centre'] });
  };

  const uploadButton = (() => {
    if (!canManage) return null;
    if (tab === 'form16') {
      return (
        <Button
          variant="contained"
          startIcon={<UploadFileRoundedIcon />}
          onClick={() => setForm16Open(true)}
        >
          Upload Form 16
        </Button>
      );
    }
    if (tab === 'policies' || tab === 'forms') {
      return (
        <Button
          variant="contained"
          startIcon={<UploadFileRoundedIcon />}
          onClick={() => setPublicOpen(true)}
        >
          Upload
        </Button>
      );
    }
    return null;
  })();

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1280, mx: 'auto' }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2.5}
        alignItems="stretch"
      >
        <DocumentCentreRail value={tab} onChange={setTab} />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
            spacing={2}
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Document Centre
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Form 16, company policies, and forms
              </Typography>
            </Box>
            {uploadButton}
          </Stack>

          {tab === 'policies' ? (
            <Box sx={{ mb: 2 }}>
              <DocumentCentreSubtabs
                value={policySubtab}
                options={POLICY_SUBTABS}
                onChange={setPolicySubtab}
              />
            </Box>
          ) : null}

          {actionError ? (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError('')}>
              {actionError}
            </Alert>
          ) : null}

          <PageCard sx={{ p: { xs: 2, md: 3 } }}>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress size={32} />
              </Box>
            ) : isError ? (
              <Alert
                severity="error"
                action={
                  <Button color="inherit" size="small" onClick={() => refetch()}>
                    Retry
                  </Button>
                }
              >
                {error?.message || 'Failed to load documents'}
              </Alert>
            ) : (
              <DocumentListTable
                rows={rows}
                category={category}
                canManage={canManage}
                onPreview={setPreviewId}
                onDownload={handleDownload}
                onDelete={canManage ? handleDelete : undefined}
                downloadingId={downloadingId}
              />
            )}
          </PageCard>
        </Box>
      </Stack>

      <Form16UploadDialog
        open={form16Open}
        onClose={() => setForm16Open(false)}
        onSuccess={refresh}
      />
      <PublicDocumentUploadDialog
        open={publicOpen}
        onClose={() => setPublicOpen(false)}
        onSuccess={refresh}
        kind={tab === 'forms' ? 'form' : 'policy'}
        defaultSubcategory={policySubtab}
      />
      <DocumentPreviewDialog
        open={Boolean(previewId)}
        documentId={previewId}
        onClose={() => setPreviewId(null)}
        onDownload={handleDownload}
      />
    </Box>
  );
}
