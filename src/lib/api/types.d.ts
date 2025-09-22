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
  type?: MachineType;
  unit?: Unit;
  branch: Branch;
  typeId?: number;
  unitId?: number;
}

export interface MaterialCategory {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// Material types used by MaterialsTab
export interface Material {
  id: number;
  name: string;
  specifications: string;
  unit?: string;
  unitId?: number;
  categoryId?: number;
  measureUnitId?: number;
  makerBrand: string; // Make/Brand instead of category
  currentStock: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  additionalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialIssueItem {
  id: number;
  issuedQuantity: number;
  stockBeforeIssue: number;
  stockAfterIssue: number;
  receiverName: string;
  imagePath?: string;
  purpose: string;
  createdAt: string;
  updatedAt: string;
  material: Material;
  branch: Branch;
}

export interface MaterialIssue {
  id: number;
  uniqueId: string;
  issuedBy: User;
  issueDate: string;
  additionalNotes?: string;
  createdAt: string;
  updatedAt: string;
  items: MaterialIssueItem[];
  branch: Branch;
}

export interface VendorQuotation {
  id: number;
  vendorName: string;
  contactPerson: string;
  phone: string;
  quotationAmount: string;
  filePaths: string[];
  notes: string;
  isSelected: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialPurchase {
  id: number;
  uniqueId: string;
  orderDate: string;
  totalValue: string;
  purchaseOrderNumber: string;
  additionalNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialIndentItem {
  id: number;
  specifications: string;
  currentStock: number;
  requestedQuantity: number;
  notes: string;
  imagePaths: string[];
  createdAt: string;
  updatedAt: string;
  material: Material;
  machine: Machine;
  quotations: VendorQuotation[];
  selectedQuotation?: VendorQuotation;
}

export interface MaterialIndent {
  id: number;
  uniqueId: string;
  requestDate: string;
  status: string;
  approvalDate?: string;
  rejectionReason?: string;
  additionalNotes?: string;
  createdAt: string;
  updatedAt: string;
  requestedBy: User;
  approvedBy?: User;
  branch: Branch;
  items: MaterialIndentItem[];
  purchases: MaterialPurchase[];
}

// Create Material Indent payloads (for FormData JSON fields)
export interface CreateVendorQuotationInput {
  vendorName: string;
  contactPerson?: string;
  phone?: string;
  imageCount?: number; // number of files appended under quotationFiles for this quotation
  quotationAmount: number | string;
  notes?: string;
}

export interface CreateMaterialIndentItemInput {
  materialId: number;
  specifications?: string;
  requestedQuantity: number;
  machineId?: number;
  itemImageCount?: number; // number of files appended under itemFiles for this item
  vendorQuotations?: CreateVendorQuotationInput[];
  notes?: string;
}

export interface CreateMaterialIndentRequest {
  additionalNotes?: string;
  items: CreateMaterialIndentItemInput[];
  status?: string; // e.g., pending_approval
}
