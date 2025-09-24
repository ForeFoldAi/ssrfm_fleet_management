import api from './axios';
import { 
  PaginatedResponse, 
  QueryParams, 
  MaterialPurchase,
  CreateMaterialPurchaseRequest,
  ReceiveMaterialPurchaseItemRequest,
  ReceiveMaterialPurchaseItemResponse
} from './types';

export enum MaterialPurchaseStatus {
  PENDING = 'pending',
  PARTIALLY_RECEIVED = 'partially_received',
  FULLY_RECEIVED = 'fully_received',
  CLOSED = 'closed',
}

export const materialPurchasesApi = {
  /**
   * Get all material purchases with pagination
   */
  getAll: async (
    params: QueryParams = {}
  ): Promise<PaginatedResponse<MaterialPurchase>> => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params.status) queryParams.append('status', params.status);

    Object.entries(params).forEach(([key, value]) => {
      if (
        !['page', 'limit', 'sortBy', 'sortOrder', 'status'].includes(key) &&
        value !== undefined
      ) {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const url = `/inventory/material-purchases${
      queryString ? `?${queryString}` : ''
    }`;

    const response = await api.get<PaginatedResponse<MaterialPurchase>>(url);
    return response.data;
  },

  /**
   * Get a material purchase by ID
   */
  getById: async (id: number): Promise<MaterialPurchase> => {
    const response = await api.get<MaterialPurchase>(
      `/inventory/material-purchases/${id}`
    );
    return response.data;
  },

  /**
   * Create a new material purchase
   */
  create: async (data: CreateMaterialPurchaseRequest): Promise<MaterialPurchase> => {
    const response = await api.post<MaterialPurchase>(
      '/inventory/material-purchases',
      data
    );
    return response.data;
  },

  /**
   * Update a material purchase
   */
  update: async (
    id: number,
    data: Partial<CreateMaterialPurchaseRequest>
  ): Promise<MaterialPurchase> => {
    const response = await api.put<MaterialPurchase>(
      `/inventory/material-purchases/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Delete a material purchase
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/inventory/material-purchases/${id}`);
  },

  /**
   * Receive material purchase item
   */
  receiveItem: async (
    purchaseId: number,
    itemId: number,
    data: ReceiveMaterialPurchaseItemRequest
  ): Promise<ReceiveMaterialPurchaseItemResponse> => {
    const response = await api.post<ReceiveMaterialPurchaseItemResponse>(
      `/inventory/material-purchases/${purchaseId}/items/${itemId}/receive`,
      data
    );
    return response.data;
  },

  /**
   * Close a material purchase (mark as fully received)
   */
  close: async (id: number): Promise<MaterialPurchase> => {
    const response = await api.post<MaterialPurchase>(
      `/inventory/material-purchases/${id}/close`
    );
    return response.data;
  },
};

export default materialPurchasesApi;