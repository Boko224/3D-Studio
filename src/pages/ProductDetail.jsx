import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { COLORS, MATERIALS } from '../data/products';
import { applyPromotion } from '../services/promotionService';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import Button from '../components/Button';
import { Plus, Minus, ShoppingCart, Heart } from 'lucide-react';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

// Дефолтни опции по категории (за инвентар продукти от Firebase)
const DEFAULT_OPTIONS = {
  keychains: {
    colors: ['Черен', 'Бял', 'Червен', 'Син'],
    materials: ['PLA', 'PETG'],
    customizable: true,
  },
  figures: {
    colors: ['Черен', 'Сив', 'Цветен', 'Бял', 'Червен', 'Син', 'Зелен', 'Жълт'],
    materials: ['PLA'],
    customizable: false,
  },
  parts: {
    colors: ['Черен', 'Бял', 'Сив', 'Червен', 'Син', 'Зелен'],
    materials: ['PETG'],
    customizable: false,
  },
  organizers: {
    colors: ['Черен', 'Бял', 'Син'],
    materials: ['PLA'],
    customizable: true,
  },
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, openMiniCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Зареди продукт от Firebase инвентара
  useEffect(() => {
    const inventoryRef = collection(db, 'inventory');
    const q = query(inventoryRef, where('productId', '==', id));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const data = doc.data();
        const category = data.category || 'keychains';
        const defaults = DEFAULT_OPTIONS[category] || DEFAULT_OPTIONS['keychains'];
        
        // Вземи colorStock ако съществува, иначе създай дефолтен
        const colorStock = data.colorStock || [];
        const totalStock = colorStock.reduce((sum, cs) => sum + (cs.stock || 0), 0);
        
        const productData = {
          id: data.productId,
          name: data.productName,
          basePrice: data.basePrice || 0,
          weightGrams: data.weightGrams || null,
          category,
          image: '📦',
          stock: totalStock,
          colorStock: colorStock,
          promoActive: data.promoActive || false,
          promoType: data.promoType || 'percent',
          promoValue: data.promoValue ?? 0,
          promoStart: data.promoStart || '',
          promoEnd: data.promoEnd || '',
          description: colorStock.length > 0 
            ? `${data.productName} - Налични цветове: ${colorStock.filter(cs => cs.stock > 0).map(cs => cs.color).join(', ')}`
            : `${data.productName} - На наличност: ${totalStock} броя`,
          options: {
            colors: colorStock.length > 0 ? colorStock.map(cs => cs.color) : defaults.colors,
            materials: defaults.materials,
          },
          customizable: defaults.customizable,
          firebaseId: doc.id,
        };
        setProduct(productData);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  const [quantity, setQuantity] = useState(1);
  const [customText, setCustomText] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('PLA');
  const [availableColors, setAvailableColors] = useState([]);

  // Обновяване на наличните цветове
  useEffect(() => {
    if (product?.colorStock && product.colorStock.length > 0) {
      // Покажи всички цветове, независимо от наличността
      setAvailableColors(product.colorStock);
      
      // Задай първия наличен цвят като избран (или първия изобщо ако няма налични)
      if (!selectedColor) {
        const availableColor = product.colorStock.find(cs => cs.stock > 0);
        if (availableColor) {
          setSelectedColor(availableColor.color);
        } else if (product.colorStock.length > 0) {
          setSelectedColor(product.colorStock[0].color);
        }
      }
    } else if (product?.options?.colors?.length > 0) {
      // Фолбек за стари продукти без colorStock
      const defaultColors = product.options.colors.map(color => ({ color, stock: 999 }));
      setAvailableColors(defaultColors);
      if (!selectedColor) {
        setSelectedColor(product.options.colors[0]);
      }
    }
  }, [product]);

  // Вземи наличността за избрания цвят
  const getStockForColor = (color) => {
    if (!product?.colorStock) return product?.stock || 999;
    const colorItem = product.colorStock.find(cs => cs.color === color);
    return colorItem ? colorItem.stock : 0;
  };

  const currentColorStock = getStockForColor(selectedColor);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Зареждам продукта...</p>
        </div>
      </div>
    );
  }

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
  const promo = {
    promoActive: product?.promoActive,
    promoType: product?.promoType,
    promoValue: product?.promoValue,
    promoStart: product?.promoStart,
    promoEnd: product?.promoEnd,
  };
  const effectiveBasePrice = applyPromotion(product?.basePrice || 0, promo);
  const totalProductPrice = (effectiveBasePrice + materialPrice) * quantity;
  const isFav = isInWishlist(product?.id);

  const handleAddToCart = () => {
    // Проверка за наличност на избрания цвят
    if (currentColorStock <= 0) {
      alert('⚠️ Избраният цвят е изчерпан!');
      return;
    }
    
    if (quantity > currentColorStock) {
      alert(`⚠️ Налични са само ${currentColorStock} броя от този цвят!`);
      return;
    }

    const cartItem = {
      productId: product.id,
      name: product.name,
      basePrice: product.basePrice,
      weightGrams: product.weightGrams,
      category: product.category,
      selectedColor,
      customText,
      material: selectedMaterial,
      materialPrice,
      quantity,
      unitPrice: effectiveBasePrice + materialPrice,
      totalPrice: totalProductPrice,
      image: product.image,
      firebaseId: product.firebaseId, // За обновяване на наличността
    };

    addToCart(cartItem);
    openMiniCart();
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
                {effectiveBasePrice < (product.basePrice || 0) ? (
                  <div className="mb-2">
                    <span className="text-xl font-bold text-gray-500 line-through mr-2">
                      {(product.basePrice || 0).toFixed(2)} лв.
                    </span>
                    <span className="text-3xl font-bold text-indigo-600">
                      {effectiveBasePrice.toFixed(2)} лв.
                    </span>
                    <span className="ml-3 text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full">
                      Промоция
                    </span>
                  </div>
                ) : (
                  <div className="text-3xl font-bold text-indigo-600 mb-4">
                    {(product.basePrice || 0).toFixed(2)} лв.
                  </div>
                )}
                {materialPrice > 0 && (
                  <div className="text-sm text-gray-600">
                    + {materialPrice.toFixed(2)} лв. за материал
                  </div>
                )}
              </div>

              {/* Customization Options */}
              {(product?.options?.colors?.length > 0 || product?.options?.materials?.length > 0 || product.customizable) && (
                <div className="space-y-6 mb-8">
                  {/* Custom Text (only when allowed) */}
                  {product.customizable && (
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
                  )}

                  {/* Color Selector (when colors exist) */}
                  {availableColors.length > 0 && (
                    <div>
                      <label className="block text-sm font-bold mb-3 text-gray-700">
                        🎨 Цвят: {selectedColor} 
                        <span className="ml-2 text-sm font-normal text-gray-500">
                          (налични: {currentColorStock} бр.)
                        </span>
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {availableColors.map((colorItem) => {
                          const isAvailable = colorItem.stock > 0;
                          return (
                            <button
                              key={colorItem.color}
                              onClick={() => isAvailable && setSelectedColor(colorItem.color)}
                              disabled={!isAvailable}
                              className={`px-4 py-2 rounded-lg font-medium transition-all border-2 ${
                                selectedColor === colorItem.color
                                  ? 'border-indigo-600 bg-indigo-50'
                                  : isAvailable
                                  ? 'border-gray-300 hover:border-gray-400'
                                  : 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                              }`}
                              style={{
                                backgroundColor: selectedColor === colorItem.color && isAvailable 
                                  ? COLORS[colorItem.color] + '20' 
                                  : !isAvailable 
                                  ? '#f3f4f6'
                                  : 'transparent',
                              }}
                            >
                              <span
                                className="inline-block w-4 h-4 rounded mr-2"
                                style={{
                                  backgroundColor: COLORS[colorItem.color] || '#ccc',
                                  border: '1px solid rgba(0,0,0,0.1)',
                                }}
                              ></span>
                              {colorItem.color}
                              <span className="ml-2 text-xs">
                                ({colorItem.stock} бр.)
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      {availableColors.length === 0 && (
                        <p className="text-red-600 text-sm mt-2">❌ Всички цветове са изчерпани</p>
                      )}
                    </div>
                  )}

                  {/* Material Selector (when materials exist) */}
                  {product?.options?.materials?.length > 0 && (
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
                  )}
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-4">
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
                    onClick={() => setQuantity(Math.min(currentColorStock, quantity + 1))}
                    disabled={quantity >= currentColorStock}
                    className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                {currentColorStock < 10 && currentColorStock > 0 && (
                  <p className="text-orange-600 text-sm mt-2">
                    ⚠️ Остават само {currentColorStock} броя!
                  </p>
                )}
              </div>

              {/* Wishlist */}
              <div className="mb-8">
                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  className={`w-full md:w-auto px-4 py-3 rounded-lg border-2 flex items-center justify-center gap-2 font-semibold transition ${
                    isFav ? 'border-red-500 text-red-600 bg-red-50' : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Heart size={20} className={isFav ? 'text-red-500 fill-red-500' : 'text-gray-600'} />
                  {isFav ? 'В любими' : 'Добави в любими'}
                </button>
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
                disabled={currentColorStock <= 0 || availableColors.length === 0}
                className="w-full text-lg py-4 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={24} />
                {currentColorStock <= 0 || availableColors.length === 0 
                  ? 'Изчерпано количество' 
                  : 'Добави в количката'}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;
