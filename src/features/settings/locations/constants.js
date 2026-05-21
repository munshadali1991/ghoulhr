export const LOCATIONS_SUCCESS_MESSAGE_MS = 3000;

export const LOCATION_TABLE_COLUMNS = [
  { key: 'index', label: '#', align: 'left' },
  { key: 'name', label: 'Name', align: 'left' },
  { key: 'code', label: 'Code', align: 'left' },
  { key: 'country', label: 'Country', align: 'left' },
  { key: 'region', label: 'State', align: 'left' },
  { key: 'city', label: 'City', align: 'left' },
  { key: 'postalCode', label: 'Postal', align: 'left' },
  { key: 'addressLine1', label: 'Street', align: 'left' },
  { key: 'latitude', label: 'Lat', align: 'right' },
  { key: 'longitude', label: 'Lng', align: 'right' },
  { key: 'isActive', label: 'Active', align: 'center' },
  { key: 'actions', label: 'Actions', align: 'right', nowrap: true },
];

export const LOCATION_TABLE_HEADER_CELL_SX = {
  fontWeight: 700,
  bgcolor: 'background.paper',
  zIndex: 3,
};

export const LOCATION_TABLE_CONTAINER_SX = {
  borderRadius: 2,
  maxHeight: { xs: 420, sm: 520 },
  overflow: 'auto',
};
