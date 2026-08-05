/**
 * Shared UI primitives.
 *
 * CTA matrix:
 * - Auth / onboarding primary → BrandedButton (login | onboarding)
 * - CRUD Create / Save / Submit → CrudButton intent="create"|"save" (green)
 * - CRUD View → CrudButton intent="view" (blue)
 * - CRUD Edit → CrudButton intent="edit" (orange) or TableRowActions
 * - CRUD Delete → CrudButton intent="delete" (red) or TableRowActions
 * - Approve → Button color="success"; Reject → color="error"
 * - Cancel → Button variant="outlined"
 */
export { BrandedButton } from './BrandedButton';
export { CrudButton } from './CrudButton';
export { HeroBanner } from './HeroBanner';
export { PageCard } from './PageCard';
export { DashboardWidgetCard } from './DashboardWidgetCard';
export { PageHeader } from './PageHeader';
export { StickySaveBar } from './StickySaveBar';
