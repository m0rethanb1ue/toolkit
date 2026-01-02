import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createFetch } from './core'
import { FetchError, TimeoutError } from './types'

// Mock global fetch
const mockFetch = vi.fn()
global.fetch = mockFetch as never

describe('Fetcher', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Basic Requests', () => {
    it('should make GET request', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        url: 'https://api.example.com/users',
        json: async () => ({ name: 'John' }),
      }
      mockFetch.mockResolvedValueOnce(mockResponse)

      const fetcher = createFetch()
      const result = await fetcher.get<{ name: string }>('https://api.example.com/users')

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.data.name).toBe('John')
        expect(result.data.status).toBe(200)
      }
    })

    it('should make POST request with body', async () => {
      const mockResponse = {
        ok: true,
        status: 201,
        statusText: 'Created',
        headers: new Headers(),
        url: 'https://api.example.com/users',
        json: async () => ({ id: 1, name: 'John' }),
      }
      mockFetch.mockResolvedValueOnce(mockResponse)

      const fetcher = createFetch()
      const body = { name: 'John' }
      const result = await fetcher.post<{ id: number; name: string }>(
        'https://api.example.com/users',
        body
      )

      expect(result.success).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(body),
        })
      )
    })
  })

  describe('Error Handling', () => {
    it('should return error for failed request', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers(),
        url: 'https://api.example.com/users/999',
        json: async () => ({ error: 'User not found' }),
        text: async () => 'User not found',
      }
      mockFetch.mockResolvedValueOnce(mockResponse)

      const fetcher = createFetch()
      const result = await fetcher.get('https://api.example.com/users/999')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeInstanceOf(FetchError)
        expect(result.error.status).toBe(404)
      }
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const fetcher = createFetch()
      const result = await fetcher.get('https://api.example.com/users')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toContain('Network error')
      }
    })
  })

  describe('Configuration', () => {
    it('should use baseURL', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        url: 'https://api.example.com/users',
        json: async () => ({}),
      }
      mockFetch.mockResolvedValueOnce(mockResponse)

      const fetcher = createFetch({ baseURL: 'https://api.example.com' })
      await fetcher.get('/users')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users',
        expect.any(Object)
      )
    })

    it('should add query parameters', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        url: 'https://api.example.com/users?page=1&limit=10',
        json: async () => ({}),
      }
      mockFetch.mockResolvedValueOnce(mockResponse)

      const fetcher = createFetch()
      await fetcher.get('https://api.example.com/users', {
        params: { page: 1, limit: 10 },
      })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users?page=1&limit=10',
        expect.any(Object)
      )
    })

    it('should add headers', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        url: 'https://api.example.com/users',
        json: async () => ({}),
      }
      mockFetch.mockResolvedValueOnce(mockResponse)

      const fetcher = createFetch({
        headers: { Authorization: 'Bearer token' },
      })
      await fetcher.get('https://api.example.com/users')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users',
        expect.objectContaining({
          headers: expect.any(Headers),
        })
      )
    })
  })

  describe('Interceptors', () => {
    it('should call request interceptor', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        url: 'https://api.example.com/users',
        json: async () => ({}),
      }
      mockFetch.mockResolvedValueOnce(mockResponse)

      const onRequest = vi.fn((config) => {
        config.headers = { ...config.headers, 'X-Custom': 'value' }
        return config
      })

      const fetcher = createFetch({ onRequest })
      await fetcher.get('https://api.example.com/users')

      expect(onRequest).toHaveBeenCalled()
    })

    it('should call response interceptor', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        url: 'https://api.example.com/users',
        json: async () => ({ name: 'John' }),
      }
      mockFetch.mockResolvedValueOnce(mockResponse)

      const onResponse = vi.fn((response) => response)

      const fetcher = createFetch({ onResponse })
      await fetcher.get('https://api.example.com/users')

      expect(onResponse).toHaveBeenCalled()
    })

    it('should call error interceptor', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Headers(),
        url: 'https://api.example.com/users',
        json: async () => ({}),
        text: async () => 'Error',
      }
      mockFetch.mockResolvedValueOnce(mockResponse)

      const onError = vi.fn()

      const fetcher = createFetch({ onError })
      await fetcher.get('https://api.example.com/users')

      expect(onError).toHaveBeenCalled()
    })
  })

  describe('Timeout', () => {
    it('should timeout long requests', async () => {
      // Mock a slow response
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                status: 200,
                statusText: 'OK',
                headers: new Headers(),
                url: 'https://api.example.com/slow',
                json: async () => ({}),
              })
            }, 2000)
          })
      )

      const fetcher = createFetch()
      const result = await fetcher.get('https://api.example.com/slow', {
        timeout: 100,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeInstanceOf(TimeoutError)
      }
    }, 10000)
  })
})
