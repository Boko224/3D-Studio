import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PRODUCTS, COLORS, MATERIALS } from '../data/products';
import { useCart } from '../context/CartContext';
import Button from '../components/Button';
import { Plus, Minus, ShoppingCart } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const product = PRODUCTS.find((p) => p.id === id);

  const [quantity, setQuantity] = useState(1);
  const [customText, setCustomText] = useState('');
  const [selectedColor, setSelectedColor] = useState(product?.options.colors[0] || '');
  const [selectedMaterial, setSelectedMaterial] = useState('PLA');

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Продуктът не е намерен</h1>
          <Button onClick={() => navigate('/shop')}>
            Обратно в магазина
          </Button>
        </div>
      </div>
    );
  }

  const materialPrice = MATERIALS[selectedMaterial] || 0;
  const totalProductPrice = (product.basePrice + materialPrice) * quantity;

  const handleAddToCart = () => {
    const cartItem = {
      productId: product.id,
      name: product.name,
      basePrice: product.basePrice,
      selectedColor,
      customText,
      material: selectedMaterial,
      materialPrice,
      quantity,
      totalPrice: totalProductPrice,
      image: product.image,
    };

    addToCart(cartItem);
    navigate('/cart');
  };

  return (
    <div className="w-full">
      {/* Header */}
      <section className="hero-bg text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <button
            onClick={() => navigate('/shop')}
            className="text-indigo-400 hover:text-indigo-300 mb-4 flex items-center gap-2"
          >
            ← Обратно
          </button>
        </div>
      </section>

      {/* Product Details */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Product Image */}
            <div className="flex items-center justify-center">
              <div className="w-96 h-96 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center text-9xl border-2 border-indigo-200">
                {product.image}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {product.description}
              </p>

              {/* Price */}
              <div className="mb-8 p-6 bg-indigo-50 rounded-xl border border-indigo-200">
                <div className="text-sm text-gray-600 mb-2">Базова цена</div>
                <div className="text-3xl font-bold text-indigo-600 mb-4">
                  {product.basePrice.toFixed(2)} лв.
                </div>
                {materialPrice > 0 && (
                  <div className="text-sm text-gray-600">
                    + {materialPrice.toFixed(2)} лв. за материал
                  </div>
                )}
              </div>

              {/* Customization Options */}
              {product.customizable && (
                <div className="space-y-6 mb-8">
                  {/* Custom Text */}
                  <div>
                    <label className="block text-sm font-bold mb-3 text-gray-700">
                      📝 Персонален текст (макс. 15 символа)
                    </label>
                    <input
                      type="text"
                      maxLength="15"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      placeholder="Напр. IVAN"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 text-lg font-semibold"
                    />
                    <div className="text-xs text-gray-500 mt-2">
                      {customText.length} / 15 символа
                    </div>
                  </div>

                  {/* Color Selector */}
                  <div>
                    <label className="block text-sm font-bold mb-3 text-gray-700">
                      🎨 Цвят: {selectedColor}
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {product.options.colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all border-2 ${
                            selectedColor === color
                              ? 'border-indigo-600 bg-indigo-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          style={{
                            backgroundColor: selectedColor === color ? COLORS[color] + '20' : 'transparent',
                          }}
                        >
                          <span
                            className="inline-block w-4 h-4 rounded mr-2"
                            style={{
                              backgroundColor: COLORS[color],
                              border: '1px solid rgba(0,0,0,0.1)',
                            }}
                          ></span>
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Material Selector */}
                  <div>
                    <label className="block text-sm font-bold mb-3 text-gray-700">
                      ⚡ Материал
                    </label>
                    <div className="flex gap-3">
                      {product.options.materials.map((mat) => (
                        <button
                          key={mat}
                          onClick={() => setSelectedMaterial(mat)}
                          className={`px-6 py-3 rounded-lg font-bold transition-all border-2 ${
                            selectedMaterial === mat
                              ? 'border-indigo-600 bg-indigo-600 text-white'
                              : 'border-gray-300 text-gray-700 hover:border-gray-400'
                          }`}
                        >
                          {mat}
                          {MATERIALS[mat] > 0 && (
                            <span className="text-sm ml-2">
                              (+{MATERIALS[mat].toFixed(2)} лв.)
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-8">
                <label className="block text-sm font-bold mb-3 text-gray-700">
                  📦 Количество
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                  >
                    <Minus size={20} />
                  </button>
                  <span className="text-2xl font-bold w-16 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              {/* Total Price */}
              <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-700">Общо:</span>
                  <span className="text-3xl font-bold text-indigo-600">
                    {totalProductPrice.toFixed(2)} лв.
                  </span>
                </div>
              </div>

              {/* Add to Cart Button */}
              <Button
                onClick={handleAddToCart}
                className="w-full text-lg py-4 flex items-center justify-center gap-2"
              >
                <ShoppingCart size={24} />
                Добави в количката
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;
