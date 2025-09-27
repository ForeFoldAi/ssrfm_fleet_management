import api from './axios';
import {
  ApproveRejectMaterialIndentRequest,
  PaginatedResponse,
  QueryParams,
} from './types';
import { MaterialIndent } from './types';

export enum IndentStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REVERTED = 'reverted',
  ORDERED = 'ordered',
  PARTIALLY_RECEIVED = 'partially_received',
  FULLY_RECEIVED = 'fully_received',
  CLOSED = 'closed',
}

export const materialIndentsApi = {
  /**
   * Get all material indents with pagination
   */
  getAll: async (
    params: QueryParams = {}
  ): Promise<PaginatedResponse<MaterialIndent>> => {
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
    const url = `/inventory/material-indents${
      queryString ? `?${queryString}` : ''
    }`;

    const response = await api.get<PaginatedResponse<MaterialIndent>>(url);
    return response.data;
  },

  /**
   * Get a material indent by ID
   */
  getById: async (id: number): Promise<MaterialIndent> => {
    const response = await api.get<MaterialIndent>(
      `/inventory/material-indents/${id}`
    );
    return response.data;
  },

  /**
   * Create a new material indent
   */
  create: async (
    materialIndent: FormData | Partial<MaterialIndent>
  ): Promise<MaterialIndent> => {
    const headers =
      materialIndent instanceof FormData
        ? { 'Content-Type': 'multipart/form-data' }
        : { 'Content-Type': 'application/json' };

    const response = await api.post<MaterialIndent>(
      '/inventory/material-indents',
      materialIndent,
      { headers }
    );
    return response.data;
  },

  /**
   * Update a material indent
   */
  update: async (
    id: number,
    materialIndent: Partial<MaterialIndent>
  ): Promise<MaterialIndent> => {
    const response = await api.put<MaterialIndent>(
      `/inventory/material-indents/${id}`,
      materialIndent
    );
    return response.data;
  },

  /**
   * Delete a material indent
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/inventory/material-indents/${id}`);
  },

  /**
   * Approve a material indent
   */
  approve: async (
    id: number,
    payload: ApproveRejectMaterialIndentRequest
  ): Promise<MaterialIndent> => {
    const response = await api.post<MaterialIndent>(
      `/inventory/material-indents/${id}/approve`,
      payload
    );
    return response.data;
  },

  /**
   * Reject a material indent
   */
  reject: async (
    id: number,
    rejectionReason: string
  ): Promise<MaterialIndent> => {
    const response = await api.post<MaterialIndent>(
      `/inventory/material-indents/${id}/reject`,
      {
        rejectionReason,
      }
    );
    return response.data;
  },

  /**
   * Revert a material indent
   */
  revert: async (
    id: number,
    revertReason: string
  ): Promise<MaterialIndent> => {
    const response = await api.post<MaterialIndent>(
      `/inventory/material-indents/${id}/revert`,
      {
        revertReason,
      }
    );
    return response.data;
  },

  /**
   * Get last five material indents
   */
  getLastFive: async (materialId?: number): Promise<MaterialIndent[]> => {
    const response = await api.get<MaterialIndent[]>(
      `/inventory/material-indents/last-five/${materialId}`
    );
    return response.data;
  },
  /**
   * Get presigned URLs for an indent item's images
   */
  getItemImageUrls: async (
    indentId: number,
    itemId: number
  ): Promise<string[]> => {
    const response = await api.get<{ urls: string[] }>(
      `/inventory/material-indents/${indentId}/items/${itemId}/image`
    );
    return response.data.urls || [];
  },

  /**
   * Get presigned URLs for an indent item's vendor quotation images
   */
  getItemQuotationImageUrls: async (
    indentId: number,
    itemId: number
  ): Promise<string[]> => {
    const response = await api.get<{ urls: string[] }>(
      `/inventory/material-indents/${indentId}/items/${itemId}/quotation`
    );
    return response.data.urls || [];
  },
};

export default materialIndentsApi;
