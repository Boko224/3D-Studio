import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import Button from '../components/Button';
import Input from '../components/Input';
import { Mail, Lock, User } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const { login, register } = useUser();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        if (!formData.email || !formData.password) {
          throw new Error('Моля, попълни имейл и парола!');
        }
        await login(formData.email, formData.password);
        navigate('/profile');
      } else {
        // Register
        if (!formData.email || !formData.password || !formData.displayName) {
          throw new Error('Моля, попълни всички полета!');
        }
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Паролите не съвпадат!');
        }
        if (formData.password.length < 6) {
          throw new Error('Паролата трябва да е поне 6 символа!');
        }
        await register(formData.email, formData.password, formData.displayName);
        navigate('/profile');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setFormData({ email: '', password: '', confirmPassword: '', displayName: '' });
  };

  return (
    <div className="w-full">
      {/* Header */}
      <section className="hero-bg text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold">
            {isLogin ? 'Вход' : 'Регистрация'}
          </h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-gray-50 min-h-screen">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Display Name (Register only) */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <User size={18} className="inline mr-2" />
                    Име
                  </label>
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    placeholder="Твоето име"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Mail size={18} className="inline mr-2" />
                  Имейл
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="твой@email.com"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Lock size={18} className="inline mr-2" />
                  Парола
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              {/* Confirm Password (Register only) */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Lock size={18} className="inline mr-2" />
                    Потвърди парола
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <p className="text-red-700 text-sm font-semibold">❌ {error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                className="w-full text-lg py-3 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? '⏳ Обработка...' : isLogin ? '✅ Вход' : '✅ Регистрирай се'}
              </Button>

              {/* Toggle Mode */}
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-gray-600 mb-3">
                  {isLogin ? 'Нямаш профил?' : 'Вече имаш профил?'}
                </p>
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-indigo-600 font-bold hover:text-indigo-700 transition"
                >
                  {isLogin ? 'Регистрирай се тук' : 'Влез тук'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Auth;
