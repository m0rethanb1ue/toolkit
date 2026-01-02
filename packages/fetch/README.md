# @rizzle/fetch

> Type-safe HTTP client with automatic error handling, retry logic, and polyfill support for both browser and Node.js

[![npm version](https://img.shields.io/npm/v/@rizzle/fetch.svg)](https://www.npmjs.com/package/@rizzle/fetch)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🔒 **Type-Safe**: Full TypeScript support with generic types
- 🎯 **Error Handling**: No more try-catch blocks! Uses Result type pattern
- 🔄 **Retry Logic**: Built-in retry with exponential backoff
- ⏱️ **Timeout Support**: Request timeout with AbortController
- 🔌 **Interceptors**: Request/response/error interceptors
- 🌐 **Universal**: Works in browser and Node.js (all versions)
- 🪝 **Polyfill**: Optional global fetch polyfill utility
- 📦 **Lightweight**: Uses cross-fetch for universal compatibility
- 🎨 **Modern**: Built with ES2022+ features
- 🧪 **Well Tested**: Comprehensive test coverage

## 📦 Installation

```bash
# pnpm
pnpm add @rizzle/fetch

# npm
npm install @rizzle/fetch

# yarn
yarn add @rizzle/fetch
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { createFetch } from '@rizzle/fetch'

// Create a fetch instance
const fetch = createFetch({
  baseURL: 'https://api.example.com',
  headers: {
    'Authorization': 'Bearer your-token'
  }
})

// Make a type-safe request (no try-catch needed!)
const result = await fetch.get<User>('/users/1')

if (result.success) {
  // TypeScript knows result.data is FetchResponse<User>
  console.log(result.data.data.name)
  console.log(result.data.status) // 200
} else {
  // TypeScript knows result.error is fetchror
  console.error(result.error.message)
  console.error(result.error.status)
}
```

### Convenience Methods

```typescript
import { get, post, put, patch, del } from '@rizzle/fetch'

// GET request
const users = await get<User[]>('/users')

// POST request with body
const newUser = await post<User, CreateUserDto>('/users', {
  name: 'John Doe',
  email: 'john@example.com'
})

// PUT request
const updated = await put<User>('/users/1', { name: 'Jane Doe' })

// PATCH request
const patched = await patch<User>('/users/1', { email: 'new@example.com' })

// DELETE request
const deleted = await del('/users/1')
```

## 📖 API Reference

### Creating a fetch

```typescript
import { createFetch } from '@rizzle/fetch'

const fetch = createFetch({
  baseURL: 'https://api.example.com',
  headers: {
    'Authorization': 'Bearer token'
  },
  timeout: 5000,
  retry: {
    count: 3,
    delay: 1000,
    backoff: 2
  }
})
```

### Configuration Options

```typescript
interface fetchConfig {
  // Base URL for all requests
  baseURL?: string

  // Default headers
  headers?: HeadersInit

  // Request timeout in milliseconds
  timeout?: number

  // Query parameters
  params?: Record<string, string | number | boolean>

  // Response type
  responseType?: 'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData'

  // Validate response status
  validateStatus?: boolean | ((status: number) => boolean)

  // Retry configuration
  retry?: {
    count?: number        // Number of retries (default: 0)
    delay?: number        // Delay between retries in ms (default: 1000)
    backoff?: number      // Exponential backoff multiplier (default: 1)
    retryOn?: number[]    // Status codes to retry (default: [408, 429, 500, 502, 503, 504])
  }

  // Interceptors
  onRequest?: (config: FetchConfig) => FetchConfig | Promise<FetchConfig>
  onResponse?: <T>(response: FetchResponse<T>) => FetchResponse<T> | Promise<FetchResponse<T>>
  onError?: (error: fetchror) => void | fetchror | Promise<fetchror>
}
```

### Request Methods

```typescript
// Generic request
fetch.request<TResponse, TBody>(url: string, config?: FetchConfig<TBody>)

// GET
fetch.get<TResponse>(url: string, config?: FetchConfig)

// POST
fetch.post<TResponse, TBody>(url: string, body?: TBody, config?: FetchConfig<TBody>)

// PUT
fetch.put<TResponse, TBody>(url: string, body?: TBody, config?: FetchConfig<TBody>)

// PATCH
fetch.patch<TResponse, TBody>(url: string, body?: TBody, config?: FetchConfig<TBody>)

// DELETE
fetch.delete<TResponse>(url: string, config?: FetchConfig)
```

### Response Type

```typescript
interface FetchResponse<T> {
  data: T              // Response data (parsed)
  status: number       // HTTP status code
  statusText: string   // HTTP status text
  headers: Headers     // Response headers
  raw: Response        // Original Response object
  url: string          // Request URL
  ok: boolean          // Whether response is OK (200-299)
}
```

### Result Type

```typescript
type Result<T, E = Error> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: E }
```

## 🎯 Advanced Usage

### Interceptors

```typescript
const fetch = createFetch({
  baseURL: 'https://api.example.com',

  // Request interceptor
  onRequest: async (config) => {
    // Add auth token dynamically
    const token = await getAuthToken()
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`
    }
    return config
  },

  // Response interceptor
  onResponse: async (response) => {
    // Log all responses
    console.log(`${response.status} ${response.url}`)
    return response
  },

  // Error interceptor
  onError: async (error) => {
    // Handle 401 errors
    if (error.status === 401) {
      await refreshToken()
    }
  }
})
```

### Retry Logic

```typescript
const fetch = createFetch({
  retry: {
    count: 3,           // Retry up to 3 times
    delay: 1000,        // Wait 1 second between retries
    backoff: 2,         // Double the delay each time (1s, 2s, 4s)
    retryOn: [408, 429, 500, 502, 503, 504]  // Which status codes to retry
  }
})

const result = await fetch.get('/api/data')
// Will automatically retry on failure with exponential backoff
```

### Timeout

```typescript
const result = await fetch.get('/api/slow-endpoint', {
  timeout: 5000  // 5 second timeout
})

if (!result.success && result.error instanceof TimeoutError) {
  console.error('Request timed out')
}
```

### Query Parameters

```typescript
const result = await fetch.get('/users', {
  params: {
    page: 1,
    limit: 10,
    sort: 'name',
    active: true
  }
})
// Requests: /users?page=1&limit=10&sort=name&active=true
```

### Custom Validation

```typescript
const result = await fetch.get('/api/data', {
  validateStatus: (status) => status < 500  // Accept 4xx errors
})
```

### Transform Request/Response

```typescript
const fetch = createFetch({
  transformRequest: (config) => {
    // Modify request before sending
    if (config.body) {
      config.body = encrypt(config.body)
    }
    return config
  },

  transformResponse: (response, data) => {
    // Modify response after receiving
    return decrypt(data)
  }
})
```

### Extending fetch

```typescript
const basefetch = createFetch({
  baseURL: 'https://api.example.com'
})

// Create specialized fetch with additional config
const authfetch = basefetch.extend({
  headers: {
    'Authorization': 'Bearer token'
  }
})
```

## 🔌 Global Fetch Polyfill

You can optionally replace the global `fetch` with `@rizzle/fetch`:

### Auto Polyfill

```typescript
// Simply import the polyfill module
import '@rizzle/fetch/polyfill'

// Or set environment variable
// RIZZLE_FETCH_POLYFILL=auto

// Now global fetch uses @rizzle/fetch
const response = await fetch('/api/data')
```

### Manual Polyfill

```typescript
import { polyfillFetch, restoreFetch } from '@rizzle/fetch/polyfill'

// Polyfill with custom config
polyfillFetch({
  baseURL: 'https://api.example.com',
  timeout: 5000
})

// Now global fetch is enhanced
const response = await fetch('/users')

// Restore original fetch
restoreFetch()
```

## 🌐 Browser vs Node.js

`@rizzle/fetch` works seamlessly in both environments thanks to `cross-fetch`:

### Browser
```typescript
// Works with native fetch
import { get } from '@rizzle/fetch'

const result = await get('https://api.example.com/data')
```

### Node.js (All Versions)
```typescript
// Works in all Node.js versions - no polyfill needed!
// cross-fetch handles compatibility automatically
import { get } from '@rizzle/fetch'

const result = await get('https://api.example.com/data')
```

**Note**: `@rizzle/fetch` uses `cross-fetch` internally, which provides:
- Native `fetch` in Node.js 18+
- Automatic polyfill for Node.js < 18
- Consistent behavior across all environments

## 📝 Real-World Examples

### API Client

```typescript
import { createFetch } from '@rizzle/fetch'

class ApiClient {
  private fetch = createFetch({
    baseURL: 'https://api.example.com',
    timeout: 10000,
    retry: { count: 3 },
    onRequest: async (config) => {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers = {
          ...config.headers,
          'Authorization': `Bearer ${token}`
        }
      }
      return config
    },
    onError: async (error) => {
      if (error.status === 401) {
        // Redirect to login
        window.location.href = '/login'
      }
    }
  })

  async getUsers() {
    return this.fetch.get<User[]>('/users')
  }

  async createUser(data: CreateUserDto) {
    return this.fetch.post<User>('/users', data)
  }

  async updateUser(id: string, data: Partial<User>) {
    return this.fetch.patch<User>(`/users/${id}`, data)
  }

  async deleteUser(id: string) {
    return this.fetch.delete(`/users/${id}`)
  }
}
```

### File Upload

```typescript
const formData = new FormData()
formData.append('file', file)
formData.append('name', 'My File')

const result = await fetch.post<UploadResponse>('/upload', formData)

if (result.success) {
  console.log('File uploaded:', result.data.data.url)
}
```

### Download File

```typescript
const result = await fetch.get<Blob>('/files/report.pdf', {
  responseType: 'blob'
})

if (result.success) {
  const url = URL.createObjectURL(result.data.data)
  const a = document.createElement('a')
  a.href = url
  a.download = 'report.pdf'
  a.click()
}
```

## 🧪 Testing

```typescript
import { createFetch } from '@rizzle/fetch'
import { describe, it, expect } from 'vitest'

describe('API Tests', () => {
  const fetch = createFetch({
    baseURL: 'https://api.example.com'
  })

  it('should fetch users', async () => {
    const result = await fetch.get<User[]>('/users')

    expect(result.success).toBe(true)
    if (result.success) {
      expect(Array.isArray(result.data.data)).toBe(true)
    }
  })
})
```

## 🤝 Comparison with Other Libraries

| Feature | @rizzle/fetch | axios | ky | fetch |
|---------|---------------|-------|-----|------|
| Type Safety | ✅ Full | ⚠️ Partial | ✅ Full | ❌ No |
| Result Type | ✅ Yes | ❌ No | ❌ No | ❌ No |
| No try-catch | ✅ Yes | ❌ No | ❌ No | ❌ No |
| Retry Logic | ✅ Yes | ❌ No | ✅ Yes | ❌ No |
| Timeout | ✅ Yes | ✅ Yes | ✅ Yes | ⚠️ Manual |
| Interceptors | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| Size | 🪶 ~3KB | 📦 ~12KB | 🪶 ~5KB | 🪶 Native |
| Dependencies | ✅ Zero | ❌ Many | ✅ Zero | ✅ Zero |

## 📄 License

MIT © [rizzle](https://github.com/m0rethanb1ue)
