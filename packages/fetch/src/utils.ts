import type { FetchConfig } from './types'

/**
 * Build URL with query parameters
 */
export function buildURL(url: string, params?: Record<string, string | number | boolean | undefined | null>): string {
  if (!params) return url

  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value))
    }
  })

  const queryString = searchParams.toString()
  if (!queryString) return url

  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}${queryString}`
}

/**
 * Merge headers
 */
export function mergeHeaders(...headersList: (HeadersInit | undefined)[]): Headers {
  const merged = new Headers()

  headersList.forEach((headers) => {
    if (!headers) return

    if (headers instanceof Headers) {
      headers.forEach((value, key) => {
        merged.set(key, value)
      })
    } else if (Array.isArray(headers)) {
      headers.forEach(([key, value]) => {
        merged.set(key, value)
      })
    } else {
      Object.entries(headers).forEach(([key, value]) => {
        merged.set(key, value)
      })
    }
  })

  return merged
}

/**
 * Merge configurations
 */
export function mergeConfig<T>(
  base: FetchConfig<T> | undefined,
  override: FetchConfig<T> | undefined
): FetchConfig<T> {
  if (!base) return override ?? {}
  if (!override) return base

  return {
    ...base,
    ...override,
    headers: mergeHeaders(base.headers, override.headers),
    params: { ...base.params, ...override.params },
    retry: { ...base.retry, ...override.retry },
  }
}

/**
 * Sleep utility for retries
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Check if value is plain object
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Serialize body data
 */
export function serializeBody(body: unknown): BodyInit | undefined {
  if (body === undefined || body === null) {
    return undefined
  }

  // If already a valid BodyInit type, return as-is
  if (
    typeof body === 'string' ||
    body instanceof Blob ||
    body instanceof ArrayBuffer ||
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof ReadableStream
  ) {
    return body as BodyInit
  }

  // If it's an object, JSON stringify it
  if (isPlainObject(body) || Array.isArray(body)) {
    return JSON.stringify(body)
  }

  // Convert to string as fallback
  return String(body)
}

/**
 * Get content type from body
 */
export function getContentType(body: unknown): string | undefined {
  if (body === undefined || body === null) {
    return undefined
  }

  if (typeof body === 'string') {
    return 'text/plain'
  }

  if (body instanceof FormData) {
    return undefined // Let browser set multipart/form-data with boundary
  }

  if (body instanceof URLSearchParams) {
    return 'application/x-www-form-urlencoded'
  }

  if (body instanceof Blob) {
    return body.type || 'application/octet-stream'
  }

  if (body instanceof ArrayBuffer) {
    return 'application/octet-stream'
  }

  if (isPlainObject(body) || Array.isArray(body)) {
    return 'application/json'
  }

  return undefined
}

/**
 * Should retry based on status code
 */
export function shouldRetry(status: number, retryOn?: number[]): boolean {
  const defaultRetryOn = [408, 429, 500, 502, 503, 504]
  const codes = retryOn ?? defaultRetryOn
  return codes.includes(status)
}
