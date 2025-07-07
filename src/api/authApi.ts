import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // change if needed
});

export const requestReset = (email: string) =>
  API.post('/auth/request-reset', { email });

export const verifyResetCode = (email: string, code: string) =>
  API.post('/auth/verify-reset-code', { email, code });

export const resetPassword = (email: string, code: string, newPassword: string) =>
  API.post('/auth/reset-password', { email, code, newPassword });

export const resetLogin = (email: string, code: string) =>
  API.post('/auth/reset-login', { email, code });
