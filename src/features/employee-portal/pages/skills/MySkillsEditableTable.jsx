import {
  Box,
  Button,
  Chip,
  FormControl,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { CrudButton } from '@/shared/components/ui/CrudButton';
import { TableRowActions } from '@/shared/components/data/TableRowActions';
import { proficiencyLabel, SKILL_PROFICIENCY, SKILL_PROFICIENCY_OPTIONS } from '../../constants/skillEnums';

function proficiencyColor(value) {
  if (value === SKILL_PROFICIENCY.EXPERT) return 'secondary';
  if (value === SKILL_PROFICIENCY.GOOD) return 'success';
  return 'default';
}

function categoryOf(catalog, categoryId) {
  return catalog.find((category) => category.id === categoryId);
}

function subcategoryOf(category, subcategoryId) {
  return category?.subcategories?.find((row) => row.id === subcategoryId);
}

function CompactSelect({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  error,
  'aria-label': ariaLabel,
}) {
  return (
    <FormControl fullWidth size="small" error={error} disabled={disabled}>
      <Select
        displayEmpty
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        inputProps={{ 'aria-label': ariaLabel }}
        renderValue={(selected) => {
          if (!selected) {
            return (
              <Typography variant="body2" color="text.secondary">
                {placeholder}
              </Typography>
            );
          }
          return options.find((option) => option.id === selected)?.name ?? selected;
        }}
      >
        <MenuItem value="">
          <em>{placeholder}</em>
        </MenuItem>
        {options.map((option) => (
          <MenuItem key={option.id} value={option.id}>
            {option.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function DisplayCell({ children, strong = false }) {
  return (
    <Typography variant="body2" fontWeight={strong ? 600 : 400}>
      {children || '—'}
    </Typography>
  );
}

export function MySkillsEditableTable({
  rows,
  catalog,
  canWrite,
  isSaving,
  isDirty,
  fieldErrors = {},
  duplicateSkillIds: duplicateIds = new Set(),
  onChange,
  onAdd,
  onStartEdit,
  onRemoveRow,
  onSave,
  onDiscard,
}) {
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, overflowX: 'auto' }}>
      <Table size="medium" aria-label="My skills" sx={{ minWidth: 880 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600, width: 64 }}>S.No</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Skill</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Subcategory</TableCell>
            <TableCell sx={{ fontWeight: 600, width: 140 }}>Experience</TableCell>
            <TableCell sx={{ fontWeight: 600, width: 160 }}>Knowledge</TableCell>
            {canWrite ? (
              <TableCell align="right" sx={{ fontWeight: 600, width: 112 }}>
                Actions
              </TableCell>
            ) : null}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={canWrite ? 7 : 6}>
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  {canWrite
                    ? 'No skills yet. Use Add skill to insert a row.'
                    : 'No skills added yet.'}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, index) => {
              const editing = canWrite && row.isEditing;
              const errors = fieldErrors[row.localId] || {};
              const category = categoryOf(catalog, row.categoryId);
              const subcategory = subcategoryOf(category, row.subcategoryId);
              const taken = new Set(
                rows
                  .filter((other) => other.localId !== row.localId && other.skillId)
                  .map((other) => other.skillId),
              );
              const skillOptions = (subcategory?.skills ?? []).filter(
                (skill) => !taken.has(skill.id) || skill.id === row.skillId,
              );
              const skillError = Boolean(errors.skillId) || duplicateIds.has(row.skillId);

              return (
                <TableRow key={row.localId} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell sx={{ minWidth: 160 }}>
                    {editing && row.isDraft ? (
                      <CompactSelect
                        aria-label={`Skill ${index + 1}`}
                        value={row.skillId}
                        placeholder="Skill"
                        disabled={!row.subcategoryId}
                        error={skillError}
                        options={skillOptions}
                        onChange={(skillId) => {
                          const skill = skillOptions.find((item) => item.id === skillId);
                          onChange(row.localId, {
                            skillId,
                            skillName: skill?.name ?? '',
                          });
                        }}
                      />
                    ) : (
                      <DisplayCell strong>{row.skillName}</DisplayCell>
                    )}
                  </TableCell>
                  <TableCell sx={{ minWidth: 170 }}>
                    {editing && row.isDraft ? (
                      <CompactSelect
                        aria-label={`Category ${index + 1}`}
                        value={row.categoryId}
                        placeholder="Category"
                        error={Boolean(errors.categoryId)}
                        options={catalog.map((item) => ({ id: item.id, name: item.name }))}
                        onChange={(categoryId) => onChange(row.localId, { categoryId })}
                      />
                    ) : (
                      <DisplayCell>{row.categoryName}</DisplayCell>
                    )}
                  </TableCell>
                  <TableCell sx={{ minWidth: 170 }}>
                    {editing && row.isDraft ? (
                      <CompactSelect
                        aria-label={`Subcategory ${index + 1}`}
                        value={row.subcategoryId}
                        placeholder="Subcategory"
                        disabled={!row.categoryId}
                        error={Boolean(errors.subcategoryId)}
                        options={(category?.subcategories ?? []).map((item) => ({
                          id: item.id,
                          name: item.name,
                        }))}
                        onChange={(subcategoryId) => onChange(row.localId, { subcategoryId })}
                      />
                    ) : (
                      <DisplayCell>{row.subcategoryName}</DisplayCell>
                    )}
                  </TableCell>
                  <TableCell>
                    {editing ? (
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        value={row.experienceMonths}
                        onChange={(event) =>
                          onChange(row.localId, { experienceMonths: event.target.value })
                        }
                        inputProps={{ min: 0, max: 720, step: 1, 'aria-label': `Experience ${index + 1}` }}
                        error={Boolean(errors.experienceMonths)}
                        helperText={errors.experienceMonths}
                      />
                    ) : (
                      <DisplayCell>
                        {row.experienceMonths === '' || row.experienceMonths == null
                          ? ''
                          : `${row.experienceMonths} mo`}
                      </DisplayCell>
                    )}
                  </TableCell>
                  <TableCell>
                    {editing ? (
                      <FormControl fullWidth size="small" error={Boolean(errors.proficiency)}>
                        <Select
                          displayEmpty
                          value={row.proficiency || ''}
                          onChange={(event) =>
                            onChange(row.localId, { proficiency: event.target.value })
                          }
                          inputProps={{ 'aria-label': `Knowledge ${index + 1}` }}
                          renderValue={(selected) => {
                            if (!selected) {
                              return (
                                <Typography variant="body2" color="text.secondary">
                                  Knowledge
                                </Typography>
                              );
                            }
                            return proficiencyLabel(selected);
                          }}
                        >
                          <MenuItem value="">
                            <em>Knowledge</em>
                          </MenuItem>
                          {SKILL_PROFICIENCY_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : row.proficiency ? (
                      <Chip
                        size="small"
                        label={proficiencyLabel(row.proficiency)}
                        color={proficiencyColor(row.proficiency)}
                        variant={
                          row.proficiency === SKILL_PROFICIENCY.BEGINNER ? 'outlined' : 'filled'
                        }
                      />
                    ) : (
                      <DisplayCell />
                    )}
                  </TableCell>
                  {canWrite ? (
                    <TableCell align="right" className="table-actions-cell">
                      <TableRowActions
                        onEdit={
                          !row.isEditing && !row.isDraft ? () => onStartEdit(row.localId) : undefined
                        }
                        onDelete={() => onRemoveRow(row)}
                        disabled={isSaving}
                        deleteLabel={row.isDraft ? 'Remove row' : 'Remove'}
                      />
                    </TableCell>
                  ) : null}
                </TableRow>
              );
            })
          )}
        </TableBody>
        {canWrite ? (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={7} sx={{ borderBottom: 0 }}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  alignItems={{ xs: 'stretch', sm: 'center' }}
                  justifyContent="flex-start"
                  sx={{ py: 0.5 }}
                >
                  <CrudButton
                    intent="create"
                    startIcon={<AddIcon />}
                    onClick={onAdd}
                    disabled={isSaving}
                  >
                    Add skill
                  </CrudButton>
                  <Box sx={{ flex: { sm: 1 } }} />
                  <Button variant="outlined" onClick={onDiscard} disabled={isSaving || !isDirty}>
                    Discard
                  </Button>
                  <CrudButton intent="save" onClick={onSave} disabled={isSaving || !isDirty}>
                    {isSaving ? 'Saving…' : 'Save'}
                  </CrudButton>
                </Stack>
              </TableCell>
            </TableRow>
          </TableFooter>
        ) : null}
      </Table>
    </TableContainer>
  );
}
