/**
 * Base HTTP Client
 *
 * Shared HTTP client functionality for all API clients.
 * Provides timeout handling, error management, and response parsing.
 */

import { ApiError } from "../errors";

export interface HttpClientOptions {
  baseUrl: string;
  timeout?: number;
  defaultHeaders?: Record<string, string>;
}

/**
 * Base HTTP client that can be extended by specific API clients
 */
export class BaseHttpClient {
  protected readonly baseUrl: string;
  protected readonly timeout: number;
  protected readonly defaultHeaders: Record<string, string>;

  constructor(options: HttpClientOptions) {
    this.baseUrl = options.baseUrl;
    this.timeout = options.timeout ?? 30000;
    this.defaultHeaders = options.defaultHeaders ?? {};
  }

  /**
   * Make HTTP request with timeout and error handling
   */
  protected async fetch<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const url = `${this.baseUrl}${path}`;

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...this.defaultHeaders,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw this.createError(url, response.status, errorText);
      }

      return this.parseResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (error instanceof Error && error.name === "AbortError") {
        throw this.createError(url, 408, "Request timeout");
      }
      throw this.createError(
        url,
        undefined,
        error instanceof Error ? error.message : "Unknown error",
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Make GET request
   */
  protected get<T>(path: string): Promise<T> {
    return this.fetch<T>(path, { method: "GET" });
  }

  /**
   * Make POST request with JSON body
   */
  protected post<T>(path: string, body: unknown): Promise<T> {
    return this.fetch<T>(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  /**
   * Make POST request with raw body (for tx broadcast)
   */
  protected postRaw<T>(path: string, body: string): Promise<T> {
    return this.fetch<T>(path, {
      method: "POST",
      body,
    });
  }

  /**
   * Parse response body - handles JSON and plain text
   */
  protected async parseResponse<T>(response: Response): Promise<T> {
    const text = await response.text();

    if (!text) {
      return {} as T;
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      // Return as-is for plain text responses (like txids)
      return text as unknown as T;
    }
  }

  /**
   * Create error instance - override in subclasses for custom error types
   */
  protected createError(
    endpoint: string,
    status?: number,
    message?: string,
  ): ApiError {
    return new ApiError(endpoint, status, message);
  }
}
