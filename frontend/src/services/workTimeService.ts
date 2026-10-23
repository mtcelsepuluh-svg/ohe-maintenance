import api from './api';

export interface DailyEntry {
  date: number;
  day_of_week: string;
  is_half_day: boolean;
  standard_time: number;
  overtime: number;
  total_time: number;
  status: 'present' | 'absence' | 'holiday' | 'leave';
  absence_type: 'sakit' | 'ijin' | 'cuti' | 'lain-lain' | null;
  remarks: string;
  is_manual_overtime: boolean;
}

export interface WorkTimeSheet {
  _id: string;
  personel_id: string;
  personel_name: string;
  month: number;
  year: number;
  daily_entries: DailyEntry[];
  total_monthly: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface WorkTimeSummary {
  [date: number]: {
    date: number;
    day_of_week: string;
    total_standard: number;
    total_overtime: number;
    total_time: number;
    present_count: number;
    absence_count: number;
  };
}

export const workTimeService = {
  // Get work time sheets by year/month
  getWorkTimeSheet: async (year: number, month: number, personelId?: string): Promise<{
    data: WorkTimeSheet[];
    summary: WorkTimeSummary;
  }> => {
    const params: any = {};
    if (personelId) {
      params.personel_id = personelId;
    }
    const response = await api.get(`/worktime/${year}/${month}`, { params });
    return {
      data: response.data.data,
      summary: response.data.summary
    };
  },

  // Get single work time sheet
  getWorkTimeSheetById: async (id: string): Promise<WorkTimeSheet> => {
    const response = await api.get(`/worktime/${id}`);
    return response.data.data;
  },

  // Create new work time sheet
  createWorkTimeSheet: async (data: {
    personel_id: string;
    month: number;
    year: number;
  }): Promise<WorkTimeSheet> => {
    const response = await api.post('/worktime', data);
    return response.data.data;
  },

  // Create bulk work time sheets
  createBulkWorkTimeSheets: async (data: {
    month: number;
    year: number;
  }): Promise<any> => {
    const response = await api.post('/worktime/bulk', data);
    return response.data;
  },

  // Update daily entry
  updateDailyEntry: async (
    id: string,
    date: number,
    updates: Partial<DailyEntry>
  ): Promise<{ entry: DailyEntry; total_monthly: number }> => {
    const response = await api.put(`/worktime/${id}/day/${date}`, updates);
    return {
      entry: response.data.data,
      total_monthly: response.data.total_monthly
    };
  },

  // Add overtime
  addOvertime: async (
    id: string,
    date: number,
    overtimeMinutes: number,
    isManual: boolean = true
  ): Promise<{ entry: DailyEntry; total_monthly: number }> => {
    const response = await api.post(`/worktime/${id}/overtime`, {
      date,
      overtime_minutes: overtimeMinutes,
      is_manual: isManual
    });
    return {
      entry: response.data.data,
      total_monthly: response.data.total_monthly
    };
  },

  // Mark absence
  markAbsence: async (
    id: string,
    date: number,
    absenceType: 'sakit' | 'ijin' | 'cuti' | 'lain-lain',
    remarks: string = ''
  ): Promise<{ entry: DailyEntry; total_monthly: number }> => {
    const response = await api.post(`/worktime/${id}/absence`, {
      date,
      absence_type: absenceType,
      remarks
    });
    return {
      entry: response.data.data,
      total_monthly: response.data.total_monthly
    };
  },

  // Delete work time sheet
  deleteWorkTimeSheet: async (id: string): Promise<void> => {
    await api.delete(`/worktime/${id}`);
  },

  // Export to Excel
  exportToExcel: async (year: number, month: number): Promise<any> => {
    const response = await api.get(`/worktime/${year}/${month}/export`);
    return response.data;
  },

  // Download Excel file
  downloadExcel: async (year: number, month: number): Promise<void> => {
    const response = await api.get(`/worktime/${year}/${month}/export`, {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `WorkTimeSheet_${year}_${String(month).padStart(2, '0')}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};
