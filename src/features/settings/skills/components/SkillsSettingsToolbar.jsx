import { Button, Tab, Tabs } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { SettingsPageToolbar } from '@/shared/components/layout/SettingsPageToolbar';
import { SKILLS_TABS } from '../skillsTabs';

const ADD_LABELS = {
  [SKILLS_TABS.categories]: 'Add category',
  [SKILLS_TABS.subcategories]: 'Add subcategory',
  [SKILLS_TABS.skills]: 'Add skill',
};

export function SkillsSettingsToolbar({
  activeTab,
  allowedTabs = [],
  onTabChange,
  onAdd,
  canWrite = false,
  addDisabled = false,
}) {
  return (
    <SettingsPageToolbar
      title="Skills"
      subtitle="Manage the company skill catalog: categories, subcategories, and skills employees can select."
      primaryAction={
        canWrite ? (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={onAdd}
            disabled={addDisabled}
          >
            {ADD_LABELS[activeTab] ?? 'Add'}
          </Button>
        ) : null
      }
      sx={{ mb: 0 }}
    >
      <Tabs
        value={activeTab}
        onChange={(_, value) => onTabChange(value)}
        variant="scrollable"
        allowScrollButtonsMobile
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
        aria-label="Skill master tabs"
      >
        {allowedTabs.map((tab) => (
          <Tab
            key={tab.key}
            label={tab.label}
            value={tab.key}
            sx={{
              minHeight: 40,
              mr: 2.5,
              px: 0.75,
              typography: 'body2',
              fontWeight: 600,
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
              color: 'text.disabled',
              '&.Mui-selected': {
                color: 'text.primary',
              },
            }}
          />
        ))}
      </Tabs>
    </SettingsPageToolbar>
  );
}
