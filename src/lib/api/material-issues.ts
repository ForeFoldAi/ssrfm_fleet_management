import api from './axios';
import {
  Branch,
  MaterialIssue,
  PaginatedResponse,
  QueryParams,
  ExportParams,
} from './types';

export const materialIssuesApi = {
  /**
   * Get all material issues with pagination
   * @param params Query parameters for pagination and sorting
   * @returns Promise with paginated material issues response
   */
  getAll: async (
    params: QueryParams = {}
  ): Promise<PaginatedResponse<MaterialIssue>> => {
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
    const url = `/inventory/material-issues${
      queryString ? `?${queryString}` : ''
    }`;

    const response = await api.get<PaginatedResponse<MaterialIssue>>(url);
    return response.data;
  },

  /**
   * Get material issue by ID
   * @param id Material issue ID
   * @returns Promise with material issue
   */
  getById: async (id: number): Promise<MaterialIssue> => {
    const response = await api.get<MaterialIssue>(
      `/inventory/material-issues/${id}`
    );
    return response.data;
  },

  /**
   * Create new material issue
   * @param materialIssue Material issue data
   * @returns Promise with created material issue
   */
  create: async (
    materialIssue: Partial<MaterialIssue> | FormData
  ): Promise<MaterialIssue> => {
    const headers =
      materialIssue instanceof FormData
        ? { 'Content-Type': 'multipart/form-data' }
        : { 'Content-Type': 'application/json' };

    const response = await api.post<MaterialIssue>(
      '/inventory/material-issues',
      materialIssue,
      { headers }
    );
    return response.data;
  },

  /**
   * Update material issue
   * @param id Material issue ID
   * @param materialIssue Material issue data to update
   * @returns Promise with updated material issue
   */
  update: async (
    id: number,
    materialIssue: Partial<MaterialIssue>
  ): Promise<MaterialIssue> => {
    const response = await api.put<MaterialIssue>(
      `/inventory/material-issues/${id}`,
      materialIssue
    );
    return response.data;
  },

  /**
   * Delete material issue
   * @param id Material issue ID
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/inventory/material-issues/${id}`);
  },

  /**
   * Get image for a specific material issue item
   * @param issueId Material issue ID
   * @param itemId Material issue item ID
   * @returns Promise with image blob
   */
  getItemImage: async (
    issueId: number,
    itemId: number
  ): Promise<{
    url: string;
  }> => {
    const response = await api.get(
      `/inventory/material-issues/${issueId}/items/${itemId}/image`
    );
    return response.data;
  },

  /**
   * Get image URL for a specific material issue item
   * @param issueId Material issue ID
   * @param itemId Material issue item ID
   * @returns Image URL string
   */
  // getItemImageUrl: (issueId: number, itemId: number): string => {
  //   const baseUrl = import.meta.env.VITE_APP_API_BASE_URL || 'https://0ehawyo6gg.execute-api.ap-south-1.amazonaws.com/dev';
  //   return `${baseUrl}/inventory/material-issues/${issueId}/items/${itemId}/image`;
  // },

  /**
   * Export material issues to Excel file
   * @param params Export parameters (optional) - if no params provided, exports all material issues
   * @returns Promise with blob data for Excel file download
   *
   * Automatically includes proper headers:
   * - Accept: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
   * - Authorization: Bearer token (from localStorage via axios interceptor)
   *
   * @example
   * ```typescript
   * // Export all material issues (no parameters needed)
   * const blob = await materialIssuesApi.exportToExcel();
   *
   * // Export material issues from a specific date range
   * const blob = await materialIssuesApi.exportToExcel({
   *   from: '2024-01-01',
   *   to: '2025-10-10'
   * });
   *
   * // Create download link
   * const url = window.URL.createObjectURL(blob);
   * const link = document.createElement('a');
   * link.href = url;
   * link.download = 'material-issues-export.xlsx';
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
      if (!['from', 'to'].includes(key) && value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    // URL works with or without query parameters - exports all material issues if no params provided
    const url = `/inventory/material-issues/export/xlsx${
      queryString ? `?${queryString}` : ''
    }`;

    const response = await api.get(url, {
      responseType: 'blob',
      headers: {
        Accept:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });

    return response.data;
  },
};

export default materialIssuesApi;
