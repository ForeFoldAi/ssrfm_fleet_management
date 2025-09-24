import {
  MachineType,
  MaterialCategory,
  PaginatedResponse,
  QueryParams,
  Unit,
} from './types';
import api from './axios';

/**
 * Get all units with pagination
 */
export const getUnits = async (
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
};

/**
 * Get all machine types with pagination
 */
export const getMachineTypes = async (
  params: QueryParams = {}
): Promise<PaginatedResponse<MachineType>> => {
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
  const url = `/inventory/machine-types${queryString ? `?${queryString}` : ''}`;

  const response = await api.get<PaginatedResponse<Unit>>(url);
  return response.data;
};

/**
 * Get all material categories
 */
export const getMaterialCategories = async (
  params: QueryParams = {}
): Promise<PaginatedResponse<MaterialCategory>> => {
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
  const url = `/inventory/material-categories${
    queryString ? `?${queryString}` : ''
  }`;

  const response = await api.get<PaginatedResponse<MaterialCategory>>(url);
  return response.data;
};
