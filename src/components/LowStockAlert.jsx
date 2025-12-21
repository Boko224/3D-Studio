import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { AlertTriangle, Package, X, RefreshCw } from 'lucide-react';

const LowStockAlert = ({ onRestock }) => {
  const [inventory, setInventory] = useState([]);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    const inventoryRef = collection(db, 'inventory');
    const q = query(inventoryRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const inventoryData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setInventory(inventoryData);
    });

    return () => unsubscribe();
  }, []);

  // Филтрирай продукти с ниска наличност или изчерпани
  const outOfStock = inventory.filter(item => item.stock <= 0);
  const lowStock = inventory.filter(item => 
    item.stock > 0 && item.stock <= (item.reorderLevel || 0)
  );

  // Не показвай банера ако няма проблеми или е затворен
  if (!showBanner || (outOfStock.length === 0 && lowStock.length === 0)) {
    return null;
  }

  return (
    <div className="mb-6">
      {/* Изчерпани продукти */}
      {outOfStock.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-4 rounded-lg relative">
          <button
            onClick={() => setShowBanner(false)}
            className="absolute top-2 right-2 text-red-600 hover:text-red-800"
          >
            <X size={20} />
          </button>
          <div className="flex items-start">
            <Package className="text-red-600 mr-3 mt-1" size={24} />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-800 mb-2">
                ⚠️ Изчерпани продукти ({outOfStock.length})
              </h3>
              <p className="text-sm text-red-700 mb-3">
                Следните продукти са изчерпани и не могат да се купуват:
              </p>
              <div className="space-y-2">
                {outOfStock.slice(0, 5).map(item => (
                  <div 
                    key={item.id} 
                    className="bg-white p-3 rounded border border-red-200 flex justify-between items-center"
                  >
                    <div>
                      <span className="font-semibold text-gray-900">{item.productName}</span>
                      <span className="text-xs text-gray-500 ml-2">({item.productId})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-red-600 font-bold text-sm">Наличност: 0</span>
                      <button
                        onClick={() => onRestock && onRestock(item.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-xs font-semibold flex items-center gap-1"
                      >
                        <RefreshCw size={14} />
                        Презареди
                      </button>
                    </div>
                  </div>
                ))}
                {outOfStock.length > 5 && (
                  <p className="text-xs text-red-600 italic">
                    ...и още {outOfStock.length - 5} продукта
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ниска наличност */}
      {lowStock.length > 0 && (
        <div className="bg-orange-50 border-l-4 border-orange-600 p-4 rounded-lg relative">
          <button
            onClick={() => setShowBanner(false)}
            className="absolute top-2 right-2 text-orange-600 hover:text-orange-800"
          >
            <X size={20} />
          </button>
          <div className="flex items-start">
            <AlertTriangle className="text-orange-600 mr-3 mt-1" size={24} />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-orange-800 mb-2">
                ⚠️ Ниска наличност ({lowStock.length})
              </h3>
              <p className="text-sm text-orange-700 mb-3">
                Следните продукти имат наличност под препоръчителното ниво:
              </p>
              <div className="space-y-2">
                {lowStock.slice(0, 5).map(item => (
                  <div 
                    key={item.id} 
                    className="bg-white p-3 rounded border border-orange-200 flex justify-between items-center"
                  >
                    <div>
                      <span className="font-semibold text-gray-900">{item.productName}</span>
                      <span className="text-xs text-gray-500 ml-2">({item.productId})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-orange-600 font-bold text-sm">
                          Наличност: {item.stock}
                        </div>
                        <div className="text-xs text-gray-500">
                          Препоръчано: {item.reorderLevel || 0}
                        </div>
                      </div>
                      <button
                        onClick={() => onRestock && onRestock(item.id)}
                        className="px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-xs font-semibold flex items-center gap-1"
                      >
                        <RefreshCw size={14} />
                        Презареди
                      </button>
                    </div>
                  </div>
                ))}
                {lowStock.length > 5 && (
                  <p className="text-xs text-orange-600 italic">
                    ...и още {lowStock.length - 5} продукта
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LowStockAlert;
