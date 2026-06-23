import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getExpoHost = () => {
  return (
    Constants.manifest?.debuggerHost?.split(':')[0] ||
    Constants.manifest2?.debuggerHost?.split(':')[0] ||
    Constants.expoConfig?.hostUri?.split(':')[0] ||
    Constants.expoConfig?.extra?.apiHost ||
    Constants.manifest?.extra?.apiHost ||
    null
  );
};

const getApiHost = () => {
  const expoHost = getExpoHost();
  if (expoHost) {
    return expoHost;
  }

  if (Platform.OS === 'android') {
    return '10.0.2.2';
  }

  if (Platform.OS === 'ios') {
    return '127.0.0.1';
  }

  return 'localhost';
};

const API_URL = `http://10.230.84.189:8000/api`;
console.log('[API] baseURL=', API_URL, 'expoHost=', getExpoHost());
// Si tu utilises un vrai téléphone, ajoute "apiHost" dans app.json extra ou remplace ici par l'IP de ton PC.

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
