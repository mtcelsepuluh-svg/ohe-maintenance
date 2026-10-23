import api from './api';
import { DashboardData, DashboardStats } from '../types';

export const dashboardService = {
  getDashboard: async (params: {
    startDate: string;
    endDate: string;
    mekanik?: string;
    shift?: string;
  }): Promise<DashboardData> => {
    const response = await api.get<{ success: boolean; data: DashboardData }>('/dashboard', { params });
    return response.data.data;
  },

  getStats: async (params: {
    startDate: string;
    endDate: string;
  }): Promise<DashboardStats> => {
    const response = await api.get<{ success: boolean; data: DashboardStats }>('/dashboard/stats', { params });
    return response.data.data;
  },
};
