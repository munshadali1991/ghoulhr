import {
  Box,
  Button,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
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
    <PageCard sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Sections
          </Typography>
          {!readOnly && onAdd ? (
            <Button size="small" startIcon={<AddRoundedIcon />} onClick={onAdd}>
              Add
            </Button>
          ) : null}
        </Stack>
      </Box>

      <List dense sx={{ flex: 1, overflow: 'auto', py: 0 }}>
        {sections.map((section, index) => {
          const status = statusFor(index);
          const dot = status.complete ? (
            <CheckCircleRoundedIcon sx={{ fontSize: 14, color: 'success.main' }} />
          ) : (
            <ErrorOutlineRoundedIcon sx={{ fontSize: 14, color: 'warning.main' }} />
          );
          const tooltipTitle =
            status.issues.length > 0
              ? status.issues.join(' · ')
              : status.complete
                ? 'Section is complete'
                : 'Section needs attention';

          return (
            <ListItemButton
              key={section.id ?? index}
              selected={selectedIndex === index}
              onClick={() => onSelect(index)}
              sx={{ alignItems: 'flex-start', py: 1.25 }}
            >
              <Tooltip title={tooltipTitle} placement="left">
                <Box sx={{ pt: 0.75, pr: 1, flexShrink: 0 }}>{dot}</Box>
              </Tooltip>
              <ListItemText
                primary={section.title?.trim() || `Section ${index + 1}`}
                secondary={`${roleName(section.role)} · ${section.questions?.length ?? 0} questions`}
                primaryTypographyProps={{ fontWeight: 600, noWrap: true }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
              {!readOnly ? (
                <Stack direction="row" spacing={0} onClick={(e) => e.stopPropagation()}>
                  <Tooltip title="Move up">
                    <span>
                      <IconButton
                        size="small"
                        disabled={index === 0}
                        onClick={() => onMove(index, index - 1)}
                      >
                        <ArrowUpwardRoundedIcon fontSize="small" />
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
                        <ArrowDownwardRoundedIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Delete section">
                    <IconButton size="small" color="error" onClick={() => onDelete?.(index)}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              ) : null}
            </ListItemButton>
          );
        })}
      </List>
    </PageCard>
  );
}
