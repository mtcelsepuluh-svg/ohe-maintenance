export interface User {
  _id: string;
  user_id: string;
  name: string;
  role: 'ADMIN' | 'MEKANIK';
  machine: string;
  status: 'active' | 'inactive';
}

export interface AuthResponse {
  success: boolean;
  _id: string;
  user_id: string;
  name: string;
  role: 'ADMIN' | 'MEKANIK';
  machine: string;
  token: string;
}

export interface LoginCredentials {
  user_id: string;
  pin: string;
}

export interface Activity {
  _id: string;
  activity_code: string;
  activity_name: string;
  category: 'VALUE TIME' | 'DIRECT' | 'INDIRECT' | 'LOSS';
  sub_category: string;
  standard_time: number;
  unit: string;
  description: string;
  status: 'active' | 'inactive';
}

export interface OHEInput {
  _id: string;
  record_id: string;
  date: string;
  shift: string;
  mekanik: string;
  activity_code: string;
  activity_name: string;
  category: 'VALUE TIME' | 'DIRECT' | 'INDIRECT' | 'LOSS';
  start_time: string;
  end_time: string;
  actual_time_min: number;
  standard_time_min: number;
  quantity: number;
  production_result: string;
  remarks: string;
  created_by: string;
  // Fields from import
  jenis_pekerjaan?: string;
  kategori_pekerjaan?: string;
  loss_time?: string;
  nama?: string;
}

export interface OHEInputCreate {
  date: string;
  shift: string;
  mekanik: string;
  activity_code: string;
  activity_name: string;
  category: 'VALUE TIME' | 'DIRECT' | 'INDIRECT' | 'LOSS';
  start_time: string;
  end_time: string;
  standard_time_min: number;
  quantity?: number;
  production_result?: string;
  remarks?: string;
}

export interface DashboardSummary {
  total_work_time: number;
  value_time: number;
  direct_time: number;
  indirect_time: number;
  loss_time: number;
  efficiency: number;
  direct_ratio: number;
  ohe: number;
  target_ohe: number;
  benchmark_ohe: number;
  achievement: number;
  status: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  machine_performance: any[];
  period: {
    start: string;
    end: string;
  };
  total_records: number;
}

export interface DashboardStats {
  by_category: {
    'VALUE TIME': number;
    'DIRECT': number;
    'INDIRECT': number;
    'LOSS': number;
  };
  trend: Array<{
    date: string;
    ohe: number;
    efficiency: number;
    value_time: number;
    direct_time: number;
    indirect_time: number;
    loss_time: number;
    total_time: number;
  }>;
  total_records: number;
}

export interface Settings {
  working_start_monday_thursday: string;
  working_end_monday_thursday: string;
  target_ohe: number;
  benchmark_ohe: number;
  application_name: string;
}
