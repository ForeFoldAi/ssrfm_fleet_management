import axios from 'axios';

// Base API URL
const API_URL =
  import.meta.env.VITE_APP_API_BASE_URL ||
  'https://0ehawyo6gg.execute-api.ap-south-1.amazonaws.com/dev';

// Create axios instance with custom config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 30 seconds
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from local storage
    const token = localStorage.getItem('accessToken');

    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Return successful responses as-is
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 Unauthorized and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');

        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;

          // Store new tokens
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          // Update the authorization header
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh token is invalid, log out the user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        // Redirect to login page
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
