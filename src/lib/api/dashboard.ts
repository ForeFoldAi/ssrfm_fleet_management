import api from './axios';
import { Branch, Material, Machine } from './types';

// Dashboard Types
export interface DashboardStats {
  totalExpenses: number;
  pendingApprovals: number;
  totalBranches: number;
  totalMaterials: number;
  totalMachines: number;
}

export interface BranchExpenseData {
  branchId: number;
  branchName: string;
  branchCode: string;
  totalExpenses: number;
  materialExpenses: number;
  machineExpenses: number;
  pendingApprovals: number;
}

export interface MaterialExpenseData {
  materialId: number;
  materialName: string;
  specifications: string;
  makerBrand: string;
  totalExpenses: number;
  branchExpenses: { [branchId: number]: number };
}

export interface MachineExpenseData {
  machineId: number;
  machineName: string;
  specifications: string;
  manufacturer: string;
  totalExpenses: number;
  branchExpenses: { [branchId: number]: number };
}

export interface DashboardData {
  stats: DashboardStats;
  branchExpenses: BranchExpenseData[];
  materialExpenses: MaterialExpenseData[];
  machineExpenses: MachineExpenseData[];
  timePeriod: string;
  periodStart: string;
  periodEnd: string;
}

export interface DashboardQueryParams {
  period?: '1m' | '3m' | '6m' | '1y';
  branchId?: number;
  startDate?: string;
  endDate?: string;
}

export const dashboardApi = {
  /**
   * Get dashboard data for company owner
   */
  getDashboardData: async (params: DashboardQueryParams = {}): Promise<DashboardData> => {
    const queryParams = new URLSearchParams();

    if (params.period) queryParams.append('period', params.period);
    if (params.branchId) queryParams.append('branchId', params.branchId.toString());
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

    const queryString = queryParams.toString();
    const url = `/dashboard/company-owner${queryString ? `?${queryString}` : ''}`;

    const response = await api.get<DashboardData>(url);
    return response.data;
  },

  /**
   * Get pending approvals count
   */
  getPendingApprovals: async (): Promise<{ count: number; items: any[] }> => {
    const response = await api.get('/dashboard/pending-approvals');
    return response.data;
  },

  /**
   * Get expenses by branch
   */
  getBranchExpenses: async (params: DashboardQueryParams = {}): Promise<BranchExpenseData[]> => {
    const queryParams = new URLSearchParams();

    if (params.period) queryParams.append('period', params.period);
    if (params.branchId) queryParams.append('branchId', params.branchId.toString());
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

    const queryString = queryParams.toString();
    const url = `/dashboard/branch-expenses${queryString ? `?${queryString}` : ''}`;

    const response = await api.get<BranchExpenseData[]>(url);
    return response.data;
  },

  /**
   * Get material expenses breakdown
   */
  getMaterialExpenses: async (params: DashboardQueryParams = {}): Promise<MaterialExpenseData[]> => {
    const queryParams = new URLSearchParams();

    if (params.period) queryParams.append('period', params.period);
    if (params.branchId) queryParams.append('branchId', params.branchId.toString());
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

    const queryString = queryParams.toString();
    const url = `/dashboard/material-expenses${queryString ? `?${queryString}` : ''}`;

    const response = await api.get<MaterialExpenseData[]>(url);
    return response.data;
  },

  /**
   * Get machine expenses breakdown
   */
  getMachineExpenses: async (params: DashboardQueryParams = {}): Promise<MachineExpenseData[]> => {
    const queryParams = new URLSearchParams();

    if (params.period) queryParams.append('period', params.period);
    if (params.branchId) queryParams.append('branchId', params.branchId.toString());
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

    const queryString = queryParams.toString();
    const url = `/dashboard/machine-expenses${queryString ? `?${queryString}` : ''}`;

    const response = await api.get<MachineExpenseData[]>(url);
    return response.data;
  },

  /**
   * Get weighted average price for materials
   * Formula: Weighted Avg price = (Qty1 * Price1 + Qty2 * Price2 + Qty3 * Price3) / Total Qty
   */
  getWeightedAveragePrices: async (params: DashboardQueryParams = {}): Promise<{
    materialId: number;
    materialName: string;
    weightedAveragePrice: number;
    totalQuantity: number;
    totalValue: number;
  }[]> => {
    const queryParams = new URLSearchParams();

    if (params.period) queryParams.append('period', params.period);
    if (params.branchId) queryParams.append('branchId', params.branchId.toString());
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

    const queryString = queryParams.toString();
    const url = `/dashboard/weighted-average-prices${queryString ? `?${queryString}` : ''}`;

    const response = await api.get(url);
    return response.data;
  }
};

export default dashboardApi;