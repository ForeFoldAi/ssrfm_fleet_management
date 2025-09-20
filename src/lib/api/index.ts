import api from './axios';
import authService from './auth';
import machinesApi from './machines';
import branchesApi from './branches';

export { api, authService, machinesApi, branchesApi };

// Re-export types
export * from './types.d';

export default {
  api,
  auth: authService,
  machines: machinesApi,
  branches: branchesApi,
};
