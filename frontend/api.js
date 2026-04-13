import { Platform } from 'react-native';

export const getApiUrl = (endpoint) => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return `${process.env.EXPO_PUBLIC_API_URL}${endpoint}`;
  }
  
  if (Platform.OS === 'web') {
    if (process.env.NODE_ENV === 'production') {
      return `/api${endpoint}`;
    }
    return `http://127.0.0.1:8000/api${endpoint}`;
  }
  
  return `http://10.0.2.2:8000/api${endpoint}`;
};
