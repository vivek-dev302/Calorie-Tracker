import { REACT_APP_API_BASE_URL } from '@env';

const API_BASE_URL = REACT_APP_API_BASE_URL ;
console.log('API_BASE_URL:', API_BASE_URL);


export const API_ENDPOINTS = {
  ENTRIES: `${API_BASE_URL}/api/entries`,
  DELETE_ENTRY: `${API_BASE_URL}/api/entries`,
  ANALYZE_USER_TEXT: `${API_BASE_URL}/api/analyze-user-text`,
  ANALYZE_MEAL_IMAGE: `${API_BASE_URL}/api/analyze-meal-image`,
  GOOGLE_AUTH: `${API_BASE_URL}/auth/google`,
  PROFILE: `${API_BASE_URL}/api/profile`,
  DAILY_GOALS: `${API_BASE_URL}/api/profile/daily-goals`,
};


export default API_BASE_URL;
