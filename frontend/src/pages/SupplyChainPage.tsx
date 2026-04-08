import { useEffect, useState } from 'react'
import { getProducts, getSupplyChainGraph, getSupplyChainActors } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import axios from 'axios'

interface Product {
  _id: string
  name: string
  category: string
}

interface Actor {
  _id: string
  name: string
  actorType: string
  location?: string
}

interface SupplyChainNode {
  id: string
  name: string
  actorType: string
}

interface SupplyChainEdge {
  movementId: string
  from: string
  to: string
  occurredAt: string
  quantity: number
  movementType: string
  notes?: string
  isVerifiedOnChain: boolean
  anomalyScore?: number
  anomalyFlagged?: boolean
  needsReview?: boolean
  suspicious?: boolean
  blockchainTxHash?: string
}

interface SupplyChainData {
  productId: string
  nodes: SupplyChainNode[]
  edges: SupplyChainEdge[]
}

export default function SupplyChainPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [actors, setActors] = useState<Actor[]>([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [supplyChainData, setSupplyChainData] = useState<SupplyChainData | null>(null)
  const [loading, setLoading] = useState(true)
  const [chainLoading, setChainLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchInitial = async () => {
      setLoading(true)
      try {
        const [productsRes, actorsRes] = await Promise.all([
          getProducts(),
          getSupplyChainActors(),
        ])
        setProducts(productsRes.data)
        setActors(actorsRes.data.actors || [])
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || 'Failed to load data.')
        } else {
          setError('An unexpected error occurred.')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchInitial()
  }, [])

  const handleProductSelect = async (productId: string) => {
    setSelectedProduct(productId)
    setSupplyChainData(null)
    if (!productId) return

    setChainLoading(true)
    setError('')
    try {
      const res = await getSupplyChainGraph(productId)
      setSupplyChainData(res.data)
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to load supply chain data.')
      } else {
        setError('An unexpected error occurred.')
      }
    } finally {
      setChainLoading(false)
    }
  }

  const getActorTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      supplier: '🏭',
      manufacturer: '⚙️',
      distributor: '🚛',
      retailer: '🏪',
      consumer: '👤',
    }
    return icons[type] || '📍'
  }

  const getActorTypeBg = (type: string) => {
    const colors: Record<string, string> = {
      supplier: 'bg-purple-100 text-purple-700',
      manufacturer: 'bg-blue-100 text-blue-700',
      distributor: 'bg-amber-100 text-amber-700',
      retailer: 'bg-emerald-100 text-emerald-700',
      consumer: 'bg-gray-100 text-gray-700',
    }
    return colors[type] || 'bg-gray-100 text-gray-700'
  }

  if (loading) return <LoadingSpinner size="lg" />

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Supply Chain Transparency</h1>
        <p className="text-gray-500 mt-1">Track product journeys from source to shelf</p>
      </div>

      {error && <div className="mb-4"><ErrorMessage message={error} onDismiss={() => setError('')} /></div>}

      {/* Actors Overview */}
      {actors.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Supply Chain Actors</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {actors.map((actor) => (
              <div key={actor._id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                <span className="text-2xl">{getActorTypeIcon(actor.actorType)}</span>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{actor.name}</p>
                  <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${getActorTypeBg(actor.actorType)}`}>
                    {actor.actorType}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Product Supply Chain</h2>
        <select
          value={selectedProduct}
          onChange={(e) => handleProductSelect(e.target.value)}
          className="w-full sm:w-auto px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none cursor-pointer"
        >
          <option value="">Select a product to view its supply chain</option>
          {products.map((product) => (
            <option key={product._id} value={product._id}>
              {product.name} ({product.category})
            </option>
          ))}
        </select>
      </div>

      {chainLoading && <LoadingSpinner />}

      {/* Supply Chain Graph */}
      {supplyChainData && !chainLoading && (
        <div className="space-y-6">
          {supplyChainData.nodes.length === 0 && supplyChainData.edges.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <span className="text-6xl">🔗</span>
              <p className="mt-4 text-gray-500 text-lg">No supply chain data available for this product yet.</p>
            </div>
          ) : (
            <>
              {/* Nodes */}
              {supplyChainData.nodes.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Chain Participants</h3>
                  <div className="flex flex-wrap gap-3">
                    {supplyChainData.nodes.map((node) => (
                      <div key={node.id} className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-gray-50">
                        <span>{getActorTypeIcon(node.actorType)}</span>
                        <span className="font-medium text-sm">{node.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getActorTypeBg(node.actorType)}`}>
                          {node.actorType}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Movements */}
              {supplyChainData.edges.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Movement History</h3>
                  <div className="space-y-4">
                    {supplyChainData.edges.map((edge) => {
                      const fromNode = supplyChainData.nodes.find((n) => n.id === edge.from)
                      const toNode = supplyChainData.nodes.find((n) => n.id === edge.to)
                      return (
                        <div
                          key={edge.movementId}
                          className={`p-4 rounded-lg border ${
                            edge.suspicious
                              ? 'border-red-200 bg-red-50'
                              : edge.isVerifiedOnChain
                                ? 'border-emerald-200 bg-emerald-50'
                                : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <div className="flex items-center gap-2">
                              <span>{getActorTypeIcon(fromNode?.actorType || '')}</span>
                              <span className="font-medium">{fromNode?.name || 'Unknown'}</span>
                            </div>
                            <span className="text-gray-400 text-xl">&rarr;</span>
                            <div className="flex items-center gap-2">
                              <span>{getActorTypeIcon(toNode?.actorType || '')}</span>
                              <span className="font-medium">{toNode?.name || 'Unknown'}</span>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                            <span className="text-gray-500">
                              Qty: {edge.quantity}
                            </span>
                            <span className="text-gray-500">
                              {new Date(edge.occurredAt).toLocaleDateString()}
                            </span>
                            <span className="text-gray-500">
                              Type: {edge.movementType}
                            </span>
                            {edge.isVerifiedOnChain ? (
                              <span className="bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                                Verified on Chain
                              </span>
                            ) : (
                              <span className="bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full font-medium">
                                Unverified
                              </span>
                            )}
                            {edge.anomalyFlagged && (
                              <span className="bg-red-200 text-red-800 px-2 py-0.5 rounded-full font-medium">
                                Anomaly Flagged
                              </span>
                            )}
                          </div>
                          {edge.notes && (
                            <p className="mt-2 text-sm text-gray-600">{edge.notes}</p>
                          )}
                          {edge.blockchainTxHash && (
                            <p className="mt-1 text-xs text-gray-400 font-mono truncate">
                              TX: {edge.blockchainTxHash}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
