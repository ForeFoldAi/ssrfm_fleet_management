import api from './axios';
import { Machine, PaginatedResponse, QueryParams } from './types';

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
    const response = await api.put<Machine>(
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
};

export default machinesApi;
