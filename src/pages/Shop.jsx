import React, { useState, useMemo, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import Button from '../components/Button';
import { CATEGORIES } from '../data/products';
import { Search } from 'lucide-react';
import { db } from '../config/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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
          
          return {
            id: data.productId,
            name: data.productName,
            basePrice: data.basePrice || 0,
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
          };
        }); // Показваме всички продукти, независимо от наличността
      
      setProducts(inventoryProducts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchTerm]);

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
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Търси продукти..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

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
                Опитай да преизвършиш търсенето или избери друга категория.
              </p>
              <Button onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}>
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
