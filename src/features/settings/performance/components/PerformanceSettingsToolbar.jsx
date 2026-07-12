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
        Add rating option
      </CrudButton>
    ) : null;

  return (
    <SettingsPageToolbar
      title="Performance assessment master"
      subtitle="Build your assessment template from scratch. Assign sections to organization roles and choose question input types. New assessments snapshot this master at assignment time."
      primaryAction={primaryAction}
    >
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
        <Chip size="small" label={`${sectionCount} sections`} variant="outlined" />
        <Chip size="small" label={`${questionCount} questions`} variant="outlined" />
        <Chip size="small" label={`${ratingCount} rating levels`} variant="outlined" />
      </Stack>
      {!hideTabs ? (
        <Tabs
          value={activeTab}
          onChange={(_, value) => onTabChange(value)}
          sx={{ mt: 2, minHeight: 40 }}
          aria-label="Performance settings tabs"
        >
          {PERFORMANCE_TAB_DEFS.map((tab) => (
            <Tab key={tab.key} label={tab.label} value={tab.key} sx={{ minHeight: 40 }} />
          ))}
        </Tabs>
      ) : null}
    </SettingsPageToolbar>
  );
}

export { PERFORMANCE_TABS };
