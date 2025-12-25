import React, { useState, useMemo, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { applyPromotion } from '../services/promotionService';
import Button from '../components/Button';
import { CATEGORIES } from '../data/products';
import { Search, Filter, X } from 'lucide-react';
import { db } from '../config/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promoFirst, setPromoFirst] = useState(false);
  
  // Филтри
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [stockFilter, setStockFilter] = useState('all'); // 'all', 'inStock', 'outOfStock'
  const [customizableFilter, setCustomizableFilter] = useState('all'); // 'all', 'yes', 'no'

  // Зареди продукти от Firebase инвентара
  useEffect(() => {
    const inventoryRef = collection(db, 'inventory');
    const q = query(inventoryRef, orderBy('productName', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const inventoryProducts = snapshot.docs
        .map(doc => {
          const data = doc.data();
          const colorStock = data.colorStock || [];
          
          // Изчисли общата наличност от всички цветове
          const totalStock = colorStock.reduce((sum, cs) => sum + (cs.stock || 0), 0);
          const availableColors = colorStock.filter(cs => cs.stock > 0);
          const outOfStockColors = colorStock.filter(cs => cs.stock === 0);
          
          const promo = {
            promoActive: data.promoActive || false,
            promoType: data.promoType || 'percent',
            promoValue: data.promoValue ?? 0,
            promoStart: data.promoStart || '',
            promoEnd: data.promoEnd || '',
          };
          const effectivePrice = applyPromotion(data.basePrice || 0, promo);

          return {
            id: data.productId,
            name: data.productName,
            basePrice: data.basePrice || 0,
            finalPrice: effectivePrice,
            category: data.category || 'all',
            image: '📦',
            stock: totalStock,
            colorStock: colorStock,
            description: colorStock.length > 0 
              ? `${data.productName} - ${availableColors.length > 0 ? `Налични: ${availableColors.map(cs => cs.color).join(', ')}` : 'Всички цветове изчерпани'}${outOfStockColors.length > 0 ? ` | Изчерпани: ${outOfStockColors.map(cs => cs.color).join(', ')}` : ''}`
              : `${data.productName} - ${totalStock > 0 ? `На наличност: ${totalStock} броя` : 'Изчерпано'}`,
            options: {
              colors: colorStock.map(cs => cs.color),
              materials: [],
            },
            customizable: false,
            firebaseId: doc.id,
            promoActive: promo.promoActive,
            promoType: promo.promoType,
            promoValue: promo.promoValue,
            promoStart: promo.promoStart,
            promoEnd: promo.promoEnd,
          };
        });
      
      setProducts(inventoryProducts);
      setLoading(false);
      
      // Изчисли максимална цена за слайдъра
      const prices = inventoryProducts.map(p => p.finalPrice || p.basePrice || 0);
      const max = prices.length > 0 ? Math.ceil(Math.max(...prices)) : 1000;
      setMaxPrice(max);
      setPriceRange([0, max]);
    });

    return () => unsubscribe();
  }, []);

  // Събери всички уникални цветове и материали
  const allColors = useMemo(() => {
    const colors = new Set();
    products.forEach(p => {
      if (p.colorStock) {
        p.colorStock.forEach(cs => colors.add(cs.color));
      }
    });
    return Array.from(colors).sort();
  }, [products]);

  const allMaterials = useMemo(() => {
    const materials = new Set();
    products.forEach(p => {
      if (p.options?.materials) {
        p.options.materials.forEach(m => materials.add(m));
      }
    });
    return Array.from(materials).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Ценови филтър
      const price = product.finalPrice !== undefined ? product.finalPrice : product.basePrice;
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
      
      // Филтър по наличност
      const matchesStock = 
        stockFilter === 'all' ||
        (stockFilter === 'inStock' && product.stock > 0) ||
        (stockFilter === 'outOfStock' && product.stock === 0);
      
      // Филтър по цвят
      const matchesColor = selectedColors.length === 0 || 
        (product.colorStock && product.colorStock.some(cs => selectedColors.includes(cs.color)));
      
      // Филтър по материал
      const matchesMaterial = selectedMaterials.length === 0 ||
        (product.options?.materials && product.options.materials.some(m => selectedMaterials.includes(m)));
      
      // Филтър по персонализация
      const matchesCustomizable = 
        customizableFilter === 'all' ||
        (customizableFilter === 'yes' && product.customizable === true) ||
        (customizableFilter === 'no' && product.customizable !== true);
      
      return matchesCategory && matchesSearch && matchesPrice && matchesStock && 
             matchesColor && matchesMaterial && matchesCustomizable;
    });

    if (!promoFirst) return filtered;
    return [...filtered].sort((a, b) => {
      const aPromo = a.finalPrice !== undefined && a.finalPrice < (a.basePrice || 0);
      const bPromo = b.finalPrice !== undefined && b.finalPrice < (b.basePrice || 0);
      if (aPromo === bPromo) return 0;
      return bPromo ? 1 : -1;
    });
  }, [products, selectedCategory, searchTerm, promoFirst, priceRange, stockFilter, 
      selectedColors, selectedMaterials, customizableFilter]);

  const toggleColor = (color) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const toggleMaterial = (material) => {
    setSelectedMaterials(prev =>
      prev.includes(material) ? prev.filter(m => m !== material) : [...prev, material]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setPriceRange([0, maxPrice]);
    setSelectedColors([]);
    setSelectedMaterials([]);
    setStockFilter('all');
    setCustomizableFilter('all');
    setPromoFirst(false);
  };

  const activeFiltersCount = 
    (selectedCategory !== 'all' ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0) +
    selectedColors.length +
    selectedMaterials.length +
    (stockFilter !== 'all' ? 1 : 0) +
    (customizableFilter !== 'all' ? 1 : 0) +
    (promoFirst ? 1 : 0);

  return (
    <div className="w-full">
      {/* Header */}
      <section className="hero-bg text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Магазин</h1>
          <p className="text-gray-300 text-lg">Разгледай всички наши продукти</p>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Search and Filter Toggle */}
          <div className="mb-6 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Търси продукти..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                showFilters ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter size={20} />
              Филтри
              {activeFiltersCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mb-6 p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Ценови диапазон */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">💰 Ценови диапазон</label>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{priceRange[0]} лв</span>
                      <span>{priceRange[1]} лв</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={maxPrice}
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                      className="w-full"
                    />
                    <input
                      type="range"
                      min="0"
                      max={maxPrice}
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Наличност */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">📦 Наличност</label>
                  <div className="space-y-2">
                    {[
                      { id: 'all', label: 'Всички' },
                      { id: 'inStock', label: 'На наличност' },
                      { id: 'outOfStock', label: 'Изчерпани' },
                    ].map(option => (
                      <label key={option.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="stock"
                          checked={stockFilter === option.id}
                          onChange={() => setStockFilter(option.id)}
                          className="w-4 h-4 text-indigo-600"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Персонализация */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">✏️ Персонализация</label>
                  <div className="space-y-2">
                    {[
                      { id: 'all', label: 'Всички' },
                      { id: 'yes', label: 'Персонализируем' },
                      { id: 'no', label: 'Непersonализируем' },
                    ].map(option => (
                      <label key={option.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="customizable"
                          checked={customizableFilter === option.id}
                          onChange={() => setCustomizableFilter(option.id)}
                          className="w-4 h-4 text-indigo-600"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Промоции */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">🏷️ Промоции</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={promoFirst}
                        onChange={() => setPromoFirst(!promoFirst)}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="text-sm text-gray-700">Покажи промо първо</span>
                    </label>
                  </div>
                </div>

                {/* Цветове */}
                {allColors.length > 0 && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">🎨 Цветове</label>
                    <div className="flex flex-wrap gap-2">
                      {allColors.map(color => (
                        <button
                          key={color}
                          onClick={() => toggleColor(color)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                            selectedColors.includes(color)
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Материали */}
                {allMaterials.length > 0 && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">🧱 Материал</label>
                    <div className="flex flex-wrap gap-2">
                      {allMaterials.map(material => (
                        <button
                          key={material}
                          onClick={() => toggleMaterial(material)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                            selectedMaterials.includes(material)
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {material}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <button
                    onClick={clearAllFilters}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 font-bold"
                  >
                    <X size={18} />
                    Изчисти всички филтри ({activeFiltersCount})
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Categories */}
          <div className="flex flex-wrap gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-5 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          {loading ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-gray-600">Зареждам продукти...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div>
              <div className="mb-8 text-gray-600">
                Намерени {filteredProducts.length} продукта
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Няма намерени продукти
              </h3>
              <p className="text-gray-600 mb-6">
                Опитай да преизвършиш търсенето или промени филтрите.
              </p>
              <Button onClick={clearAllFilters}>
                Изчисти филтрите
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Shop;
