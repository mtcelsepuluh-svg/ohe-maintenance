import api from './api';
import { Activity } from '../types';

export const activityService = {
  // Value Time
  getValueTimes: async (params?: { sub_category?: string; status?: string; search?: string }): Promise<Activity[]> => {
    const response = await api.get<{ success: boolean; data: Activity[] }>('/valuetimes', { params });
    return response.data.data;
  },

  // Direct
  getDirects: async (params?: { status?: string; search?: string }): Promise<Activity[]> => {
    const response = await api.get<{ success: boolean; data: Activity[] }>('/directs', { params });
    return response.data.data;
  },

  // Indirect
  getIndirects: async (params?: { status?: string; search?: string }): Promise<Activity[]> => {
    const response = await api.get<{ success: boolean; data: Activity[] }>('/indirects', { params });
    return response.data.data;
  },

  // Loss Time
  getLossTimes: async (params?: { status?: string; search?: string }): Promise<Activity[]> => {
    const response = await api.get<{ success: boolean; data: Activity[] }>('/losstimes', { params });
    return response.data.data;
  },

  // Import activities from Excel
  importActivities: async (file: File): Promise<{
    success: boolean;
    message: string;
    data: {
      total_rows: number;
      valid_records: number;
      created_records: number;
      errors: string[];
    };
  }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/import/activities', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
};
