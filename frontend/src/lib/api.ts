const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private baseURL: string;
  private accessToken: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Load token from localStorage
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
    }
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }

  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  }

  setRefreshToken(token: string | null) {
    if (token) {
      localStorage.setItem('refreshToken', token);
    } else {
      localStorage.removeItem('refreshToken');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle token refresh on 401
      if (response.status === 401 && endpoint !== '/auth/login') {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry original request
          headers['Authorization'] = `Bearer ${this.accessToken}`;
          const retryResponse = await fetch(url, {
            ...options,
            headers,
          });
          if (!retryResponse.ok) {
            throw new Error('Request failed after token refresh');
          }
          return retryResponse.json();
        } else {
          // Redirect to login
          this.setAccessToken(null);
          this.setRefreshToken(null);
          window.location.href = '/login';
          throw new Error('Session expired');
        }
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  private async refreshAccessToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      this.setAccessToken(data.accessToken);
      this.setRefreshToken(data.refreshToken);
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  // Auth endpoints
  async login(username: string, password: string) {
    const data = await this.request<{
      user: any;
      accessToken: string;
      refreshToken: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    this.setAccessToken(data.accessToken);
    this.setRefreshToken(data.refreshToken);
    return data;
  }

  async logout() {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      try {
        await this.request('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    this.setAccessToken(null);
    this.setRefreshToken(null);
  }

  // Member endpoints
  async getMembers(filters?: { branchId?: string; isActive?: boolean; search?: string }) {
    const params = new URLSearchParams();
    if (filters?.branchId) params.append('branchId', filters.branchId);
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
    if (filters?.search) params.append('search', filters.search);

    const query = params.toString();
    return this.request(`/members${query ? `?${query}` : ''}`);
  }

  async getMemberById(id: string) {
    return this.request(`/members/${id}`);
  }

  async getMemberByRegistrationNo(registrationNo: string) {
    return this.request(`/members/search/${registrationNo}`);
  }

  async createMember(memberData: any) {
    return this.request('/members', {
      method: 'POST',
      body: JSON.stringify(memberData),
    });
  }

  async updateMember(id: string, memberData: any) {
    return this.request(`/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(memberData),
    });
  }

  async deleteMember(id: string) {
    return this.request(`/members/${id}`, {
      method: 'DELETE',
    });
  }

  // Attendance endpoints
  async markAttendance(memberId: string, batch: 'morning' | 'evening') {
    return this.request('/attendance', {
      method: 'POST',
      body: JSON.stringify({ memberId, batch }),
    });
  }

  async getAttendanceList(filters?: {
    date?: string;
    batch?: 'morning' | 'evening';
    memberId?: string;
    branchId?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.date) params.append('date', filters.date);
    if (filters?.batch) params.append('batch', filters.batch);
    if (filters?.memberId) params.append('memberId', filters.memberId);
    if (filters?.branchId) params.append('branchId', filters.branchId);

    const query = params.toString();
    return this.request(`/attendance${query ? `?${query}` : ''}`);
  }

  async getTodayAttendance(branchId?: string) {
    const query = branchId ? `?branchId=${branchId}` : '';
    return this.request(`/attendance/today${query}`);
  }

  // Logo endpoint
  async getActiveLogo() {
    return this.request('/logo');
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;

