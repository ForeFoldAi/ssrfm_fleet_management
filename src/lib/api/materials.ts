import api from './axios';
import { Material, PaginatedResponse, QueryParams } from './types';

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
    const response = await api.put<Material>(
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
};

export default materialsApi;
