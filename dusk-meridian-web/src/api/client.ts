import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_ENDPOINTS } from '../utils/constants';
import { getBestValidToken, clearAllTokens } from '../utils/tokenValidator';

// Temporary inline types to avoid import issues
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  path: string;
}

class ApiClient {
  private instance: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.instance = axios.create({
      baseURL: API_ENDPOINTS.BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        // Use validated token retrieval (IMX first, then Auth0 fallback)
        const token = this.authToken || getBestValidToken();

        console.log('🔍 API Request Interceptor:');
        console.log('   URL:', config.url);
        console.log('   Method:', config.method?.toUpperCase());
        console.log('   Token available:', !!token);

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('   Token preview:', token.substring(0, 50) + '...');
          console.log('   Authorization header set:', `Bearer ${token.substring(0, 20)}...`);
        } else {
          console.log('   ❌ NO TOKEN - Request will be unauthenticated');
        }

        console.log('   All headers:', Object.keys(config.headers || {}));
        return config;
      },
      (error) => {
        console.error('🚨 Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          console.log('🚨 API 401 response - temporarily NOT clearing tokens for debugging');
          this.clearAuthToken();
          // Temporarily disable automatic token clearing for debugging
          // clearAllTokens();
          // Emit auth error event for Auth0 to handle
          window.dispatchEvent(new CustomEvent('auth:token-expired'));
        }

        // Handle GameServer error format
        const apiError: ApiError = {
          code: error.response?.data?.error?.code || error.response?.data?.code || 'UNKNOWN_ERROR',
          message: error.response?.data?.error?.message || error.response?.data?.message || error.message,
          details: error.response?.data?.error?.details || error.response?.data?.details,
          timestamp: new Date().toISOString(),
          path: error.config?.url || '',
        };

        return Promise.reject(apiError);
      }
    );
  }


  setAuthToken(token: string) {
    this.authToken = token;
  }

  clearAuthToken() {
    this.authToken = null;
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  // Upload file with progress tracking
  async upload<T>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.instance.post<ApiResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  }

  // Stream data for real-time updates
  async stream(url: string, onData: (data: any) => void, onError?: (error: any) => void): Promise<void> {
    try {
      const response = await this.instance.get(url, {
        responseType: 'stream',
        adapter: 'fetch',
      });

      const reader = response.data.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            onData(data);
          } catch (e) {
            // Skip invalid JSON lines
          }
        }
      }
    } catch (error) {
      if (onError) {
        onError(error);
      } else {
        throw error;
      }
    }
  }

  // Batch requests
  async batch<T>(requests: Array<{ method: string; url: string; data?: any }>): Promise<ApiResponse<T[]>> {
    const response = await this.instance.post<ApiResponse<T[]>>('/batch', { requests });
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.instance.get('/health');
    return response.data;
  }
}

export const apiClient = new ApiClient();