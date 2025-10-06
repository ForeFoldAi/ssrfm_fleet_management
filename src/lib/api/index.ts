import api from './axios';
import authService from './auth';
import machinesApi from './machines';
import machineTypesApi from './machine-types';
import branchesApi from './branches';
import materialsApi from './materials';
import materialIndentsApi from './material-indents';
import materialIssuesApi from './material-issues';
import materialPurchasesApi from './materials-purchases';

export { api, authService, machinesApi, machineTypesApi, branchesApi, materialsApi, materialIndentsApi, materialIssuesApi, materialPurchasesApi };

// Re-export types
export * from './types.d';

export default {
  api,
  auth: authService,
  machines: machinesApi,
  machineTypes: machineTypesApi,
  branches: branchesApi,
  materials: materialsApi,
  materialIndents: materialIndentsApi,
  materialIssues: materialIssuesApi,
  materialPurchases: materialPurchasesApi,
};
