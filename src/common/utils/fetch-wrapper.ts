export interface FetchWrapperOptions extends RequestInit {
  baseUrl?: string;
  timeout?: number; // in milliseconds
}

export class FetchWrapper {
  private baseUrl: string;
  private timeout: number;

  constructor(options?: { baseUrl?: string; timeout?: number }) {
    this.baseUrl = options?.baseUrl || '';
    this.timeout = options?.timeout || 5000; // default timeout 5 seconds
  }

  /**
   * Builds the full URL with query parameters.
   */
  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    let url = this.baseUrl ? `${this.baseUrl}${endpoint}` : endpoint;
    if (params) {
      const query = new URLSearchParams();
      for (const key in params) {
        if (params[key] !== undefined && params[key] !== null) {
          query.append(key, params[key]);
        }
      }
      url += `?${query.toString()}`;
    }
    return url;
  }

  /**
   * Makes a GET request.
   */
  public get<T>(
    endpoint: string,
    params?: Record<string, any>,
    options?: RequestInit,
  ): Promise<T> {
    const url = this.buildUrl(endpoint, params);
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  /**
   * Makes a POST request.
   */
  public post<T>(
    endpoint: string,
    body: any,
    options?: RequestInit,
  ): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      body: JSON.stringify(body),
    });
  }

  /**
   * Makes a PUT request.
   */
  public put<T>(
    endpoint: string,
    body: any,
    options?: RequestInit,
  ): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      body: JSON.stringify(body),
    });
  }

  /**
   * Makes a DELETE request.
   */
  public delete<T>(
    endpoint: string,
    params?: Record<string, any>,
    options?: RequestInit,
  ): Promise<T> {
    const url = this.buildUrl(endpoint, params);
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }

  /**
   * General request method handling timeout and baseUrl.
   */
  private async request<T>(
    url: string,
    options: FetchWrapperOptions,
  ): Promise<T> {
    const controller = new AbortController();
    const id = setTimeout(
      () => controller.abort(),
      options.timeout || this.timeout,
    );

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(id);

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, body: ${errorBody}`,
        );
      }

      // Assuming JSON response
      const data = await response.json();
      return data as T;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(`Request to ${url} timed out after ${this.timeout}ms`);
      }
      throw error;
    }
  }
}
