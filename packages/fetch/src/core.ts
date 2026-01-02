import fetch from 'cross-fetch'
import type {
  FetchConfig,
  FetcherConfig,
  FetchError,
  FetchResponse,
  Result,
} from './types'
import { FetchError as FetchErrorClass, TimeoutError } from './types'
import {
  buildURL,
  getContentType,
  mergeConfig,
  mergeHeaders,
  serializeBody,
  shouldRetry,
  sleep,
} from './utils'

/**
 * Core fetch implementation with type safety and error handling
 */
export class Fetcher {
  private readonly config: FetcherConfig

  constructor(config: FetcherConfig = {}) {
    this.config = config
  }

  /**
   * Generic request method
   */
  async request<TResponse = unknown, TBody = unknown>(
    url: string,
    config?: FetchConfig<TBody>
  ): Promise<Result<FetchResponse<TResponse>, FetchError>> {
    try {
      const response = await this.executeRequest<TResponse, TBody>(url, config)
      return { success: true, data: response, error: null }
    } catch (error) {
      const fetchError = error instanceof FetchErrorClass ? error : this.createError(error)

      // Call error interceptor if provided
      if (this.config.onError) {
        await this.config.onError(fetchError)
      }

      return { success: false, data: null, error: fetchError }
    }
  }

  /**
   * GET request
   */
  async get<TResponse = unknown>(
    url: string,
    config?: Omit<FetchConfig, 'method' | 'body'>
  ): Promise<Result<FetchResponse<TResponse>, FetchError>> {
    return this.request<TResponse>(url, { ...config, method: 'GET' })
  }

  /**
   * POST request
   */
  async post<TResponse = unknown, TBody = unknown>(
    url: string,
    body?: TBody,
    config?: Omit<FetchConfig<TBody>, 'method' | 'body'>
  ): Promise<Result<FetchResponse<TResponse>, FetchError>> {
    return this.request<TResponse, TBody>(url, { ...config, method: 'POST', body })
  }

  /**
   * PUT request
   */
  async put<TResponse = unknown, TBody = unknown>(
    url: string,
    body?: TBody,
    config?: Omit<FetchConfig<TBody>, 'method' | 'body'>
  ): Promise<Result<FetchResponse<TResponse>, FetchError>> {
    return this.request<TResponse, TBody>(url, { ...config, method: 'PUT', body })
  }

  /**
   * PATCH request
   */
  async patch<TResponse = unknown, TBody = unknown>(
    url: string,
    body?: TBody,
    config?: Omit<FetchConfig<TBody>, 'method' | 'body'>
  ): Promise<Result<FetchResponse<TResponse>, FetchError>> {
    return this.request<TResponse, TBody>(url, { ...config, method: 'PATCH', body })
  }

  /**
   * DELETE request
   */
  async delete<TResponse = unknown>(
    url: string,
    config?: Omit<FetchConfig, 'method' | 'body'>
  ): Promise<Result<FetchResponse<TResponse>, FetchError>> {
    return this.request<TResponse>(url, { ...config, method: 'DELETE' })
  }

  /**
   * Execute the actual request with retries
   */
  private async executeRequest<TResponse, TBody>(
    url: string,
    config?: FetchConfig<TBody>
  ): Promise<FetchResponse<TResponse>> {
    const mergedConfig = mergeConfig(this.config as FetchConfig<unknown>, config as FetchConfig<unknown>) as FetchConfig<TBody>
    const retryCount = mergedConfig.retry?.count ?? 0
    let lastError: Error | undefined

    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        return await this.performRequest<TResponse, TBody>(url, mergedConfig)
      } catch (error) {
        lastError = error as Error

        // Don't retry on last attempt
        if (attempt === retryCount) {
          throw error
        }

        // Check if we should retry based on error type
        if (error instanceof FetchErrorClass && error.status) {
          if (!shouldRetry(error.status, mergedConfig.retry?.retryOn)) {
            throw error
          }
        }

        // Calculate delay with exponential backoff
        const baseDelay = mergedConfig.retry?.delay ?? 1000
        const backoff = mergedConfig.retry?.backoff ?? 1
        const delay = baseDelay * Math.pow(backoff, attempt)

        await sleep(delay)
      }
    }

    throw lastError
  }

  /**
   * Perform a single request
   */
  private async performRequest<TResponse, TBody>(
    url: string,
    config: FetchConfig<TBody>
  ): Promise<FetchResponse<TResponse>> {
    // Build full URL
    const baseURL = config.baseURL ?? ''
    const fullURL = baseURL ? `${baseURL.replace(/\/$/, '')}/${url.replace(/^\//, '')}` : url
    const urlWithParams = buildURL(fullURL, config.params)

    // Prepare body
    const serializedBody = serializeBody(config.body)

    // Prepare headers
    const contentType = getContentType(config.body)
    const headers = mergeHeaders(
      contentType ? { 'Content-Type': contentType } : undefined,
      config.headers
    )

    // Apply request interceptor
    type AnyConfig = FetchConfig<unknown>
    let finalConfig: AnyConfig = { ...config, body: serializedBody, headers } as AnyConfig
    if (this.config.onRequest) {
      finalConfig = await this.config.onRequest(finalConfig)
    }
    if (config.transformRequest) {
      finalConfig = (await config.transformRequest(finalConfig as FetchConfig<TBody>)) as AnyConfig
    }

    // Create abort controller for timeout
    const controller = new AbortController()
    const timeoutId =
      finalConfig.timeout !== undefined
        ? setTimeout(() => controller.abort(), finalConfig.timeout)
        : undefined

    try {
      // Execute fetch
      const { method, headers: configHeaders, body, signal, ...restConfig } = finalConfig
      const response = await fetch(urlWithParams, {
        method: method ?? 'GET',
        headers: configHeaders,
        body: body as BodyInit | undefined,
        signal: controller.signal,
        ...restConfig,
      })

      // Clear timeout
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId)
      }

      // Validate status
      const validateStatus = finalConfig.validateStatus ?? true
      const isValid =
        typeof validateStatus === 'function'
          ? validateStatus(response.status)
          : validateStatus
          ? response.ok
          : true

      if (!isValid) {
        let errorData: unknown
        try {
          errorData = await this.parseResponse(response, finalConfig)
        } catch {
          errorData = await response.text()
        }

        throw new FetchErrorClass(
          `Request failed with status ${response.status}`,
          response,
          response.status,
          response.statusText,
          errorData
        )
      }

      // Parse response
      const data = await this.parseResponse<TResponse>(response, finalConfig)

      let result: FetchResponse<TResponse> = {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        raw: response,
        url: response.url,
        ok: response.ok,
      }

      // Apply response interceptor
      if (this.config.onResponse) {
        result = await this.config.onResponse(result)
      }
      if (finalConfig.transformResponse) {
        result.data = await finalConfig.transformResponse(response, result.data)
      }

      return result
    } catch (error) {
      // Clear timeout on error
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId)
      }

      // Handle abort/timeout
      if (error instanceof Error && error.name === 'AbortError') {
        throw new TimeoutError(
          `Request timeout after ${finalConfig.timeout}ms`,
          finalConfig.timeout ?? 0
        )
      }

      // Re-throw fetch errors
      if (error instanceof FetchErrorClass) {
        throw error
      }

      // Wrap other errors
      throw this.createError(error)
    }
  }

  /**
   * Parse response based on content type
   */
  private async parseResponse<T>(response: Response, config: FetchConfig): Promise<T> {
    const responseType = config.responseType ?? 'json'
    const parseJson = config.parseJson ?? true

    try {
      switch (responseType) {
        case 'json':
          return parseJson ? await response.json() : (await response.text() as T)
        case 'text':
          return (await response.text()) as T
        case 'blob':
          return (await response.blob()) as T
        case 'arrayBuffer':
          return (await response.arrayBuffer()) as T
        case 'formData':
          return (await response.formData()) as T
        default:
          return (await response.json()) as T
      }
    } catch (error) {
      throw new FetchErrorClass(
        `Failed to parse response as ${responseType}`,
        response,
        response.status,
        response.statusText
      )
    }
  }

  /**
   * Create a FetchError from unknown error
   */
  private createError(error: unknown): FetchErrorClass {
    if (error instanceof FetchErrorClass) {
      return error
    }

    if (error instanceof Error) {
      return new FetchErrorClass(error.message)
    }

    return new FetchErrorClass(String(error))
  }

  /**
   * Create a new fetcher instance with extended configuration
   */
  extend(config: FetcherConfig): Fetcher {
    return new Fetcher(mergeConfig(this.config, config) as FetcherConfig)
  }
}

/**
 * Create a fetcher instance
 */
export function createFetch(config?: FetcherConfig): Fetcher {
  return new Fetcher(config)
}
