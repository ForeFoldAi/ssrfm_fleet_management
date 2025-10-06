import api from './axios';
import { MachineType, PaginatedResponse, QueryParams } from './types';

export const machineTypesApi = {
  /**
   * Get all machine types with pagination
   * @param params Query parameters for pagination and sorting
   * @returns Promise with paginated machine types response
   */
  getAll: async (
    params: QueryParams = {}
  ): Promise<PaginatedResponse<MachineType>> => {
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
    const url = `/inventory/machine-types${queryString ? `?${queryString}` : ''}`;

    const response = await api.get<PaginatedResponse<MachineType>>(url);
    return response.data;
  },

  /**
   * Get machine type by ID
   * @param id Machine type ID
   * @returns Promise with machine type
   */
  getById: async (id: number): Promise<MachineType> => {
    const response = await api.get<MachineType>(`/inventory/machine-types/${id}`);
    return response.data;
  },

  /**
   * Create new machine type
   * @param machineType Machine type data
   * @returns Promise with created machine type
   */
  create: async (machineType: { name: string }): Promise<MachineType> => {
    const response = await api.post<MachineType>('/inventory/machine-types', machineType);
    return response.data;
  },

  /**
   * Update machine type
   * @param id Machine type ID
   * @param machineType Machine type data to update
   * @returns Promise with updated machine type
   */
  update: async (id: number, machineType: Partial<MachineType>): Promise<MachineType> => {
    const response = await api.patch<MachineType>(
      `/inventory/machine-types/${id}`,
      machineType
    );
    return response.data;
  },

  /**
   * Delete machine type
   * @param id Machine type ID
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/inventory/machine-types/${id}`);
  },
};

export default machineTypesApi;


