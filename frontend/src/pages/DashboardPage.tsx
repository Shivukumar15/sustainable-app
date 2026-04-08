import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { getProducts, getUserEcoScore, getTips } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import axios from 'axios'

interface Product {
  _id: string
  name: string
  category: string
  ecoScore: number
  price: number
  imageUrl: string
  carbonFootprint: number
  waterUsage: number
  recyclable: boolean
}

interface EcoScoreData {
  ecoScore: number
  totalPurchases: number
}

interface Tip {
  _id: string
  title?: string
  content?: string
  text?: string
  category?: string
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [ecoData, setEcoData] = useState<EcoScoreData | null>(null)
  const [tips, setTips] = useState<Tip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError('')
      try {
        const [productsRes, tipsRes] = await Promise.all([
          getProducts(),
          getTips(),
        ])
        setProducts(productsRes.data)
        setTips(tipsRes.data)

        if (user?.id) {
          try {
            const ecoRes = await getUserEcoScore(user.id)
            setEcoData(ecoRes.data)
          } catch {
            // User may not have eco score data yet
          }
        }
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || 'Failed to load dashboard data.')
        } else {
          setError('An unexpected error occurred.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?.id])

  if (loading) return <LoadingSpinner size="lg" />

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {error && <div className="mb-6"><ErrorMessage message={error} onDismiss={() => setError('')} /></div>}

      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.username}!
        </h1>
        <p className="text-gray-500 mt-1">Track your sustainable consumption journey</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🌍</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Eco Score</p>
              <p className="text-2xl font-bold text-emerald-600">
                {ecoData?.ecoScore ?? user?.ecoScore ?? 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🛒</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Purchases</p>
              <p className="text-2xl font-bold text-blue-600">
                {ecoData?.totalPurchases ?? user?.purchasedProducts?.length ?? 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Products Available</p>
              <p className="text-2xl font-bold text-amber-600">{products.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link
          to="/products"
          className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-xl p-6 hover:shadow-lg transition-shadow"
        >
          <h3 className="text-xl font-bold mb-2">Browse Products</h3>
          <p className="text-emerald-100">Discover sustainable products and track your impact</p>
        </Link>
        <Link
          to="/supply-chain"
          className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-xl p-6 hover:shadow-lg transition-shadow"
        >
          <h3 className="text-xl font-bold mb-2">Supply Chain</h3>
          <p className="text-blue-100">View product supply chain transparency and traceability</p>
        </Link>
      </div>

      {/* Recent Products */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Top Eco Products</h2>
          <Link to="/products" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
            View all &rarr;
          </Link>
        </div>
        {products.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No products available yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.slice(0, 6).map((product) => (
              <div key={product._id} className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    <span className="inline-block mt-1 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                      {product.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-emerald-600">{product.ecoScore}</div>
                    <div className="text-xs text-gray-400">eco score</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
                  <span>CO2: {product.carbonFootprint}kg</span>
                  <span>Water: {product.waterUsage}L</span>
                  <span>${product.price}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Eco Tips */}
      {tips.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Sustainability Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tips.slice(0, 4).map((tip) => (
              <div key={tip._id} className="bg-emerald-50 rounded-lg p-4">
                <h3 className="font-semibold text-emerald-800">{tip.title || 'Tip'}</h3>
                <p className="text-sm text-emerald-700 mt-1">{tip.content || tip.text || ''}</p>
                {tip.category && (
                  <span className="inline-block mt-2 text-xs bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full">
                    {tip.category}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
