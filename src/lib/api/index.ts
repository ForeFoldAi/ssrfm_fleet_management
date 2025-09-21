import api from './axios';
import authService from './auth';
import machinesApi from './machines';
import branchesApi from './branches';
import materialsApi from './materials';

export { api, authService, machinesApi, branchesApi, materialsApi };

// Re-export types
export * from './types.d';

export default {
  api,
  auth: authService,
  machines: machinesApi,
  branches: branchesApi,
  materials: materialsApi,
};
