import api from './axios';
import { Machine, PaginatedResponse, QueryParams, ExportParams } from './types';

export const machinesApi = {
  /**
   * Get all machines with pagination
   * @param params Query parameters for pagination and sorting
   * @returns Promise with paginated machines response
   */
  getAll: async (
    params: QueryParams = {}
  ): Promise<PaginatedResponse<Machine>> => {
    const queryParams = new URLSearchParams();

    // Add pagination and sorting parameters
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    // Add any additional filter parameters
    Object.entries(params).forEach(([key, value]) => {
      if (
        !['page', 'limit', 'sortBy', 'sortOrder'].includes(key) &&
        value !== undefined
      ) {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const url = `/inventory/machines${queryString ? `?${queryString}` : ''}`;

    const response = await api.get<PaginatedResponse<Machine>>(url);
    return response.data;
  },

  /**
   * Get machine by ID
   * @param id Machine ID
   * @returns Promise with machine
   */
  getById: async (id: number): Promise<Machine> => {
    const response = await api.get<Machine>(`/inventory/machines/${id}`);
    return response.data;
  },

  /**
   * Create new machine
   * @param machine Machine data
   * @returns Promise with created machine
   */
  create: async (machine: Partial<Machine>): Promise<Machine> => {
    const response = await api.post<Machine>('/inventory/machines', machine);
    return response.data;
  },

  /**
   * Update machine
   * @param id Machine ID
   * @param machine Machine data to update
   * @returns Promise with updated machine
   */
  update: async (id: number, machine: Partial<Machine>): Promise<Machine> => {
    const response = await api.patch<Machine>(
      `/inventory/machines/${id}`,
      machine
    );
    return response.data;
  },

  /**
   * Delete machine
   * @param id Machine ID
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/inventory/machines/${id}`);
  },

  /**
   * Export machines to Excel file
   * @param params Export parameters (optional) - if no params provided, exports all machines
   * @returns Promise with blob data for Excel file download
   * 
   * Automatically includes proper headers:
   * - Accept: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
   * - Authorization: Bearer token (from localStorage via axios interceptor)
   * 
   * @example
   * ```typescript
   * // Export all machines (no parameters needed)
   * const blob = await machinesApi.exportToExcel();
   * 
   * // Export machines from a specific date range
   * const blob = await machinesApi.exportToExcel({
   *   from: '2024-01-01',
   *   to: '2025-10-10'
   * });
   * 
   * // Create download link
   * const url = window.URL.createObjectURL(blob);
   * const link = document.createElement('a');
   * link.href = url;
   * link.download = 'machines-export.xlsx';
   * link.click();
   * window.URL.revokeObjectURL(url);
   * ```
   */
  exportToExcel: async (params: ExportParams = {}): Promise<Blob> => {
    const queryParams = new URLSearchParams();

    // Add export parameters (all optional)
    if (params.from) queryParams.append('from', params.from);
    if (params.to) queryParams.append('to', params.to);

    // Add any additional filter parameters
    Object.entries(params).forEach(([key, value]) => {
      if (
        !['from', 'to'].includes(key) &&
        value !== undefined
      ) {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    // URL works with or without query parameters - exports all machines if no params provided
    const url = `/inventory/machines/export/xlsx${queryString ? `?${queryString}` : ''}`;

    const response = await api.get(url, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });

    return response.data;
  },
};

export default machinesApi;
