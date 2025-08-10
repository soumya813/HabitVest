/**
 * Utility functions for API calls with consistent error handling
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Safe fetch wrapper that handles non-JSON responses gracefully
 */
export async function safeFetch(
  url: string, 
  options?: RequestInit
): Promise<{ response: Response; data?: any; isJson: boolean }> {
  try {
    const response = await fetch(url, {
      credentials: 'include',
      ...options,
    });

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    if (isJson) {
      try {
        const data = await response.json();
        return { response, data, isJson: true };
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        return { response, isJson: false };
      }
    } else {
      // Non-JSON response (likely HTML error page)
      const text = await response.text();
      console.warn(`Non-JSON response from ${url}:`, response.status, text.substring(0, 200));
      return { response, isJson: false };
    }
  } catch (error) {
    console.error(`Network error for ${url}:`, error);
    throw error;
  }
}

/**
 * Check if the backend server is responding
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const { response, isJson } = await safeFetch('http://localhost:5001/api/v1/auth/me');
    return response.status !== 404 && response.status < 500;
  } catch {
    return false;
  }
}

/**
 * Display user-friendly error messages
 */
export function getErrorMessage(response: Response, isJson: boolean): string {
  if (!isJson) {
    if (response.status === 404) {
      return 'API endpoint not found. Please check if the backend server is running on the correct port.';
    } else if (response.status >= 500) {
      return 'Server error. Please try again later.';
    } else if (response.status === 401) {
      return 'Authentication required. Please log in.';
    } else {
      return 'Backend server returned an unexpected response. Please check if the server is running properly.';
    }
  }
  
  return 'An error occurred. Please try again.';
}
