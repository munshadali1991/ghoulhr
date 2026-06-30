import { Box, Button, Tab, Tabs, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

export function OrgStructureToolbar({
  activeTab,
  allowedTabs = [],
  onTabChange,
  onAdd,
  canWrite = false,
  addDisabled = false,
}) {
  const isDepartments = activeTab === 'departments';

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
          Organization structure
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 560 }}>
          Manage departments and designations used across employee records and onboarding.
        </Typography>
        <Tabs
          value={activeTab}
          onChange={(_, value) => onTabChange(value)}
          sx={{ mt: 2, minHeight: 40 }}
          aria-label="Department and designation tabs"
        >
          {allowedTabs.map((tab) => (
            <Tab
              key={tab.key}
              label={tab.label}
              value={tab.key}
              sx={{ minHeight: 40 }}
            />
          ))}
        </Tabs>
      </Box>

      {canWrite ? (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAdd}
          disabled={addDisabled}
          sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' }, flexShrink: 0 }}
        >
          {isDepartments ? 'Add Department' : 'Add Designation'}
        </Button>
      ) : null}
    </Box>
  );
}
