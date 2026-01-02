/**
 * @rizzle/fetch - Type-safe fetch wrapper
 *
 * A modern, type-safe HTTP client with automatic error handling,
 * retry logic, and support for both browser and Node.js environments.
 *
 * @example
 * ```typescript
 * import { createFetch } from '@rizzle/fetch'
 *
 * const fetch = createFetch({
 *   baseURL: 'https://api.example.com',
 *   headers: { 'Authorization': 'Bearer token' }
 * })
 *
 * // Type-safe request with Result type (no try-catch needed!)
 * const result = await fetcher.get<User>('/users/1')
 *
 * if (result.success) {
 *   console.log(result.data.data.name)
 * } else {
 *   console.error(result.error.message)
 * }
 * ```
 */

export { Fetcher, createFetch } from './core'
export type {
  FetchConfig,
  FetcherConfig,
  FetchResponse,
  HttpMethod,
  Result,
} from './types'
export { FetchError, TimeoutError } from './types'
export {
  buildURL,
  getContentType,
  isPlainObject,
  mergeConfig,
  mergeHeaders,
  serializeBody,
  shouldRetry,
  sleep,
} from './utils'

// Create default instance for convenience
import { createFetch } from './core'

/**
 * Default fetcher instance
 *
 * @example
 * ```typescript
 * import { fetcher } from '@rizzle/fetch'
 *
 * const result = await fetcher.get('/api/data')
 * ```
 */
export const fetch = createFetch()

/**
 * Convenience method for GET requests
 */
export const get = fetch.get.bind(fetch)

/**
 * Convenience method for POST requests
 */
export const post = fetch.post.bind(fetch)

/**
 * Convenience method for PUT requests
 */
export const put = fetch.put.bind(fetch)

/**
 * Convenience method for PATCH requests
 */
export const patch = fetch.patch.bind(fetch)

/**
 * Convenience method for DELETE requests
 */
export const del = fetch.delete.bind(fetch)

/**
 * Generic request method
 */
export const request = fetch.request.bind(fetch)
