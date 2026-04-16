import { API_ENDPOINTS } from '../config/api';
import { apiRequest } from './apiClient';
import { DailyGoals, ProfileResponse, UserProfile } from '../types/profile';

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export async function fetchProfile(): Promise<ProfileResponse> {
  const res = await apiRequest(API_ENDPOINTS.PROFILE, 'GET');
  const json: ApiEnvelope<ProfileResponse> = await res.json();
  return json.data;
}

export async function saveProfile(payload: Partial<UserProfile>): Promise<ProfileResponse> {
  const res = await apiRequest(API_ENDPOINTS.PROFILE, 'PUT', payload);
  const json: ApiEnvelope<ProfileResponse> = await res.json();
  return json.data;
}

export async function fetchDailyGoals(): Promise<DailyGoals> {
  const res = await apiRequest(API_ENDPOINTS.DAILY_GOALS, 'GET');
  const json: ApiEnvelope<DailyGoals> = await res.json();
  return json.data;
}
