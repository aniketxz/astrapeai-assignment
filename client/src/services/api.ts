import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (email: string, password: string) =>
    api.post('/auth/register', { email, password }),
}

export const itemsAPI = {
  getItems: (filters?: {
    category?: string
    minPrice?: number
    maxPrice?: number
    search?: string
  }) => {
    const params = new URLSearchParams()
    if (filters?.category) params.append('category', filters.category)
    if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString())
    if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString())
    if (filters?.search) params.append('search', filters.search)

    return api.get(`/items?${params.toString()}`)
  },
  getItem: (id: number) => api.get(`/items/${id}`),
}

export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (itemId: number, quantity: number) =>
    api.post('/cart/add', { itemId, quantity }),
  updateCartItem: (itemId: number, quantity: number) =>
    api.put('/cart/update', { itemId, quantity }),
  removeFromCart: (itemId: number) =>
    api.delete(`/cart/remove/${itemId}`),
  clearCart: () => api.delete('/cart/clear'),
}

export default api
