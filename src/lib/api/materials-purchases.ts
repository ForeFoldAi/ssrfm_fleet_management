import api from './axios';
import { 
  PaginatedResponse, 
  QueryParams, 
  MaterialPurchase,
  CreateMaterialPurchaseRequest,
  ReceiveMaterialPurchaseItemRequest,
  ReceiveMaterialPurchaseItemResponse,
  ExportParams
} from './types';

export enum MaterialPurchaseStatus {
  PENDING = 'pending',
  PARTIALLY_RECEIVED = 'partially_received',
  FULLY_RECEIVED = 'fully_received',
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
   * Export material purchases to Excel file
   * @param params Export parameters (optional) - if no params provided, exports all material purchases
   * @returns Promise with blob data for Excel file download
   * 
   * Automatically includes proper headers:
   * - Accept: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
   * - Authorization: Bearer token (from localStorage via axios interceptor)
   * 
   * @example
   * ```typescript
   * // Export all material purchases (no parameters needed)
   * const blob = await materialPurchasesApi.exportToExcel();
   * 
   * // Export material purchases from a specific date range
   * const blob = await materialPurchasesApi.exportToExcel({
   *   from: '2024-01-01',
   *   to: '2025-10-10'
   * });
   * 
   * // Create download link
   * const url = window.URL.createObjectURL(blob);
   * const link = document.createElement('a');
   * link.href = url;
   * link.download = 'material-purchases-export.xlsx';
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
    // URL works with or without query parameters - exports all material purchases if no params provided
    const url = `/inventory/material-purchases/export/xlsx${queryString ? `?${queryString}` : ''}`;

    const response = await api.get(url, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });

    return response.data;
  },

};

export default materialPurchasesApi;