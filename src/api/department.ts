/**
 * Departments API Service with SWR Caching
 * Endpoints:
 * - GET /api/v1/departments
 * - GET /api/v1/departments/{id}
 */

import { apiFetch, ApiResponse } from './client';
import { fetchWithCache, TTL } from '../utils/cache';
import { Department, User } from '../types/database';

export interface DepartmentDetail extends Department {
  users?: User[];
  membersCount?: number;
  totalPoints?: number;
}

/**
 * Fetch all corporate departments with member listings & SWR caching
 * GET /api/v1/departments
 */
export async function fetchDepartments(
  onFreshData?: (departments: DepartmentDetail[]) => void
): Promise<{ data: DepartmentDetail[] | null; isCached: boolean; error?: string }> {
  return fetchWithCache<DepartmentDetail[]>(
    'departments_list',
    async () => {
      const res = await apiFetch<DepartmentDetail[]>('/api/v1/departments');
      if (res.success && Array.isArray(res.data)) {
        return {
          success: true,
          data: res.data.map((dept) => ({
            ...dept,
            membersCount: dept.users?.length || 0,
          })),
        };
      }
      return { success: false, message: res.message };
    },
    TTL.USER_PROFILE,
    onFreshData
  );
}

/**
 * Fetch specific department details with employee list by ID
 * GET /api/v1/departments/{id}
 */
export async function fetchDepartmentById(
  departmentId: string | number
): Promise<ApiResponse<DepartmentDetail>> {
  const response = await apiFetch<DepartmentDetail>(`/api/v1/departments/${departmentId}`);
  if (response.success && response.data) {
    return {
      ...response,
      data: {
        ...response.data,
        membersCount: response.data.users?.length || 0,
      },
    };
  }
  return response;
}
