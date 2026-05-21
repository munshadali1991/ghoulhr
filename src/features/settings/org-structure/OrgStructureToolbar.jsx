import { Box, Button, Tab, Tabs, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { ORG_STRUCTURE_TABS } from './orgStructureTabs';

export function OrgStructureToolbar({ activeTab, onTabChange, onAdd, addDisabled = false }) {
  const isDepartments = activeTab === ORG_STRUCTURE_TABS.departments;

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
          <Tab label="Departments" value={ORG_STRUCTURE_TABS.departments} sx={{ minHeight: 40 }} />
          <Tab label="Designations" value={ORG_STRUCTURE_TABS.designations} sx={{ minHeight: 40 }} />
        </Tabs>
      </Box>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onAdd}
        disabled={addDisabled}
        sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' }, flexShrink: 0 }}
      >
        {isDepartments ? 'Add Department' : 'Add Designation'}
      </Button>
    </Box>
  );
}
