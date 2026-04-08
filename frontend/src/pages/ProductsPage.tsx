import { useCallback, useEffect, useState } from 'react'
import { getProducts, addPurchase } from '../services/api'
import { useAuth } from '../context/useAuth'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import axios from 'axios'

interface Product {
  _id: string
  name: string
  description: string
  category: string
  ecoScore: number
  price: number
  imageUrl: string
  carbonFootprint: number
  waterUsage: number
  recyclable: boolean
}

export default function ProductsPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [purchasing, setPurchasing] = useState<string | null>(null)

  const fetchProducts = useCallback(async (searchTerm?: string) => {
    setLoading(true)
    setError('')
    try {
      const params: Record<string, string> = {}
      if (searchTerm) params.search = searchTerm
      if (category) params.category = category
      const res = await getProducts(params)
      setProducts(res.data)
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to load products.')
      } else {
        setError('An unexpected error occurred.')
      }
    } finally {
      setLoading(false)
    }
  }, [category])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchProducts(search)
  }

  const handlePurchase = async (productId: string) => {
    if (!user?.id) return
    setPurchasing(productId)
    setSuccess('')
    setError('')
    try {
      await addPurchase({ userId: user.id, productId, quantity: 1 })
      setSuccess('Purchase added successfully! Your eco score has been updated.')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to add purchase.')
      } else {
        setError('An unexpected error occurred.')
      }
    } finally {
      setPurchasing(null)
    }
  }

  const categories = [...new Set(products.map((p) => p.category))].sort()

  const getEcoScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    if (score >= 40) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <p className="text-gray-500 mt-1">Browse and purchase sustainable products</p>
      </div>

      {error && <div className="mb-4"><ErrorMessage message={error} onDismiss={() => setError('')} /></div>}
      {success && (
        <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              Search
            </button>
          </form>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" />
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-6xl">📦</span>
          <p className="mt-4 text-gray-500 text-lg">No products found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-48 bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                ) : (
                  <span className="text-6xl">🌿</span>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-900 text-lg">{product.name}</h3>
                  <span className={`text-sm font-bold px-2 py-1 rounded-full ${getEcoScoreColor(product.ecoScore)}`}>
                    {product.ecoScore}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mb-3 line-clamp-2">{product.description}</p>
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{product.category}</span>
                  {product.recyclable && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Recyclable</span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <span>CO2: {product.carbonFootprint}kg</span>
                  <span>Water: {product.waterUsage}L</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-gray-900">${product.price}</span>
                  <button
                    onClick={() => handlePurchase(product._id)}
                    disabled={purchasing === product._id}
                    className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:bg-emerald-400 transition-colors cursor-pointer"
                  >
                    {purchasing === product._id ? 'Adding...' : 'Add Purchase'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
