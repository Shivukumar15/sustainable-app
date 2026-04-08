import { useEffect, useState } from 'react';
import api from '../services/api';
import type { Product, User } from '../types';
import ProductCard from '../components/ProductCard';
import SupplyChainTracker from '../components/SupplyChainTracker';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

type Tab = 'products' | 'supply-chain' | 'add-product';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);

  // Add product form
  const [addForm, setAddForm] = useState({
    name: '',
    description: '',
    category: '',
    ecoScore: '',
    imageUrl: '',
    price: '',
    carbonFootprint: '',
    waterUsage: '',
    recyclable: true,
  });
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

  const fetchProducts = async () => {
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
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setAddSuccess('');
    setAddLoading(true);

    try {
      if (!user) throw new Error('No user found');
      await api.post('/products/purchase', {
        userId: user.id,
        productId: addForm.name, // This is a simplified flow
        quantity: 1,
      });
      setAddSuccess('Purchase recorded successfully!');
      fetchProducts();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setAddError(axiosErr.response?.data?.message || 'Failed to add purchase.');
      } else {
        setAddError('Network error. Please try again.');
      }
    } finally {
      setAddLoading(false);
    }
  };

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'products', label: 'Products', icon: '\u{1F4E6}' },
    { key: 'supply-chain', label: 'Supply Chain', icon: '\u{1F517}' },
    { key: 'add-product', label: 'Add Purchase', icon: '\u{2795}' },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          {user && (
            <p className="text-emerald-100 mt-1">
              Welcome back, <span className="font-semibold text-white">{user.username}</span>
              {' '}&middot;{' '}Eco Score: <span className="font-bold text-white">{user.ecoScore}</span>
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-1.5">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">All Products</h2>
              <span className="text-sm text-gray-500">{products.length} products</span>
            </div>
            {loading && <LoadingSpinner message="Loading products..." />}
            {error && <ErrorMessage message={error} onRetry={fetchProducts} />}
            {!loading && !error && products.length === 0 && (
              <div className="text-center py-12">
                <span className="text-5xl">&#x1F4E6;</span>
                <p className="text-gray-500 mt-4">No products found.</p>
              </div>
            )}
            {!loading && !error && products.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Supply Chain Tab */}
        {activeTab === 'supply-chain' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Supply Chain Tracker</h2>
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <SupplyChainTracker products={products} />
            </div>
          </div>
        )}

        {/* Add Purchase Tab */}
        {activeTab === 'add-product' && (
          <div className="max-w-lg mx-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Record a Purchase</h2>
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              {addSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg mb-6 text-sm">
                  {addSuccess}
                </div>
              )}
              {addError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                  {addError}
                </div>
              )}
              <form onSubmit={handleAddProduct} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Product
                  </label>
                  <select
                    required
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  >
                    <option value="">-- Choose a product --</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} - ${p.price}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={addLoading || !addForm.name}
                  className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addLoading ? 'Recording...' : 'Record Purchase'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
