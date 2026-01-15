// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = {
  // Helper for authenticated GET requests
  get: async (endpoint: string) => {
    const token = localStorage.getItem('payrail_token');
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) {
      if (res.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('payrail_token');
        window.location.href = '/auth/login';
      }
      throw new Error('API Request Failed');
    }
    return res.json();
  },

  // Helper for POST requests (Auth & Data)
  post: async (endpoint: string, body: any, auth = false) => {
    const headers: any = { 'Content-Type': 'application/json' };
    if (auth) {
      const token = localStorage.getItem('payrail_token');
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Something went wrong');
    return data;
  }
};