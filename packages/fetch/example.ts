/**
 * @rizzle/fetch - Quick Start Examples
 *
 * Run with: tsx example.ts
 */

import { createFetch, get, post } from './src/index'

// Example 1: Simple GET request
async function simpleGet() {
  console.log('\n📌 Example 1: Simple GET Request')

  const result = await get('https://jsonplaceholder.typicode.com/users/1')

  if (result.success) {
    console.log('✅ Success!')
    console.log('User:', result.data.data)
    console.log('Status:', result.data.status)
  } else {
    console.error('❌ Error:', result.error.message)
  }
}

// Example 2: POST with body
async function postWithBody() {
  console.log('\n📌 Example 2: POST with Body')

  interface Post {
    id: number
    title: string
    body: string
    userId: number
  }

  const result = await post<Post>('https://jsonplaceholder.typicode.com/posts', {
    title: 'My New Post',
    body: 'This is the content',
    userId: 1,
  })

  if (result.success) {
    console.log('✅ Created!')
    console.log('Post ID:', result.data.data.id)
    console.log('Title:', result.data.data.title)
  } else {
    console.error('❌ Error:', result.error.message)
  }
}

// Example 3: Configured fetcher with interceptors
async function configuredFetcher() {
  console.log('\n📌 Example 3: Configured Fetcher with Interceptors')

  const api = createFetch({
    baseURL: 'https://jsonplaceholder.typicode.com',
    timeout: 5000,
    retry: {
      count: 2,
      delay: 1000,
    },
    onRequest: async (config) => {
      console.log(`→ Sending request to: ${config.baseURL}`)
      return config
    },
    onResponse: async (response) => {
      console.log(`← Received response: ${response.status}`)
      return response
    },
  })

  interface User {
    id: number
    name: string
    email: string
  }

  const result = await api.get<User[]>('/users', {
    params: {
      _limit: 3,
    },
  })

  if (result.success) {
    console.log('✅ Success!')
    console.log(`Found ${result.data.data.length} users:`)
    result.data.data.forEach((user) => {
      console.log(`  - ${user.name} (${user.email})`)
    })
  }
}

// Example 4: Error handling
async function errorHandling() {
  console.log('\n📌 Example 4: Error Handling')

  const result = await get('https://jsonplaceholder.typicode.com/users/999999')

  if (result.success) {
    console.log('✅ Success:', result.data.data)
  } else {
    console.log('❌ Error occurred:')
    console.log('  Message:', result.error.message)
    console.log('  Status:', result.error.status)
    console.log('  Status Text:', result.error.statusText)
  }
}

// Example 5: Type-safe API client
class UserAPI {
  private fetcher = createFetch({
    baseURL: 'https://jsonplaceholder.typicode.com',
  })

  async getAllUsers(limit = 5) {
    interface User {
      id: number
      name: string
      email: string
      username: string
    }

    return this.fetcher.get<User[]>('/users', {
      params: { _limit: limit },
    })
  }

  async getUserById(id: number) {
    interface User {
      id: number
      name: string
      email: string
    }

    return this.fetcher.get<User>(`/users/${id}`)
  }

  async createPost(userId: number, title: string, body: string) {
    interface Post {
      id: number
      userId: number
      title: string
      body: string
    }

    return this.fetcher.post<Post>('/posts', {
      userId,
      title,
      body,
    })
  }
}

async function apiClientExample() {
  console.log('\n📌 Example 5: Type-Safe API Client')

  const userAPI = new UserAPI()

  const usersResult = await userAPI.getAllUsers(3)

  if (usersResult.success) {
    console.log('✅ Fetched users:')
    usersResult.data.data.forEach((user) => {
      console.log(`  - ${user.name} (@${user.username})`)
    })
  }

  const userResult = await userAPI.getUserById(1)

  if (userResult.success) {
    console.log('\n✅ Fetched user #1:')
    console.log(`  Name: ${userResult.data.data.name}`)
    console.log(`  Email: ${userResult.data.data.email}`)
  }
}

// Run all examples
async function main() {
  console.log('🚀 @rizzle/fetch - Examples\n')
  console.log('=' .repeat(50))

  try {
    await simpleGet()
    await postWithBody()
    await configuredFetcher()
    await errorHandling()
    await apiClientExample()

    console.log('\n' + '='.repeat(50))
    console.log('\n✅ All examples completed!')
  } catch (error) {
    console.error('\n❌ Unexpected error:', error)
  }
}

// Run if executed directly
// eslint-disable-next-line no-restricted-globals
// @ts-ignore
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
