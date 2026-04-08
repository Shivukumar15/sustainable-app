import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, LayoutDashboard, LogOut, LogIn, UserPlus, Menu, X } from 'lucide-react';

interface NavbarProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

export default function Navbar({ isAuthenticated, onLogout }: NavbarProps) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    onLogout();
    setMobileOpen(false);
    navigate('/login');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
              EcoTrack
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 text-gray-600 hover:text-emerald-600 px-3 py-2 rounded-lg hover:bg-emerald-50 font-medium transition-all text-sm"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg font-medium transition-all text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 text-gray-600 hover:text-emerald-600 px-3 py-2 rounded-lg hover:bg-emerald-50 font-medium transition-all text-sm"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 px-4 py-2 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all text-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="sm:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="sm:hidden pb-4 pt-2 border-t border-gray-100 animate-fade-in">
            <div className="flex flex-col gap-1">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 px-3 py-3 rounded-lg font-medium transition-all"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-3 py-3 rounded-lg font-medium transition-all text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 px-3 py-3 rounded-lg font-medium transition-all"
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3 py-3 rounded-lg font-semibold transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
