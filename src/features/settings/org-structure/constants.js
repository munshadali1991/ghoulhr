export const ORG_TABLE_HEADER_CELL_SX = {
  fontWeight: 700,
  bgcolor: 'background.paper',
  zIndex: 3,
};

export const ORG_TABLE_CONTAINER_SX = {
  borderRadius: 2,
  maxHeight: { xs: 420, sm: 520 },
  overflow: 'auto',
};

export const DEPARTMENT_TABLE_COLUMNS = [
  { key: 'index', label: '#', align: 'left' },
  { key: 'name', label: 'Name', align: 'left' },
  { key: 'description', label: 'Description', align: 'left' },
  { key: 'isActive', label: 'Active', align: 'center' },
  { key: 'actions', label: 'Actions', align: 'right', nowrap: true },
];

export const DESIGNATION_TABLE_COLUMNS = [
  { key: 'index', label: '#', align: 'left' },
  { key: 'name', label: 'Name', align: 'left' },
  { key: 'departments', label: 'Departments', align: 'left' },
  { key: 'isActive', label: 'Active', align: 'center' },
  { key: 'actions', label: 'Actions', align: 'right', nowrap: true },
];
