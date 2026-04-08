import { useEffect, useState, useCallback, type ReactNode } from 'react';
import {
  Package, Link2, ShoppingCart, Star, ChevronDown,
  CheckCircle, XCircle, Loader2, TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import type { Product, User } from '../types';
import ProductCard from '../components/ProductCard';
import SupplyChainTracker from '../components/SupplyChainTracker';
import { SkeletonGrid } from '../components/SkeletonCard';
import ErrorMessage from '../components/ErrorMessage';

type Tab = 'products' | 'supply-chain' | 'add-product';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);

  const [selectedProductId, setSelectedProductId] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // ignore parse error
      }
    }
    fetchProducts();
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get<Product[]>('/products');
      setProducts(res.data);
    } catch {
      setError('Failed to load products.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setAddSuccess('');
    setAddLoading(true);

    try {
      if (!user) throw new Error('No user found');
      await api.post('/products/purchase', {
        userId: user.id,
        productId: selectedProductId,
        quantity: 1,
      });
      setAddSuccess('Purchase recorded successfully!');
      toast.success('Purchase recorded successfully!');
      fetchProducts();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        const msg = axiosErr.response?.data?.message || 'Failed to add purchase.';
        setAddError(msg);
        toast.error(msg);
      } else {
        setAddError('Network error. Please try again.');
        toast.error('Network error. Please try again.');
      }
    } finally {
      setAddLoading(false);
    }
  };

  const tabs: { key: Tab; label: string; icon: ReactNode }[] = [
    { key: 'products', label: 'Products', icon: <Package className="w-4 h-4" /> },
    { key: 'supply-chain', label: 'Supply Chain', icon: <Link2 className="w-4 h-4" /> },
    { key: 'add-product', label: 'Add Purchase', icon: <ShoppingCart className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-gray-50 to-gray-100/50">
      {/* Hero header */}
      <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/3" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Dashboard</h1>
              {user && (
                <p className="text-emerald-200 mt-1 text-sm sm:text-base">
                  Welcome back, <span className="font-bold text-white">{user.username}</span>
                </p>
              )}
            </div>
            {user && (
              <div className="flex items-center gap-3">
                <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/20">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-emerald-200 font-semibold">Eco Score</p>
                      <p className="text-xl font-black -mt-0.5">{user.ecoScore}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/20">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-300" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-emerald-200 font-semibold">Products</p>
                      <p className="text-xl font-black -mt-0.5">{products.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-0.5 overflow-x-auto -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 sm:px-5 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab.key
                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50/50'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Eco-Friendly Products</h2>
              <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
                {products.length} products
              </span>
            </div>
            {loading && <SkeletonGrid count={6} />}
            {error && <ErrorMessage message={error} onRetry={fetchProducts} />}
            {!loading && !error && products.length === 0 && (
              <div className="text-center py-16 animate-fade-in">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No products found.</p>
              </div>
            )}
            {!loading && !error && products.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {products.map((product, i) => (
                  <div key={product._id} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Supply Chain Tab */}
        {activeTab === 'supply-chain' && (
          <div className="animate-fade-in">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-6">Supply Chain Tracker</h2>
            <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-8 border border-gray-100">
              <SupplyChainTracker products={products} />
            </div>
          </div>
        )}

        {/* Add Purchase Tab */}
        {activeTab === 'add-product' && (
          <div className="max-w-lg mx-auto animate-fade-in">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-6">Record a Purchase</h2>
            <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 border border-gray-100">
              {addSuccess && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl mb-6 text-sm font-medium animate-fade-in">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  {addSuccess}
                </div>
              )}
              {addError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm font-medium animate-fade-in">
                  <XCircle className="w-4 h-4 flex-shrink-0" />
                  {addError}
                </div>
              )}
              <form onSubmit={handleAddProduct} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Product
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none appearance-none shadow-sm text-sm bg-white"
                    >
                      <option value="">-- Choose a product --</option>
                      {products.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} - ${p.price}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={addLoading || !selectedProductId}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                >
                  {addLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Recording...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      Record Purchase
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
