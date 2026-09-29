/**
 * Centralized API Client for OneLife Backend
 * Target Host: http://10.81.2.251:8000
 */

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.81.2.251:8000';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = (): string | null => authToken;

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseText = await response.text();
    let data: any = {};
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { message: responseText };
    }

    if (!response.ok) {
      return {
        success: false,
        message: data.message || `Server error (${response.status})`,
        errors: data.errors || [data.message],
      };
    }

    return {
      success: data.success !== undefined ? data.success : true,
      message: data.message,
      data: data.data !== undefined ? data.data : data,
    };
  } catch (error: any) {
    console.warn(`API Error [${endpoint}]:`, error?.message || error);
    return {
      success: false,
      message: error?.name === 'AbortError' 
        ? 'Request timed out. Please check backend network.' 
        : (error?.message || 'Network error connecting to server'),
    };
  }
}
