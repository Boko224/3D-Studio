import React from 'react';
import { Link } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

const MiniCart = () => {
  const {
    cartItems,
    isMiniCartOpen,
    closeMiniCart,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
  } = useCart();

  const subtotal = getTotalPrice();

  const handleOutsideClick = (e) => {
    if (e.target.id === 'mini-cart-overlay') closeMiniCart();
  };

  const lineTotal = (item) => {
    const unit = (item.basePrice || 0) + (item.materialPrice || 0);
    return unit * (item.quantity || 1);
  };

  return (
    <div
      id="mini-cart-overlay"
      onClick={handleOutsideClick}
      className={`${isMiniCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm transition-opacity`}
    >
      <div
        className={`${isMiniCartOpen ? 'translate-x-0' : 'translate-x-full'} fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[110] transition-transform duration-300 flex flex-col`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <ShoppingCart className="text-indigo-600" size={20} />
            <span className="text-lg font-bold text-gray-900">Мини количка</span>
            <span className="text-sm text-gray-500">({cartItems.length})</span>
          </div>
          <button onClick={closeMiniCart} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6 text-gray-500">
              <div className="text-4xl mb-2">🛒</div>
              <p className="font-semibold">Количката е празна</p>
              <p className="text-sm">Добави продукт, за да го видиш тук</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {cartItems.map((item, idx) => (
                <div key={`${item.productId}-${idx}`} className="p-4 flex gap-3">
                  <div className="text-3xl bg-indigo-50 rounded-lg w-14 h-14 flex items-center justify-center">
                    {item.image || '📦'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="font-semibold text-gray-900 leading-tight line-clamp-2">{item.name}</p>
                        {item.selectedColor && (
                          <p className="text-sm text-gray-600">🎨 {item.selectedColor}</p>
                        )}
                        {item.material && (
                          <p className="text-sm text-gray-600">⚡ {item.material}</p>
                        )}
                        {item.customText && (
                          <p className="text-xs text-gray-500">📝 {item.customText}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeFromCart(idx)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Премахни"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-1">
                        <button
                          onClick={() => updateQuantity(idx, (item.quantity || 1) - 1)}
                          className="p-1 text-gray-700 hover:text-indigo-600"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center font-semibold text-gray-800">{item.quantity || 1}</span>
                        <button
                          onClick={() => updateQuantity(idx, (item.quantity || 1) + 1)}
                          className="p-1 text-gray-700 hover:text-indigo-600"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">ед. цена</p>
                        <p className="text-lg font-bold text-gray-900">{((item.basePrice || 0) + (item.materialPrice || 0)).toFixed(2)} лв.</p>
                        <p className="text-xs text-gray-500">Ред: {lineTotal(item).toFixed(2)} лв.</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-4 bg-white">
          <div className="flex justify-between mb-3 text-gray-700">
            <span>Общо</span>
            <span className="text-xl font-bold text-gray-900">{subtotal.toFixed(2)} лв.</span>
          </div>
          <div className="flex gap-2">
            <Link
              to="/cart"
              onClick={closeMiniCart}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              <ShoppingCart size={18} />
              Към количката
            </Link>
            <button
              onClick={closeMiniCart}
              className="px-4 py-3 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 transition"
            >
              Продължи
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniCart;
