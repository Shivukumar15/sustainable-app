import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach JWT token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth
export const registerUser = (data: { username: string; email: string; password: string }) =>
  api.post('/auth/signup', data)

export const loginUser = (data: { email: string; password: string }) =>
  api.post('/auth/login', data)

// Products
export const getProducts = (params?: { category?: string; minEcoScore?: number; search?: string }) =>
  api.get('/products', { params })

export const getProductById = (id: string) =>
  api.get(`/products/${id}`)

export const addPurchase = (data: { userId: string; productId: string; quantity: number }) =>
  api.post('/products/purchase', data)

export const getUserEcoScore = (userId: string) =>
  api.get(`/products/user/${userId}/eco-score`)

export const getTips = () =>
  api.get('/products/tips/all')

// Supply Chain
export const getSupplyChainGraph = (productId: string) =>
  api.get(`/supply-chain/${productId}`)

export const getSupplyChainActors = () =>
  api.get('/supply-chain/actors')

export const getSupplyChainAnomalies = (productId: string) =>
  api.get(`/supply-chain/${productId}/anomalies`)

export default api
