/**
 * Result type for safe operations
 * Inspired by Rust's Result<T, E> type
 */
export type Result<T, E = Error> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: E }

/**
 * HTTP methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'

/**
 * Request configuration
 */
export interface FetchBaseConfig<TBody = unknown> extends Omit<RequestInit, 'method' | 'body'> {
  /**
   * HTTP method
   */
  method?: HttpMethod

  /**
   * Request body (will be automatically JSON stringified if object)
   */
  body?: TBody

  /**
   * Query parameters to append to URL
   */
  params?: Record<string, string | number | boolean | undefined | null>

  /**
   * Request timeout in milliseconds
   */
  timeout?: number

  /**
   * Base URL to prepend to all requests
   */
  baseURL?: string

  /**
   * Custom headers
   */
  headers?: HeadersInit

  /**
   * Response type
   * @default 'json'
   */
  responseType?: 'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData'

  /**
   * Automatically parse JSON responses
   * @default true
   */
  parseJson?: boolean

  /**
   * Validate response status (throw on non-2xx)
   * @default true
   */
  validateStatus?: boolean | ((status: number) => boolean)

  /**
   * Retry configuration
   */
  retry?: {
    /**
     * Number of retries
     * @default 0
     */
    count?: number

    /**
     * Delay between retries in milliseconds
     * @default 1000
     */
    delay?: number

    /**
     * Exponential backoff multiplier
     * @default 1
     */
    backoff?: number

    /**
     * Which status codes to retry
     * @default [408, 429, 500, 502, 503, 504]
     */
    retryOn?: number[]
  }

  /**
   * Transform request before sending
   */
  transformRequest?: (config: FetchBaseConfig<TBody>) => FetchBaseConfig<TBody> | Promise<FetchBaseConfig<TBody>>

  /**
   * Transform response after receiving
   */
  transformResponse?: <T>(response: Response, data: T) => T | Promise<T>
}

/**
 * Response wrapper
 */
export interface FetchResponse<T = unknown> {
  /**
   * Response data
   */
  data: T

  /**
   * HTTP status code
   */
  status: number

  /**
   * HTTP status text
   */
  statusText: string

  /**
   * Response headers
   */
  headers: Headers

  /**
   * Original fetch Response object
   */
  raw: Response

  /**
   * Request URL
   */
  url: string

  /**
   * Whether response is OK (status 200-299)
   */
  ok: boolean
}

/**
 * Fetch error
 */
export class FetchError extends Error {
  constructor(
    message: string,
    public readonly response?: Response,
    public readonly status?: number,
    public readonly statusText?: string,
    public readonly data?: unknown
  ) {
    super(message)
    this.name = 'FetchError'

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (typeof (Error as typeof Error & { captureStackTrace?: unknown }).captureStackTrace === 'function') {
      ;(Error as typeof Error & { captureStackTrace: (target: object, constructor: Function) => void }).captureStackTrace(this, FetchError)
    }
  }
}

/**
 * Timeout error
 */
export class TimeoutError extends FetchError {
  constructor(message: string, public readonly timeoutMs: number) {
    super(message)
    this.name = 'TimeoutError'
  }
}

/**
 * Fetch instance configuration
 */
export interface FetchConfig extends Omit<FetchBaseConfig, 'body'> {
  /**
   * Base URL for all requests
   */
  baseURL?: string

  /**
   * Default headers for all requests
   */
  headers?: HeadersInit

  /**
   * Request interceptor
   */
  onRequest?: (config: FetchBaseConfig) => FetchBaseConfig | Promise<FetchBaseConfig>

  /**
   * Response interceptor
   */
  onResponse?: <T>(response: FetchResponse<T>) => FetchResponse<T> | Promise<FetchResponse<T>>

  /**
   * Error interceptor
   */
  onError?: (error: FetchError) => FetchError | Promise<FetchError> | void
}
