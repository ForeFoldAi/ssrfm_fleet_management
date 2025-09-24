import api from './axios';
import { Branch, PaginatedResponse, QueryParams } from './types';

export const branchesApi = {
  /**
   * Get all branches with pagination
   * @param params Query parameters for pagination and sorting
   * @returns Promise with paginated branches response
   */
  getAll: async (
    params: QueryParams = {}
  ): Promise<PaginatedResponse<Branch>> => {
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
    const url = `/branches${queryString ? `?${queryString}` : ''}`;

    const response = await api.get<PaginatedResponse<Branch>>(url);
    return response.data;
  },

  /**
   * Get branch by ID
   * @param id Branch ID
   * @returns Promise with branch
   */
  getById: async (id: number): Promise<Branch> => {
    const response = await api.get<Branch>(`/branches/${id}`);
    return response.data;
  },

  /**
   * Get branches by company ID
   * @param companyId Company ID
   * @param params Query parameters for pagination and sorting
   * @returns Promise with paginated branches response
   */
  getByCompanyId: async (
    companyId: number,
    params: QueryParams = {}
  ): Promise<PaginatedResponse<Branch>> => {
    const queryParams = new URLSearchParams();

    // Add pagination and sorting parameters
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    queryParams.append('companyId', companyId.toString());

    const queryString = queryParams.toString();
    const url = `/branches${queryString ? `?${queryString}` : ''}`;

    const response = await api.get<PaginatedResponse<Branch>>(url);
    return response.data;
  },
};

export default branchesApi;
