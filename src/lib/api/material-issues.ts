import api from './axios';
import { Branch, MaterialIssue, PaginatedResponse, QueryParams } from './types';

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
};

export default materialIssuesApi;
