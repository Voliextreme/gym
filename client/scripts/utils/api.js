// Base API configuration
export const API_BASE_URL = 'http://127.0.0.1:5000/api';

// Helper function for API requests
export async function apiRequest(endpoint, method = 'GET', body = null, headers = {}) {
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || 'Request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}