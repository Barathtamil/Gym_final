const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private baseURL: string;
  private accessToken: string | null = null;
  private isRedirecting: boolean = false;

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

  private clearSession() {
    // Clear all authentication-related data
    this.setAccessToken(null);
    this.setRefreshToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('matrix_gym_user');
      // Dispatch event to notify AuthContext to clear user state
      window.dispatchEvent(new CustomEvent('session-expired'));
    }
  }

  private redirectToLogin() {
    // Prevent multiple simultaneous redirects
    if (this.isRedirecting) {
      return;
    }
    this.isRedirecting = true;
    this.clearSession();
    // Use setTimeout to ensure localStorage is cleared before redirect
    setTimeout(() => {
      window.location.href = '/login';
    }, 0);
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
          // Clear session and redirect to login
          this.redirectToLogin();
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

  async createMemberWithImage(memberData: any, profileImage: File | null) {
    const url = `${this.baseURL}/members`;
    const formData = new FormData();
    
    // Append all member data as JSON string
    Object.keys(memberData).forEach((key) => {
      const value = memberData[key];
      if (value !== null && value !== undefined) {
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
      }
    });
    
    // Append profile image if provided
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }

    const headers: HeadersInit = {};
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }
    // Don't set Content-Type for FormData, browser will set it with boundary

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      // Handle token refresh on 401
      if (response.status === 401) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          headers['Authorization'] = `Bearer ${this.accessToken}`;
          const retryResponse = await fetch(url, {
            method: 'POST',
            headers,
            body: formData,
          });
          if (!retryResponse.ok) {
            const error = await retryResponse.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(error.error || `HTTP error! status: ${retryResponse.status}`);
          }
          return retryResponse.json();
        } else {
          // Clear session and redirect to login
          this.redirectToLogin();
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

  async updateMember(id: string, memberData: any) {
    return this.request(`/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(memberData),
    });
  }

  async updateMemberWithImage(id: string, memberData: any, profileImage: File | null) {
    const url = `${this.baseURL}/members/${id}`;
    const formData = new FormData();
    
    // Append all member data as JSON string
    Object.keys(memberData).forEach((key) => {
      const value = memberData[key];
      if (value !== null && value !== undefined) {
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
      }
    });
    
    // Append profile image if provided
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }

    const headers: HeadersInit = {};
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: formData,
      });

      if (response.status === 401) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          headers['Authorization'] = `Bearer ${this.accessToken}`;
          const retryResponse = await fetch(url, {
            method: 'PUT',
            headers,
            body: formData,
          });
          if (!retryResponse.ok) {
            const error = await retryResponse.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(error.error || `HTTP error! status: ${retryResponse.status}`);
          }
          return retryResponse.json();
        } else {
          // Clear session and redirect to login
          this.redirectToLogin();
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

  async renewMember(id: string, planId: string, paidAmount: number) {
    return this.request(`/members/${id}/renew`, {
      method: 'POST',
      body: JSON.stringify({ planId, paidAmount }),
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

  // Staff endpoints
  async getStaff(branchId?: string) {
    const query = branchId ? `?branchId=${branchId}` : '';
    return this.request(`/staff${query}`);
  }

  async getStaffById(id: string) {
    return this.request(`/staff/${id}`);
  }

  async createStaff(staffData: any) {
    return this.request('/staff', {
      method: 'POST',
      body: JSON.stringify(staffData),
    });
  }

  async updateStaff(id: string, staffData: any) {
    return this.request(`/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(staffData),
    });
  }

  async deleteStaff(id: string) {
    return this.request(`/staff/${id}`, {
      method: 'DELETE',
    });
  }

  // Plan endpoints
  async getPlans() {
    return this.request('/plans');
  }

  async getPlanById(id: string) {
    return this.request(`/plans/${id}`);
  }

  async createPlan(planData: any) {
    return this.request('/plans', {
      method: 'POST',
      body: JSON.stringify(planData),
    });
  }

  async updatePlan(id: string, planData: any) {
    return this.request(`/plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(planData),
    });
  }

  async deletePlan(id: string) {
    return this.request(`/plans/${id}`, {
      method: 'DELETE',
    });
  }

  // Branch endpoints
  async getBranches() {
    return this.request('/branches');
  }

  async getBranchById(id: string) {
    return this.request(`/branches/${id}`);
  }

  async createBranch(branchData: any) {
    return this.request('/branches', {
      method: 'POST',
      body: JSON.stringify(branchData),
    });
  }

  async updateBranch(id: string, branchData: any) {
    return this.request(`/branches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(branchData),
    });
  }

  async deleteBranch(id: string) {
    return this.request(`/branches/${id}`, {
      method: 'DELETE',
    });
  }

  // Expense endpoints
  async getExpenses(filters?: { startDate?: string; endDate?: string }) {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const query = params.toString();
    return this.request(`/expenses${query ? `?${query}` : ''}`);
  }

  async getExpenseById(id: string) {
    return this.request(`/expenses/${id}`);
  }

  async createExpense(expenseData: any) {
    return this.request('/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
  }

  async updateExpense(id: string, expenseData: any) {
    return this.request(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expenseData),
    });
  }

  async deleteExpense(id: string) {
    return this.request(`/expenses/${id}`, {
      method: 'DELETE',
    });
  }

  // Enquiry endpoints
  async getEnquiries(filters?: { status?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);

    const query = params.toString();
    return this.request(`/enquiries${query ? `?${query}` : ''}`);
  }

  async getEnquiryById(id: string) {
    return this.request(`/enquiries/${id}`);
  }

  async createEnquiry(enquiryData: any) {
    return this.request('/enquiries', {
      method: 'POST',
      body: JSON.stringify(enquiryData),
    });
  }

  async updateEnquiry(id: string, enquiryData: any) {
    return this.request(`/enquiries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(enquiryData),
    });
  }

  async deleteEnquiry(id: string) {
    return this.request(`/enquiries/${id}`, {
      method: 'DELETE',
    });
  }

  // Dashboard endpoint
  async getDashboardStats(branchId?: string) {
    const query = branchId ? `?branchId=${branchId}` : '';
    return this.request(`/dashboard${query}`);
  }

  // Payment methods
  async createPayment(data: {
    memberId: string;
    amount: number;
    paymentDate?: string;
    paymentMethod?: string;
    invoiceNo?: string;
    remark?: string;
    paymentType?: 'registration' | 'renewal' | 'balance';
  }) {
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPaymentsByMemberId(memberId: string) {
    return this.request(`/payments/member/${memberId}`);
  }

  async getAllPayments(filters?: {
    memberId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.memberId) params.append('memberId', filters.memberId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/payments${query}`);
  }

  // Pending Member Registration endpoints
  async getPendingRegistrations(filters?: { status?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/pending-members${query}`);
  }

  async getPendingRegistrationById(id: string) {
    return this.request(`/pending-members/${id}`);
  }

  async createPendingRegistration(registrationData: any, profileImage: File | null) {
    const url = `${this.baseURL}/pending-members`;
    const formData = new FormData();
    
    // Append all registration data
    Object.keys(registrationData).forEach((key) => {
      const value = registrationData[key];
      if (value !== null && value !== undefined) {
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
      }
    });
    
    // Append profile image if provided
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }

    // No auth token needed for public registration
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

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

  async approvePendingRegistration(id: string, approvalData: {
    planId: string;
    planStartDate: string;
    planEndDate: string;
    planAmount: number;
    paidAmount: number;
    registrationNo?: string;
  }) {
    return this.request(`/pending-members/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(approvalData),
    });
  }

  async rejectPendingRegistration(id: string) {
    return this.request(`/pending-members/${id}/reject`, {
      method: 'POST',
    });
  }

  async deletePendingRegistration(id: string) {
    return this.request(`/pending-members/${id}`, {
      method: 'DELETE',
    });
  }

  // Export endpoints
  async exportMembers(): Promise<Blob> {
    const url = `${this.baseURL}/export/members`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to export members');
    }
    
    return response.blob();
  }

  async exportExpenses(filters?: { startDate?: string; endDate?: string }): Promise<Blob> {
    const queryParams = new URLSearchParams();
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    const url = `${this.baseURL}/export/expenses${query}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to export expenses');
    }
    
    return response.blob();
  }

  async exportEnquiries(filters?: { status?: string }): Promise<Blob> {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    const url = `${this.baseURL}/export/enquiries${query}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to export enquiries');
    }
    
    return response.blob();
  }

  async exportPlans(): Promise<Blob> {
    const url = `${this.baseURL}/export/plans`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to export plans');
    }
    
    return response.blob();
  }

  async exportBranches(): Promise<Blob> {
    const url = `${this.baseURL}/export/branches`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to export branches');
    }
    
    return response.blob();
  }

  async exportAttendance(filters?: { startDate?: string; endDate?: string; branchId?: string }): Promise<Blob> {
    const queryParams = new URLSearchParams();
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);
    if (filters?.branchId) queryParams.append('branchId', filters.branchId);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    const url = `${this.baseURL}/export/attendance${query}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to export attendance');
    }
    
    return response.blob();
  }

  async exportStaff(branchId?: string): Promise<Blob> {
    const query = branchId ? `?branchId=${branchId}` : '';
    const url = `${this.baseURL}/export/staff${query}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to export staff');
    }
    
    return response.blob();
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;

