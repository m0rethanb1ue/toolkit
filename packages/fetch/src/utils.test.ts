import { describe, it, expect } from 'vitest'
import {
  buildURL,
  mergeHeaders,
  serializeBody,
  getContentType,
  isPlainObject,
  shouldRetry,
} from './utils'

describe('Utils', () => {
  describe('buildURL', () => {
    it('should build URL without params', () => {
      const url = buildURL('https://api.example.com/users')
      expect(url).toBe('https://api.example.com/users')
    })

    it('should build URL with params', () => {
      const url = buildURL('https://api.example.com/users', {
        page: 1,
        limit: 10,
      })
      expect(url).toBe('https://api.example.com/users?page=1&limit=10')
    })

    it('should ignore null and undefined params', () => {
      const url = buildURL('https://api.example.com/users', {
        page: 1,
        limit: null,
        sort: undefined,
      })
      expect(url).toBe('https://api.example.com/users?page=1')
    })

    it('should handle existing query string', () => {
      const url = buildURL('https://api.example.com/users?foo=bar', {
        page: 1,
      })
      expect(url).toBe('https://api.example.com/users?foo=bar&page=1')
    })
  })

  describe('mergeHeaders', () => {
    it('should merge multiple headers', () => {
      const merged = mergeHeaders(
        { 'Content-Type': 'application/json' },
        { Authorization: 'Bearer token' }
      )

      expect(merged.get('Content-Type')).toBe('application/json')
      expect(merged.get('Authorization')).toBe('Bearer token')
    })

    it('should handle Headers objects', () => {
      const headers1 = new Headers({ 'Content-Type': 'application/json' })
      const headers2 = new Headers({ Authorization: 'Bearer token' })

      const merged = mergeHeaders(headers1, headers2)

      expect(merged.get('Content-Type')).toBe('application/json')
      expect(merged.get('Authorization')).toBe('Bearer token')
    })

    it('should override headers', () => {
      const merged = mergeHeaders(
        { 'Content-Type': 'text/plain' },
        { 'Content-Type': 'application/json' }
      )

      expect(merged.get('Content-Type')).toBe('application/json')
    })
  })

  describe('serializeBody', () => {
    it('should serialize plain object', () => {
      const body = serializeBody({ name: 'John' })
      expect(body).toBe('{"name":"John"}')
    })

    it('should serialize array', () => {
      const body = serializeBody([1, 2, 3])
      expect(body).toBe('[1,2,3]')
    })

    it('should return string as-is', () => {
      const body = serializeBody('hello')
      expect(body).toBe('hello')
    })

    it('should return FormData as-is', () => {
      const formData = new FormData()
      const body = serializeBody(formData)
      expect(body).toBe(formData)
    })

    it('should return undefined for null/undefined', () => {
      expect(serializeBody(null)).toBeUndefined()
      expect(serializeBody(undefined)).toBeUndefined()
    })
  })

  describe('getContentType', () => {
    it('should get content type for JSON', () => {
      const contentType = getContentType({ name: 'John' })
      expect(contentType).toBe('application/json')
    })

    it('should get content type for string', () => {
      const contentType = getContentType('hello')
      expect(contentType).toBe('text/plain')
    })

    it('should get content type for FormData', () => {
      const contentType = getContentType(new FormData())
      expect(contentType).toBeUndefined() // Browser sets boundary
    })

    it('should get content type for URLSearchParams', () => {
      const contentType = getContentType(new URLSearchParams())
      expect(contentType).toBe('application/x-www-form-urlencoded')
    })
  })

  describe('isPlainObject', () => {
    it('should identify plain objects', () => {
      expect(isPlainObject({})).toBe(true)
      expect(isPlainObject({ name: 'John' })).toBe(true)
    })

    it('should reject non-plain objects', () => {
      expect(isPlainObject([])).toBe(false)
      expect(isPlainObject(null)).toBe(false)
      expect(isPlainObject('string')).toBe(false)
      expect(isPlainObject(123)).toBe(false)
    })
  })

  describe('shouldRetry', () => {
    it('should retry on default status codes', () => {
      expect(shouldRetry(500)).toBe(true)
      expect(shouldRetry(502)).toBe(true)
      expect(shouldRetry(503)).toBe(true)
      expect(shouldRetry(429)).toBe(true)
    })

    it('should not retry on success codes', () => {
      expect(shouldRetry(200)).toBe(false)
      expect(shouldRetry(201)).toBe(false)
    })

    it('should respect custom retry codes', () => {
      expect(shouldRetry(500, [500])).toBe(true)
      expect(shouldRetry(502, [500])).toBe(false)
    })
  })
})
