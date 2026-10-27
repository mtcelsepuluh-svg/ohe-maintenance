import api from './api';
import { OHEInput, OHEInputCreate } from '../types';

export const oheService = {
  getInputs: async (params?: {
    date?: string;
    // Filter by calendar month, format 'YYYY-MM'.
    month?: string;
    shift?: string;
    mekanik?: string;
    category?: string;
  }): Promise<OHEInput[]> => {
    const response = await api.get<{ success: boolean; data: OHEInput[] }>('/oheinputs', { params });
    return response.data.data;
  },

  createInput: async (data: OHEInputCreate): Promise<OHEInput> => {
    const response = await api.post<{ success: boolean; data: OHEInput }>('/oheinputs', data);
    return response.data.data;
  },

  updateInput: async (id: string, data: Partial<OHEInputCreate>): Promise<OHEInput> => {
    const response = await api.put<{ success: boolean; data: OHEInput }>(`/oheinputs/${id}`, data);
    return response.data.data;
  },

  deleteInput: async (id: string): Promise<void> => {
    await api.delete(`/oheinputs/${id}`);
  },

  getSummary: async (params: {
    startDate: string;
    endDate: string;
    mekanik?: string;
  }): Promise<any> => {
    const response = await api.get<{ success: boolean; data: any }>('/oheinputs/summary', { params });
    return response.data.data;
  },
};
