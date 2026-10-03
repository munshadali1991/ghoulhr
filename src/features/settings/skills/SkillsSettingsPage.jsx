import { useEffect, useState } from 'react';
import { Alert, Box, Skeleton } from '@mui/material';
import { FormStatusAlerts } from '@/shared/components/feedback/FormStatusAlerts';
import { AppSnackbar } from '@/shared/components/feedback/AppSnackbar';
import { useAppSnackbar } from '@/shared/hooks/useAppSnackbar';
import { useTabAccess } from '@/features/auth/hooks/useAuthorization';
import { SKILLS_TAB_DEFS, SKILLS_TABS } from './skillsTabs';
import { useSkillMaster } from './hooks/useSkillMaster';
import { SkillsSettingsToolbar } from './components/SkillsSettingsToolbar';
import { CategoryTab } from './categories/CategoryTab';
import { CategoryFormPage } from './categories/CategoryFormPage';
import { SubcategoryTab } from './subcategories/SubcategoryTab';
import { SubcategoryFormPage } from './subcategories/SubcategoryFormPage';
import { SkillTab } from './skills/SkillTab';
import { SkillFormPage } from './skills/SkillFormPage';

/**
 * @param {{ organizationId: string }} props
 */
export function SkillsSettingsPage({ organizationId }) {
  const { allowedTabs, firstAllowedKey, canWriteTab, isTabAllowed } =
    useTabAccess(SKILLS_TAB_DEFS);
  const [activeTab, setActiveTab] = useState(firstAllowedKey ?? SKILLS_TABS.categories);
  const [formView, setFormView] = useState(null);
  const [filterCategoryId, setFilterCategoryId] = useState('');
  const [filterSubcategoryId, setFilterSubcategoryId] = useState('');
  const { snackbar, show, close } = useAppSnackbar();

  const master = useSkillMaster(organizationId);

  useEffect(() => {
    if (!isTabAllowed(activeTab) && firstAllowedKey) {
      setActiveTab(firstAllowedKey);
    }
  }, [activeTab, firstAllowedKey, isTabAllowed]);

  const canWrite = canWriteTab(SKILLS_TAB_DEFS[0]);

  const closeForm = () => {
    master.clearActionError();
    setFormView(null);
  };

  const handleTabChange = (tab) => {
    closeForm();
    setActiveTab(tab);
  };

  const handleCategoryFilter = (value) => {
    setFilterCategoryId(value);
    setFilterSubcategoryId('');
  };

  const handleAdd = () => {
    if (!canWrite) return;
    master.clearActionError();
    if (activeTab === SKILLS_TABS.categories) {
      setFormView({ type: 'category', record: null });
      return;
    }
    if (activeTab === SKILLS_TABS.subcategories) {
      setFormView({ type: 'subcategory', record: null });
      return;
    }
    setFormView({ type: 'skill', record: null });
  };

  const addDisabled =
    (activeTab === SKILLS_TABS.subcategories && master.categories.length === 0) ||
    (activeTab === SKILLS_TABS.skills && master.subcategories.length === 0);

  if (!allowedTabs.length) {
    return (
      <Alert severity="warning">You do not have permission to view the skills master.</Alert>
    );
  }

  if (master.isLoading && !formView) {
    return (
      <Box>
        <Skeleton variant="text" width={280} height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={320} />
      </Box>
    );
  }

  if (formView?.type === 'category') {
    return (
      <Box>
        <CategoryFormPage
          record={formView.record}
          isSaving={master.isSaving}
          actionError={master.actionError}
          onClearActionError={master.clearActionError}
          onBack={closeForm}
          onSave={async (values, id) => {
            await master.saveCategory(values, id);
            show(id ? 'Category updated' : 'Category created');
          }}
          readOnly={!canWrite}
        />
        <AppSnackbar snackbar={snackbar} onClose={close} />
      </Box>
    );
  }

  if (formView?.type === 'subcategory') {
    return (
      <Box>
        <SubcategoryFormPage
          record={formView.record}
          categories={master.categories}
          defaultCategoryId={filterCategoryId}
          isSaving={master.isSaving}
          actionError={master.actionError}
          onClearActionError={master.clearActionError}
          onBack={closeForm}
          onSave={async (values, id) => {
            await master.saveSubcategory(values, id);
            show(id ? 'Subcategory updated' : 'Subcategory created');
          }}
          readOnly={!canWrite}
        />
        <AppSnackbar snackbar={snackbar} onClose={close} />
      </Box>
    );
  }

  if (formView?.type === 'skill') {
    return (
      <Box>
        <SkillFormPage
          record={formView.record}
          categories={master.categories}
          subcategories={master.subcategories}
          defaultCategoryId={filterCategoryId}
          defaultSubcategoryId={filterSubcategoryId}
          isSaving={master.isSaving}
          actionError={master.actionError}
          onClearActionError={master.clearActionError}
          onBack={closeForm}
          onSave={async (values, id) => {
            await master.saveSkill(values, id);
            show(id ? 'Skill updated' : 'Skill created');
          }}
          readOnly={!canWrite}
        />
        <AppSnackbar snackbar={snackbar} onClose={close} />
      </Box>
    );
  }

  return (
    <Box data-testid="settings-skills-page">
      <FormStatusAlerts
        loadError={master.error}
        loadErrorMessage="Failed to load skills master."
      />

      <SkillsSettingsToolbar
        activeTab={activeTab}
        allowedTabs={allowedTabs}
        onTabChange={handleTabChange}
        onAdd={handleAdd}
        canWrite={canWrite}
        addDisabled={addDisabled}
      />

      <Box sx={{ mt: 2.5 }}>
        {activeTab === SKILLS_TABS.categories ? (
          <CategoryTab
            categories={master.categories}
            isLoading={master.isLoading}
            isSaving={master.isSaving}
            actionError={master.actionError}
            onClearActionError={master.clearActionError}
            onEdit={
              canWrite
                ? (row) => {
                    master.clearActionError();
                    setFormView({ type: 'category', record: row });
                  }
                : undefined
            }
            onDelete={canWrite ? master.removeCategory : undefined}
            readOnly={!canWrite}
          />
        ) : null}

        {activeTab === SKILLS_TABS.subcategories ? (
          <SubcategoryTab
            categories={master.categories}
            subcategories={master.subcategories}
            categoryId={filterCategoryId}
            onCategoryIdChange={handleCategoryFilter}
            isLoading={master.isLoading}
            isSaving={master.isSaving}
            actionError={master.actionError}
            onClearActionError={master.clearActionError}
            onEdit={
              canWrite
                ? (row) => {
                    master.clearActionError();
                    setFormView({ type: 'subcategory', record: row });
                  }
                : undefined
            }
            onDelete={canWrite ? master.removeSubcategory : undefined}
            readOnly={!canWrite}
          />
        ) : null}

        {activeTab === SKILLS_TABS.skills ? (
          <SkillTab
            categories={master.categories}
            subcategories={master.subcategories}
            skills={master.skills}
            categoryId={filterCategoryId}
            subcategoryId={filterSubcategoryId}
            onCategoryIdChange={handleCategoryFilter}
            onSubcategoryIdChange={setFilterSubcategoryId}
            isLoading={master.isLoading}
            isSaving={master.isSaving}
            actionError={master.actionError}
            onClearActionError={master.clearActionError}
            onEdit={
              canWrite
                ? (row) => {
                    master.clearActionError();
                    setFormView({ type: 'skill', record: row });
                  }
                : undefined
            }
            onDelete={canWrite ? master.removeSkill : undefined}
            readOnly={!canWrite}
          />
        ) : null}
      </Box>

      <AppSnackbar snackbar={snackbar} onClose={close} />
    </Box>
  );
}
