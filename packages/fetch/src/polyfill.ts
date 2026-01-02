/**
 * Polyfill utility to replace global fetch with @rizzle/fetch
 *
 * This module provides utilities to polyfill the global fetch API
 * with the enhanced @rizzle/fetch implementation.
 *
 * @example
 * ```typescript
 * // Polyfill global fetch
 * import '@rizzle/fetch/polyfill'
 *
 * // Now global fetch uses @rizzle/fetch
 * const result = await fetch('/api/data')
 * ```
 *
 * @example
 * ```typescript
 * // Manual polyfill with custom config
 * import { polyfillFetch, restoreFetch } from '@rizzle/fetch/polyfill'
 *
 * polyfillFetch({
 *   baseURL: 'https://api.example.com',
 *   timeout: 5000
 * })
 *
 * // Later, restore original fetch
 * restoreFetch()
 * ```
 */

import fetch from 'cross-fetch'
import { createFetch } from './core'
import type { FetcherConfig, FetchConfig } from './types'

// Store original fetch
let originalFetch: typeof globalThis.fetch | undefined

/**
 * Check if fetch is available in global scope
 */
function hasFetch(): boolean {
  return typeof globalThis !== 'undefined' && typeof globalThis.fetch === 'function'
}

/**
 * Ensure fetch is available by using cross-fetch as fallback
 */
function ensureFetch(): typeof fetch {
  return (typeof globalThis !== 'undefined' && typeof globalThis.fetch === 'function')
    ? globalThis.fetch
    : fetch
}

/**
 * Polyfill global fetch with @rizzle/fetch
 *
 * @param config - Optional configuration for the fetcher
 * @returns true if polyfill was applied, false if fetch is not available
 *
 * @example
 * ```typescript
 * import { polyfillFetch } from '@rizzle/fetch/polyfill'
 *
 * polyfillFetch({
 *   baseURL: 'https://api.example.com',
 *   timeout: 5000,
 *   headers: {
 *     'Authorization': 'Bearer token'
 *   }
 * })
 * ```
 */
export function polyfillFetch(config?: FetcherConfig): boolean {
  // Store original fetch if not already stored (may be undefined in older Node.js)
  if (!originalFetch && hasFetch()) {
    originalFetch = globalThis.fetch
  }

  const fetcher = createFetch(config)

  // Replace global fetch
  globalThis.fetch = async function (
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    // Convert input to URL string
    const url = input instanceof Request ? input.url : String(input)

    // Merge init with config
    const fetchConfig: FetchConfig = {
      ...init,
      method: (init?.method as FetchConfig['method']) ?? 'GET',
      headers: init?.headers,
      body: init?.body,
      signal: init?.signal,
    }

    // Execute request
    const result = await fetcher.request(url, fetchConfig)

    // Return raw Response object for compatibility
    if (result.success) {
      return result.data.raw
    }

    // Throw error to match fetch behavior
    throw result.error
  }

  return true
}

/**
 * Restore original fetch
 *
 * @returns true if original fetch was restored, false if no original fetch exists
 *
 * @example
 * ```typescript
 * import { restoreFetch } from '@rizzle/fetch/polyfill'
 *
 * restoreFetch()
 * ```
 */
export function restoreFetch(): boolean {
  if (!originalFetch) {
    // If there was no original fetch, try to remove the polyfilled one
    if (typeof globalThis !== 'undefined' && 'fetch' in globalThis) {
      delete (globalThis as any).fetch
    }
    return false
  }

  globalThis.fetch = originalFetch
  originalFetch = undefined
  return true
}

/**
 * Check if fetch has been polyfilled
 *
 * @returns true if fetch has been polyfilled
 */
export function isPolyfilled(): boolean {
  return originalFetch !== undefined
}

// Auto-polyfill when module is imported
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getProcessEnv = (): Record<string, string | undefined> | undefined => {
  try {
    return (globalThis as any).process?.env
  } catch {
    return undefined
  }
}

const env = getProcessEnv()
const isTestEnv = env?.NODE_ENV === 'test'
const shouldAutoPolyfill = env?.RIZZLE_FETCH_POLYFILL === 'auto'

// Auto-polyfill if enabled, works even without global fetch thanks to cross-fetch
if (!isTestEnv && shouldAutoPolyfill) {
  polyfillFetch()
}
