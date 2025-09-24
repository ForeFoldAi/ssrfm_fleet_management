import api from './axios';
import authService from './auth';
import machinesApi from './machines';
import branchesApi from './branches';
import materialsApi from './materials';
import materialIndentsApi from './material-indents';
import materialPurchasesApi from './materials-purchases';

export { api, authService, machinesApi, branchesApi, materialsApi, materialIndentsApi, materialPurchasesApi };

// Re-export types
export * from './types.d';

export default {
  api,
  auth: authService,
  machines: machinesApi,
  branches: branchesApi,
  materials: materialsApi,
  materialIndents: materialIndentsApi,
  materialPurchases: materialPurchasesApi,
};
