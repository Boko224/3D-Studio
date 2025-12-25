import React from 'react';
import { ShoppingCart, Menu, X, User, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useUser } from '../context/UserContext';
import { useState } from 'react';

const Navbar = () => {
  const { cartItems, toggleMiniCart } = useCart();
  const { wishlistCount } = useWishlist();
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const cartCount = cartItems.length;

  return (
    <nav className="bg-white shadow-md fixed w-full z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src="/ChatGPT Image 21.12.2025 г., 15_35_14 (1).png" alt="3D Studio Logo" className="h-14 -mr-3" />
            <span className="text-2xl font-bold text-indigo-600 hidden sm:inline">3D Studio</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-indigo-600 font-medium transition">
              Начало
            </Link>
            <Link to="/shop" className="text-gray-700 hover:text-indigo-600 font-medium transition">
              Магазин
            </Link>
            <Link to="/upload" className="text-gray-700 hover:text-indigo-600 font-medium transition">
              Качи модел
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-indigo-600 font-medium transition">
              За нас
            </Link>
            
            {/* User Section */}
            {user ? (
              <Link to="/profile" className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 font-medium transition">
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {user.displayName?.charAt(0) || 'У'}
                </div>
                <span className="hidden lg:inline">{user.displayName || 'Профил'}</span>
              </Link>
            ) : (
              <Link to="/auth" className="text-gray-700 hover:text-indigo-600 font-medium transition flex items-center gap-2">
                <User size={20} />
                Вход
              </Link>
            )}

            <Link
              to="/wishlist"
              className="relative bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-full hover:border-indigo-300 transition flex items-center gap-2"
            >
              <Heart size={18} className="text-indigo-600" />
              {wishlistCount > 0 && (
                <span className="bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={toggleMiniCart}
              className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition shadow-lg hover:shadow-indigo-500/30 flex items-center gap-2"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <Link to="/wishlist" className="relative">
              <Heart size={22} className="text-indigo-600" />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <button type="button" onClick={toggleMiniCart} className="relative">
              <ShoppingCart size={24} className="text-indigo-600" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link to="/" className="block text-gray-700 hover:text-indigo-600 py-2">
              Начало
            </Link>
            <Link to="/shop" className="block text-gray-700 hover:text-indigo-600 py-2">
              Магазин
            </Link>
            <Link to="/wishlist" className="block text-gray-700 hover:text-indigo-600 py-2">
              Любими
            </Link>
            <Link to="/upload" className="block text-gray-700 hover:text-indigo-600 py-2">
              Качи модел
            </Link>
            <Link to="/about" className="block text-gray-700 hover:text-indigo-600 py-2">
              За нас
            </Link>
            {user ? (
              <>
                <Link to="/profile" className="block text-gray-700 hover:text-indigo-600 py-2">
                  👤 Мой профил
                </Link>
              </>
            ) : (
              <Link to="/auth" className="block text-gray-700 hover:text-indigo-600 py-2">
                🔐 Вход / Регистрация
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
