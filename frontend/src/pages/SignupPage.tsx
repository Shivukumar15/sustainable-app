import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, User, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import type { AuthResponse } from '../types';

interface SignupPageProps {
  onLogin: () => void;
}

export default function SignupPage({ onLogin }: SignupPageProps) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post<AuthResponse>('/auth/signup', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onLogin();
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        const msg = axiosErr.response?.data?.message || 'Signup failed. Please try again.';
        setError(msg);
        toast.error(msg);
      } else {
        setError('Network error. Please try again.');
        toast.error('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 px-4 py-8">
      <div className="w-full max-w-md animate-slide-up">
        <div className="bg-white rounded-3xl shadow-xl shadow-emerald-100/50 p-8 sm:p-10 border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-200">
              <Sprout className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mt-4">Create Account</h1>
            <p className="text-gray-500 text-sm mt-1">Join the sustainability movement</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm font-medium animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition shadow-sm text-sm"
                  placeholder="Choose a username"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition shadow-sm text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition shadow-sm text-sm"
                  placeholder="Min. 6 characters"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
