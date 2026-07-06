import { Box, Button, Chip, Stack, Tab, Tabs, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
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
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'flex-start' },
        justifyContent: 'space-between',
        gap: 2,
        mb: 3,
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Typography variant="h5" component="h1" fontWeight={700} letterSpacing="-0.02em">
          Performance assessment master
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 640 }}>
          Build your assessment template from scratch. Assign sections to organization roles and
          choose question input types. New assessments snapshot this master at assignment time.
        </Typography>
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
      </Box>

      {showAddSection && onAddSection ? (
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={onAddSection}
          sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' }, flexShrink: 0 }}
        >
          Add section
        </Button>
      ) : null}
      {showAddRating && onAddRating ? (
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={onAddRating}
          sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' }, flexShrink: 0 }}
        >
          Add rating option
        </Button>
      ) : null}
    </Box>
  );
}

export { PERFORMANCE_TABS };
