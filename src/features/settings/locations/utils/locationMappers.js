import { generateUuid, isUuid } from '@/shared/utils/uuid';

/**
 * @typedef {Object} LocationFormRow
 * @property {string} id
 * @property {string} name
 * @property {string} code
 * @property {string} addressLine1
 * @property {string} city
 * @property {string} region
 * @property {string} postalCode
 * @property {string} country
 * @property {string} latitude
 * @property {string} longitude
 * @property {boolean} isActive
 * @property {number} sortOrder
 */

/** @returns {LocationFormRow} */
export function createEmptyLocationRow(sortOrder = 0) {
  return {
    id: generateUuid(),
    name: '',
    code: '',
    addressLine1: '',
    city: '',
    region: '',
    postalCode: '',
    country: '',
    latitude: '',
    longitude: '',
    isActive: true,
    sortOrder,
  };
}

/**
 * @param {Array<Record<string, unknown>>} locations
 * @returns {LocationFormRow[]}
 */
export function locationsApiToFormRows(locations) {
  if (!Array.isArray(locations) || locations.length === 0) return [];

  return locations.map((loc, idx) => ({
    id: String(loc.id ?? ''),
    name: loc.name ?? '',
    code: loc.code ?? '',
    addressLine1: loc.addressLine1 ?? '',
    city: loc.city ?? '',
    region: loc.region ?? '',
    postalCode: loc.postalCode ?? '',
    country: loc.country ?? '',
    latitude: loc.latitude != null && loc.latitude !== '' ? String(loc.latitude) : '',
    longitude: loc.longitude != null && loc.longitude !== '' ? String(loc.longitude) : '',
    isActive: loc.isActive !== false,
    sortOrder: loc.sortOrder ?? idx,
  }));
}

/**
 * @param {{ locations: LocationFormRow[] }} formData
 * @returns {string | null} Error message, or null if valid.
 */
export function validateLocationsForm(formData) {
  if (!formData.locations.length) {
    return 'Add at least one location before saving.';
  }

  for (let i = 0; i < formData.locations.length; i += 1) {
    const row = formData.locations[i];
    if (!row.name || !String(row.name).trim()) {
      return `Location name is required (row ${i + 1}). Open the row to complete it.`;
    }
    if (!isUuid(String(row.id || ''))) {
      return `Invalid id on row ${i + 1}`;
    }
  }

  return null;
}

/**
 * @param {{ locations: LocationFormRow[] }} formData
 */
export function locationsFormToPayload(formData) {
  return {
    locations: formData.locations.map((loc, idx) => {
      const latRaw = loc.latitude;
      const lngRaw = loc.longitude;
      const lat = latRaw === '' || latRaw == null ? undefined : Number(latRaw);
      const lng = lngRaw === '' || lngRaw == null ? undefined : Number(lngRaw);

      return {
        id: String(loc.id).trim(),
        name: String(loc.name).trim(),
        code: loc.code?.trim() || undefined,
        addressLine1: loc.addressLine1?.trim() || undefined,
        city: loc.city?.trim() || undefined,
        region: loc.region?.trim() || undefined,
        postalCode: loc.postalCode?.trim() || undefined,
        country: loc.country?.trim() || undefined,
        latitude: Number.isFinite(lat) ? lat : undefined,
        longitude: Number.isFinite(lng) ? lng : undefined,
        isActive: !!loc.isActive,
        sortOrder: idx,
      };
    }),
  };
}

/**
 * @param {unknown} value
 * @returns {string}
 */
export function formatCoordinateCell(value) {
  if (value === '' || value == null || Number.isNaN(Number(value))) return '—';
  return String(value);
}
