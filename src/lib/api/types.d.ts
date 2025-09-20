/* eslint-disable @typescript-eslint/no-explicit-any */
// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface User {
  id: number;
  name: string;
  email: string;
  company: Company;
  branch: Branch;
  userType: UserType;
  roles: Role[];
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: number;
  name: string;
  code: string;
  address: string;
  contactEmail: string | null;
  contactPhone: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Branch {
  id: number;
  name: string;
  code?: string;
  location: string;
  contactPhone: string | null;
  company?: Company;
  createdAt: string;
  updatedAt: string;
}

export interface UserType {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  isCompanyLevel: boolean;
  isBranchLevel: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}

export interface Permission {
  id: number;
  name: string;
}

// Pagination Types
export interface PaginationMeta {
  page: number;
  limit: number;
  itemCount: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Query Parameters
export interface QueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  [key: string]: any;
}

// Machine Types
export interface MachineType {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Unit {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Machine {
  id: number;
  name: string;
  status: string;
  specifications: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  capacity: string;
  purchaseDate: string;
  warrantyExpiry: string;
  installationDate: string;
  lastService: string | null;
  nextMaintenanceDue: string | null;
  additionalNotes: string;
  createdAt: string;
  updatedAt: string;
  type: MachineType;
  unit: Unit;
}
