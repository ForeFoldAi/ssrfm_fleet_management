import api from './axios';
import { Material, PaginatedResponse, QueryParams, ExportParams } from './types';

export const materialsApi = {
  /**
   * Get all materials with pagination
   */
  getMaterials: async (
    params: QueryParams = {}
  ): Promise<PaginatedResponse<Material>> => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    Object.entries(params).forEach(([key, value]) => {
      if (
        !['page', 'limit', 'sortBy', 'sortOrder'].includes(key) &&
        value !== undefined
      ) {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const url = `/inventory/materials${queryString ? `?${queryString}` : ''}`;

    const response = await api.get<PaginatedResponse<Material>>(url);
    return response.data;
  },

  /**
   * Create new material
   * @param material Material data
   * @returns Promise with created material
   */
  create: async (material: Partial<Material>): Promise<Material> => {
    const response = await api.post<Material>('/inventory/materials', material);
    return response.data;
  },

  /**
   * Update material
   * @param id Material ID
   * @param material Material data to update
   * @returns Promise with updated material
   */
  update: async (
    id: number,
    material: Partial<Material>
  ): Promise<Material> => {
    const response = await api.patch<Material>(
      `/inventory/materials/${id}`,
      material
    );
    return response.data;
  },

  /**
   * Delete material
   * @param id Material ID
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/inventory/materials/${id}`);
  },

  /**
   * Export materials to Excel file
   * @param params Export parameters (optional) - if no params provided, exports all materials
   * @returns Promise with blob data for Excel file download
   * 
   * Automatically includes proper headers:
   * - Accept: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
   * - Authorization: Bearer token (from localStorage via axios interceptor)
   * 
   * @example
   * ```typescript
   * // Export all materials (no parameters needed)
   * const blob = await materialsApi.exportToExcel();
   * 
   * // Export materials from a specific date range
   * const blob = await materialsApi.exportToExcel({
   *   from: '2024-01-01',
   *   to: '2025-10-10'
   * });
   * 
   * // Create download link
   * const url = window.URL.createObjectURL(blob);
   * const link = document.createElement('a');
   * link.href = url;
   * link.download = 'materials-export.xlsx';
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
    // URL works with or without query parameters - exports all materials if no params provided
    const url = `/inventory/materials/export/xlsx${queryString ? `?${queryString}` : ''}`;

    const response = await api.get(url, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });

    return response.data;
  },
};

export default materialsApi;
