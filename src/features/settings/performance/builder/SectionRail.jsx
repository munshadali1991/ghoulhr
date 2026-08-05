import { Box, Button, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded';
import { PageCard } from '@/shared/components/ui/PageCard';
import { useRbacRoles } from '@/features/rbac/hooks/useRbacAdmin';

/**
 * @param {{
 *   sections: object[],
 *   selectedIndex: number | null,
 *   sectionStatuses?: Array<{ index: number, complete: boolean, issues: string[] }>,
 *   onSelect: (index: number) => void,
 *   onAdd?: () => void,
 *   onMove: (from: number, to: number) => void,
 *   onDelete?: (index: number) => void,
 *   readOnly?: boolean,
 * }} props
 */
export function SectionRail({
  sections,
  selectedIndex,
  sectionStatuses = [],
  onSelect,
  onAdd,
  onMove,
  onDelete,
  readOnly = false,
}) {
  const { data: roles = [] } = useRbacRoles();
  const roleName = (code) => roles.find((r) => r.code === code)?.name ?? code;

  const statusFor = (index) =>
    sectionStatuses.find((s) => s.index === index) ?? { complete: false, issues: [] };

  return (
    <PageCard sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 1.5 }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
            color: 'text.secondary',
          }}
        >
          Sections
        </Typography>
        {!readOnly && onAdd ? (
          <Button
            size="small"
            color="inherit"
            startIcon={<AddRoundedIcon />}
            onClick={onAdd}
            sx={{ fontWeight: 600, px: 0.5 }}
          >
            Add
          </Button>
        ) : null}
      </Stack>

      <Stack spacing={0.25} sx={{ flex: 1, overflow: 'auto' }}>
        {sections.map((section, index) => {
          const selected = selectedIndex === index;
          const status = statusFor(index);
          const questionCount = section.questions?.length ?? 0;
          const tooltipTitle =
            status.issues.length > 0
              ? status.issues.join(' · ')
              : status.complete
                ? 'Section is complete'
                : 'Section needs attention';

          return (
            <Box
              key={section.id ?? index}
              sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                py: 1.25,
                pl: 1,
                pr: 1,
                borderRadius: 1,
                borderLeft: 3,
                borderLeftColor: selected ? 'secondary.main' : 'transparent',
                bgcolor: selected
                  ? (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(96, 165, 250, 0.12)'
                        : 'rgba(59, 130, 246, 0.08)'
                  : 'transparent',
                '&:hover': {
                  bgcolor: selected
                    ? undefined
                    : (theme) => theme.palette.custom?.surfaces?.subtle ?? 'action.hover',
                  '& .section-rail-actions': { opacity: 1 },
                },
              }}
            >
              <DragIndicatorRoundedIcon
                sx={{ color: 'text.disabled', fontSize: 16, flexShrink: 0, cursor: 'grab' }}
              />
              <Tooltip title={tooltipTitle} placement="right">
                <Box
                  onClick={() => onSelect(index)}
                  sx={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
                >
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    noWrap
                    sx={{ lineHeight: 1.35 }}
                  >
                    {section.title?.trim() || `Section ${index + 1}`}
                  </Typography>
                  <Typography variant="caption" color="text.disabled" sx={{ display: 'block' }}>
                    {roleName(section.role)} · {questionCount} question
                    {questionCount === 1 ? '' : 's'}
                  </Typography>
                </Box>
              </Tooltip>

              {!readOnly ? (
                <Stack
                  className="section-rail-actions"
                  direction="row"
                  spacing={0}
                  sx={{
                    opacity: { xs: 1, md: 0 },
                    transition: 'opacity 0.12s ease',
                    flexShrink: 0,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Tooltip title="Move up">
                    <span>
                      <IconButton
                        size="small"
                        disabled={index === 0}
                        onClick={() => onMove(index, index - 1)}
                      >
                        <ArrowUpwardRoundedIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Move down">
                    <span>
                      <IconButton
                        size="small"
                        disabled={index >= sections.length - 1}
                        onClick={() => onMove(index, index + 1)}
                      >
                        <ArrowDownwardRoundedIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Delete section">
                    <IconButton size="small" color="error" onClick={() => onDelete?.(index)}>
                      <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              ) : null}
            </Box>
          );
        })}
      </Stack>
    </PageCard>
  );
}
