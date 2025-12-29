import axios from 'axios';

const API_URL = process.env.REACT_APP_CLUB_API_URL || 'http://localhost:3002';

export const memberService = {
  listMembers: async (clubId: string, filters?: any) => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.memberType) params.append('memberType', filters.memberType);
    
    const response = await axios.get(`${API_URL}/api/clubs/${clubId}/members?${params.toString()}`);
    return response.data;
  },

  getMember: async (id: string) => {
    const response = await axios.get(`${API_URL}/api/clubs/members/${id}`);
    return response.data;
  },

  createMember: async (clubId: string, data: any) => {
    const response = await axios.post(`${API_URL}/api/clubs/${clubId}/members`, data);
    return response.data;
  },

  updateMember: async (id: string, data: any) => {
    const response = await axios.put(`${API_URL}/api/clubs/members/${id}`, data);
    return response.data;
  },

  deleteMember: async (id: string) => {
    const response = await axios.delete(`${API_URL}/api/clubs/members/${id}`);
    return response.data;
  },

  getMemberQuotas: async (memberId: string) => {
    const response = await axios.get(`${API_URL}/api/clubs/members/${memberId}/quotas`);
    return response.data;
  },

  createQuotaPayment: async (memberId: string, data: any) => {
    const response = await axios.post(`${API_URL}/api/clubs/members/${memberId}/quotas`, data);
    return response.data;
  },

  importMembers: async (clubId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(
      `${API_URL}/api/clubs/${clubId}/members/import`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  },

  getMemberStats: async (clubId: string) => {
    const response = await axios.get(`${API_URL}/api/clubs/${clubId}/members/stats`);
    return response.data;
  }
};
