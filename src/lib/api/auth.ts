/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './axios';
import { LoginCredentials, AuthResponse, User } from './types';
import { jwtDecode } from 'jwt-decode';

export const authService = {
  /**
   * Login user with email and password
   * @param credentials User credentials
   * @returns Promise with auth response
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);

    // Store tokens and user data in local storage
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.data.user));

    const decoded: any = jwtDecode(response.data.accessToken);
    localStorage.setItem('permissions', JSON.stringify(decoded?.permissions));
    localStorage.setItem('roles', JSON.stringify(decoded?.roles));

    return response.data;
  },

  /**
   * Logout user
   */
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  /**
   * Check if user is authenticated
   * @returns boolean
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('accessToken');
  },

  /**
   * Get current user
   * @returns User object or null
   */
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getPermissions: (): string[] => {
    const permissions = localStorage.getItem('permissions');
    return permissions ? JSON.parse(permissions) : [];
  },

  getRoles: (): string[] => {
    const roles = localStorage.getItem('roles');
    return roles ? JSON.parse(roles) : [];
  },

  /**
   * Refresh access token using refresh token
   * @returns Promise with new tokens
   */
  refreshToken: async (): Promise<{
    accessToken: string;
    refreshToken: string;
  }> => {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post<{
      accessToken: string;
      refreshToken: string;
    }>('/auth/refresh', {
      refreshToken,
    });

    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);

    return response.data;
  },
};

export default authService;
