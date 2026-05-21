import { useCallback, useEffect, useState } from 'react';
import { EMPTY_SUPER_ADMIN_STATS } from '@/app/constants';
import {
  deleteOrganization,
  getSuperAdminDashboardStats,
  listDeletedOrganizations,
  listOrganizations,
  restoreOrganization,
} from '@/features/super-admin/api/organizationsApi';

/**
 * Loads and mutates super-admin organization directory data.
 * @param {boolean} enabled
 */
export function useSuperAdminOrganizations(enabled) {
  const [organizations, setOrganizations] = useState([]);
  const [deletedOrganizations, setDeletedOrganizations] = useState([]);
  const [stats, setStats] = useState(EMPTY_SUPER_ADMIN_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const refresh = useCallback(async () => {
    if (!enabled) return;

    setError('');
    setIsLoading(true);
    try {
      const [orgs, deleted, statsResponse] = await Promise.all([
        listOrganizations(),
        listDeletedOrganizations(),
        getSuperAdminDashboardStats(),
      ]);
      setOrganizations(Array.isArray(orgs) ? orgs : []);
      setDeletedOrganizations(Array.isArray(deleted) ? deleted : []);
      if (statsResponse) {
        setStats(statsResponse);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setOrganizations([]);
      setDeletedOrganizations([]);
      setStats(EMPTY_SUPER_ADMIN_STATS);
      setIsLoading(false);
      return;
    }
    refresh();
  }, [enabled, refresh]);

  const handleDelete = useCallback(
    async (id) => {
      setError('');
      try {
        await deleteOrganization(id);
        await refresh();
      } catch (err) {
        setError(err.message);
      }
    },
    [refresh],
  );

  const handleRestore = useCallback(
    async (id) => {
      setError('');
      try {
        await restoreOrganization(id);
        await refresh();
      } catch (err) {
        setError(err.message);
      }
    },
    [refresh],
  );

  const activeCount = organizations.filter((o) => o.status === 'ACTIVE').length;
  const inactiveCount = organizations.filter((o) => o.status === 'INACTIVE').length;

  return {
    organizations,
    deletedOrganizations,
    stats,
    isLoading,
    error,
    search,
    setSearch,
    refresh,
    handleDelete,
    handleRestore,
    activeCount,
    inactiveCount,
  };
}
