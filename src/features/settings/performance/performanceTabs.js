export const PERFORMANCE_TABS = {
  builder: 'builder',
  rating: 'rating',
  preview: 'preview',
};

export const PERFORMANCE_TAB_DEFS = [
  { key: PERFORMANCE_TABS.builder, label: 'Form builder' },
  { key: PERFORMANCE_TABS.rating, label: 'Rating scale' },
  { key: PERFORMANCE_TABS.preview, label: 'Preview by role' },
];

export function resolveActiveTab(tabParam) {
  return PERFORMANCE_TAB_DEFS.some((tab) => tab.key === tabParam)
    ? tabParam
    : PERFORMANCE_TABS.builder;
}
