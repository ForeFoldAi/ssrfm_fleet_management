import api from './axios';

export const notificationApi = {
  subscribeToNotification: async (payload: {
    token: string;
    deviceModel?: string;
    platform?: string; // ios | android | web
    appVersion?: string;
  }) => {
    const response = await api.post('/notifications/device-tokens', payload);
    return response.data;
  },
};
