import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-emerald-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <span className="text-2xl">🌿</span>
            <span>EcoTrack</span>
          </Link>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-600 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/products"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-600 transition-colors"
                >
                  Products
                </Link>
                <Link
                  to="/supply-chain"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-600 transition-colors"
                >
                  Supply Chain
                </Link>
                <span className="text-emerald-200 text-sm hidden sm:inline">
                  Hi, {user?.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="ml-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 rounded-md text-sm font-medium transition-colors cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-md text-sm font-medium hover:bg-emerald-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-white text-emerald-700 rounded-md text-sm font-semibold hover:bg-emerald-50 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
