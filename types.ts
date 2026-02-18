
export enum ViewType {
  DASHBOARD = 'DASHBOARD',
  ANALYSIS = 'ANALYSIS',
  BUDGET = 'BUDGET',
  PROFILE = 'PROFILE',
  ADD_TRANSACTION = 'ADD_TRANSACTION',
  REGISTRATION = 'REGISTRATION',
  SCAN = 'SCAN'
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string; // Base64 image data
}

export interface NotificationSettings {
  dailyReminders: boolean;
  budgetAlerts: boolean;
  aiInsights: boolean;
  reminderTime: string;
}

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: string;
  type: 'expense' | 'income';
  note?: string;
}

export interface CategoryDef {
  id: string;
  name: string;
  icon: string;
  initialBudget: number;
  color: string;
  bg: string;
}

export interface Category {
  name: string;
  spent: number;
  total: number;
  icon: string;
  color: string;
}
