import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

const WishlistPage = () => {
  const { wishlist, removeFromWishlist } = useWishlist();

  if (!wishlist.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🤍</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Няма любими продукти</h1>
          <p className="text-gray-600 mb-6">Добави продукти към списъка с желания и ги виж тук.</p>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition"
          >
            Към магазина
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <section className="hero-bg text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 flex items-center gap-3">
            <Heart size={36} className="text-white" /> Любими продукти
          </h1>
          <p className="text-gray-200">Списък с желания, синхронизиран с профила ти.</p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item) => (
              <div key={item.productId} className="bg-white rounded-2xl shadow-md hover:shadow-lg transition p-5 flex flex-col border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <div className="text-5xl bg-indigo-50 rounded-xl w-20 h-20 flex items-center justify-center">
                    {item.image || '📦'}
                  </div>
                  <button
                    onClick={() => removeFromWishlist(item.productId)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    title="Премахни"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">{item.name}</h3>
                <p className="text-sm text-gray-500 mb-4 capitalize">{item.category}</p>

                <div className="flex items-center justify-between mt-auto">
                  <div className="text-2xl font-bold text-indigo-600">{(item.basePrice || 0).toFixed(2)} лв.</div>
                  <Link
                    to={`/product/${item.productId}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    <ShoppingCart size={16} /> Виж продукта
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default WishlistPage;
