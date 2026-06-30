import { Box, Button, Chip, Stack, Tab, Tabs, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { ORGANIZATION_TABS, ORGANIZATION_TAB_DEFS, organizationPathForTab } from '../organizationTabs';
import { formatFinancialYearLabel } from '../utils/organizationFyUtils';

/**
 * @param {{
 *   activeTab: string,
 *   financialYearStartMonth?: string,
 *   calendarStatus?: string | null,
 *   holidayCount?: number,
 *   showAddHoliday?: boolean,
 *   onAddHoliday?: () => void,
 * }} props
 */
export function OrganizationSettingsToolbar({
  activeTab,
  financialYearStartMonth = '4',
  calendarStatus = null,
  holidayCount = 0,
  showAddHoliday = false,
  onAddHoliday,
}) {
  const navigate = useNavigate();
  const isProfile = activeTab === ORGANIZATION_TABS.profile;
  const fyLabel = formatFinancialYearLabel(financialYearStartMonth);

  const handleTabChange = (_, tab) => {
    navigate(organizationPathForTab(tab));
  };

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
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="h5" component="h1" fontWeight={700} letterSpacing="-0.02em">
          Organization
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 560 }}>
          Company profile and the holiday calendar employees follow across your organization.
        </Typography>

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{ mt: 2, minHeight: 40 }}
          aria-label="Organization settings tabs"
        >
          {(ORGANIZATION_TAB_DEFS ?? []).map((tab) => (
            <Tab key={tab.key} label={tab.label} value={tab.key} sx={{ minHeight: 40 }} />
          ))}
        </Tabs>

        <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
          {isProfile ? (
            <Chip size="small" label={`FY ${fyLabel}`} variant="outlined" />
          ) : (
            <>
              {calendarStatus ? (
                <Chip
                  size="small"
                  label={calendarStatus === 'PUBLISHED' ? 'Published' : 'Draft calendar'}
                  color={calendarStatus === 'PUBLISHED' ? 'success' : 'warning'}
                  variant="outlined"
                />
              ) : null}
              <Chip size="small" label={`${holidayCount} holidays`} variant="outlined" />
            </>
          )}
        </Stack>
      </Box>

      {showAddHoliday && onAddHoliday ? (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddHoliday}
          sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' }, flexShrink: 0 }}
        >
          Add holiday
        </Button>
      ) : null}
    </Box>
  );
}
