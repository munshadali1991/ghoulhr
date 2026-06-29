import { apiFetch } from '@/shared/api/httpClient';

/**
 * @returns {Promise<{
 *   stats: {
 *     totalEmployees?: number;
 *     presentToday?: number;
 *     pendingPayroll?: number;
 *     activeDepartments?: number;
 *   };
 *   recentActivity?: Array<{
 *     id: string;
 *     action: string;
 *     message: string;
 *     actorName: string;
 *     createdAt: string;
 *   }>;
 * }>}
 */
export async function fetchHrDashboard() {
  return apiFetch('/dashboard/hr');
}
