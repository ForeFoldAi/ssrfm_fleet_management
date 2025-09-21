import api from './axios';
import { PaginatedResponse, QueryParams, Unit } from './types';

// Material types used by MaterialsTab
export interface Material {
  id: number;
  name: string;
  specifications: string;
  unit: string;
  make: string; // Make/Brand instead of category
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  createdAt: string;
  updatedAt: string;
}

export const materialsApi = {
  /**
   * Get all units with pagination
   */
  getUnits: async (
    params: QueryParams = {}
  ): Promise<PaginatedResponse<Unit>> => {
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
    const url = `/inventory/units${queryString ? `?${queryString}` : ''}`;

    const response = await api.get<PaginatedResponse<Unit>>(url);
    return response.data;
  },

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
};

export default materialsApi;
