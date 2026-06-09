import { Box, Button, Tab, Tabs, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { TIMESHEET_TABS } from '../timesheetTabs';

/**
 * @param {{
 *   activeTab: string,
 *   onTabChange: (tab: string) => void,
 *   onAddCategory?: () => void,
 *   showAddCategory?: boolean,
 * }} props
 */
export function TimesheetSettingsToolbar({
  activeTab,
  onTabChange,
  onAddCategory,
  showAddCategory = false,
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
        justifyContent: 'space-between',
        gap: 2,
        mb: 3,
      }}
    >
      <Box>
        <Typography variant="h5" component="h1" fontWeight={700} letterSpacing="-0.02em">
          Timesheet settings
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 560 }}>
          Configure daily hour limits, submission windows, employee guidance, and categories.
        </Typography>
        <Tabs
          value={activeTab}
          onChange={(_, value) => onTabChange(value)}
          sx={{ mt: 2, minHeight: 40 }}
          aria-label="Timesheet settings tabs"
        >
          <Tab label="General" value={TIMESHEET_TABS.general} sx={{ minHeight: 40 }} />
          <Tab label="Category" value={TIMESHEET_TABS.category} sx={{ minHeight: 40 }} />
        </Tabs>
      </Box>

      {showAddCategory ? (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddCategory}
          sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' }, flexShrink: 0 }}
        >
          Add category
        </Button>
      ) : null}
    </Box>
  );
}
