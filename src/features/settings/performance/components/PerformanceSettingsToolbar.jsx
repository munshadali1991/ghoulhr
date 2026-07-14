import { Chip, Stack, Tab, Tabs } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { SettingsPageToolbar } from '@/shared/components/layout/SettingsPageToolbar';
import { CrudButton } from '@/shared/components/ui/CrudButton';
import { PERFORMANCE_TABS, PERFORMANCE_TAB_DEFS } from '../performanceTabs';

/**
 * @param {{
 *   activeTab: string,
 *   onTabChange: (tab: string) => void,
 *   sectionCount: number,
 *   questionCount: number,
 *   ratingCount: number,
 *   showAddSection?: boolean,
 *   showAddRating?: boolean,
 *   onAddSection?: () => void,
 *   onAddRating?: () => void,
 *   hideTabs?: boolean,
 * }} props
 */
export function PerformanceSettingsToolbar({
  activeTab,
  onTabChange,
  sectionCount,
  questionCount,
  ratingCount,
  showAddSection = false,
  showAddRating = false,
  onAddSection,
  onAddRating,
  hideTabs = false,
}) {
  const primaryAction =
    showAddSection && onAddSection ? (
      <CrudButton intent="create" startIcon={<AddRoundedIcon />} onClick={onAddSection}>
        Add section
      </CrudButton>
    ) : showAddRating && onAddRating ? (
      <CrudButton intent="create" startIcon={<AddRoundedIcon />} onClick={onAddRating}>
        Add rating level
      </CrudButton>
    ) : null;

  return (
    <SettingsPageToolbar
      title="Performance assessment master"
      subtitle="Build your assessment template from scratch. Assign sections to organization roles and choose question input types. New assessments snapshot this master at assignment time."
      primaryAction={primaryAction}
    >
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
        <Chip
          size="small"
          label={
            <>
              <strong>{sectionCount}</strong> sections
            </>
          }
          variant="outlined"
          sx={{ borderRadius: 5, fontWeight: 600, color: 'text.secondary', '& strong': { color: 'text.primary', fontWeight: 700 } }}
        />
        <Chip
          size="small"
          label={
            <>
              <strong>{questionCount}</strong> questions
            </>
          }
          variant="outlined"
          sx={{ borderRadius: 5, fontWeight: 600, color: 'text.secondary', '& strong': { color: 'text.primary', fontWeight: 700 } }}
        />
        <Chip
          size="small"
          label={
            <>
              <strong>{ratingCount}</strong> rating levels
            </>
          }
          variant="outlined"
          sx={{ borderRadius: 5, fontWeight: 600, color: 'text.secondary', '& strong': { color: 'text.primary', fontWeight: 700 } }}
        />
      </Stack>
      {!hideTabs ? (
        <Tabs
          value={activeTab}
          onChange={(_, value) => onTabChange(value)}
          sx={{
            mt: 2,
            minHeight: 40,
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTabs-indicator': {
              height: 2,
              bgcolor: 'warning.main',
            },
          }}
          aria-label="Performance settings tabs"
        >
          {PERFORMANCE_TAB_DEFS.map((tab) => (
            <Tab
              key={tab.key}
              label={tab.label}
              value={tab.key}
              sx={{
                minHeight: 40,
                mr: 3,
                px: 0.5,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
                color: 'text.disabled',
                '&.Mui-selected': {
                  color: 'text.primary',
                },
              }}
            />
          ))}
        </Tabs>
      ) : null}
    </SettingsPageToolbar>
  );
}

export { PERFORMANCE_TABS };
