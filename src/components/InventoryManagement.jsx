import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Plus, Trash2, Edit2, Save, X, AlertCircle } from 'lucide-react';
import { PRODUCTS } from '../data/products';

const InventoryManagement = ({ selectedProductId }) => {
  const [inventory, setInventory] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    productId: '',
    productName: '',
    basePrice: '',
    weightGrams: '',
    stock: '',
    reorderLevel: '',
    category: '',
    colorStock: [], // Array of {color: string, stock: number}
    promoActive: false,
    promoType: 'percent',
    promoValue: '',
    promoStart: '',
    promoEnd: '',
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Зареждане на инвентара от Firebase
  useEffect(() => {
    const inventoryRef = collection(db, 'inventory');
    const q = query(inventoryRef, orderBy('productName', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const inventoryData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setInventory(inventoryData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Автоматично отваряне на форма при избран продукт
  useEffect(() => {
    if (selectedProductId && inventory.length > 0) {
      const item = inventory.find(inv => inv.id === selectedProductId);
      if (item) {
        handleEdit(item);
        // Скролирай до формата
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      }
    }
  }, [selectedProductId, inventory]);

  // Обнулявне на формата
  const resetForm = () => {
    setFormData({
      productId: '',
      productName: '',
      basePrice: '',
      weightGrams: '',
      stock: '',
      reorderLevel: '',
      category: '',
      colorStock: [],
      promoActive: false,
      promoType: 'percent',
      promoValue: '',
      promoStart: '',
      promoEnd: '',
    });
    setEditingId(null);
  };

  // Редактиране на елемент
  const handleEdit = (item) => {
    setFormData({
      productId: item.productId,
      productName: item.productName,
      basePrice: item.basePrice,
      weightGrams: item.weightGrams || '',
      stock: item.stock,
      reorderLevel: item.reorderLevel,
      category: item.category,
      colorStock: item.colorStock || [],
      promoActive: item.promoActive || false,
      promoType: item.promoType || 'percent',
      promoValue: item.promoValue ?? '',
      promoStart: item.promoStart || '',
      promoEnd: item.promoEnd || '',
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  // Добавяне или обновяване
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!String(formData.productId).trim() || !String(formData.productName).trim() || formData.basePrice === '') {
      alert('⚠️ Пълни всички полета!');
      return;
    }

    // Филтрирай само празни записи без цвят (но запази цветовете с 0 stock)
    const filteredColorStock = formData.colorStock.filter(cs => cs.color);

    // Изчисли общата наличност
    const totalStock = filteredColorStock.reduce((sum, cs) => sum + cs.stock, 0);

    try {
      setSubmitting(true);

      const inventoryData = {
        productId: formData.productId,
        productName: formData.productName,
        basePrice: parseFloat(formData.basePrice),
        weightGrams: parseInt(formData.weightGrams) || null,
        stock: totalStock,
        reorderLevel: parseInt(formData.reorderLevel) || 0,
        category: formData.category,
        colorStock: filteredColorStock,
        promoActive: !!formData.promoActive,
        promoType: formData.promoType || 'percent',
        promoValue: parseFloat(formData.promoValue) || 0,
        promoStart: formData.promoStart || '',
        promoEnd: formData.promoEnd || '',
        updatedAt: new Date(),
      };

      if (editingId) {
        // Обновяване
        const itemRef = doc(db, 'inventory', editingId);
        await updateDoc(itemRef, inventoryData);
        alert('✅ Продукт обновен успешно!');
      } else {
        // Добавяне ново
        await addDoc(collection(db, 'inventory'), {
          ...inventoryData,
          createdAt: new Date(),
        });
        alert('✅ Продукт добавен успешно!');
      }
      resetForm();
      setShowForm(false);
    } catch (error) {
      alert('❌ Грешка: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Изтриване
  const handleDelete = async (id) => {
    if (window.confirm('Сигурен ли си че искаш да изтриеш този продукт от инвентара?')) {
      try {
        await deleteDoc(doc(db, 'inventory', id));
        alert('✅ Продукт изтрит успешно!');
      } catch (error) {
        alert('❌ Грешка при изтриване: ' + error.message);
      }
    }
  };

  // Бързо добавяне на наличност
  const handleQuickAdd = async (id, currentStock) => {
    const newStock = prompt('Нова наличност:', currentStock);
    if (newStock !== null) {
      try {
        const itemRef = doc(db, 'inventory', id);
        await updateDoc(itemRef, {
          stock: parseInt(newStock),
          updatedAt: new Date(),
        });
        alert('✅ Наличност обновена!');
      } catch (error) {
        alert('❌ Грешка: ' + error.message);
      }
    }
  };

  // Добавяне на нов цвят
  const handleAddColor = () => {
    setFormData({
      ...formData,
      colorStock: [...formData.colorStock, { color: '', stock: 0 }]
    });
  };

  // Премахване на цвят
  const handleRemoveColor = (index) => {
    const newColorStock = formData.colorStock.filter((_, i) => i !== index);
    setFormData({ ...formData, colorStock: newColorStock });
  };

  // Промяна на цвят
  const handleColorChange = (index, field, value) => {
    const newColorStock = [...formData.colorStock];
    newColorStock[index] = {
      ...newColorStock[index],
      [field]: field === 'stock' ? parseInt(value) || 0 : value
    };
    setFormData({ ...formData, colorStock: newColorStock });
  };

  // Получаване на възможни цветове според категорията
  const getAvailableColors = (category) => {
    const colorOptions = {
      keychains: ['Черен', 'Бял', 'Червен', 'Син', 'Зелен', 'Жълт', 'Оранжев', 'Лилав'],
      figures: ['Черен', 'Сив', 'Цветен', 'Бял', 'Червен', 'Син', 'Зелен', 'Жълт'],
      parts: ['Черен', 'Бял', 'Сив', 'Червен', 'Син', 'Зелен'],
      organizers: ['Черен', 'Бял', 'Син', 'Червен', 'Зелен'],
    };
    return colorOptions[category] || colorOptions['keychains'];
  };

  // Получаване на цвят на статуса на наличност
  const getStockColor = (stock, reorderLevel) => {
    if (stock <= 0) return 'bg-red-100 text-red-800';
    if (stock <= reorderLevel) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  };

  const getStockStatus = (stock, reorderLevel) => {
    if (stock <= 0) return '❌ Нема наличност';
    if (stock <= reorderLevel) return '⚠️ Ниско ниво';
    return '✅ На наличност';
  };

  if (loading) {
    return <div className="text-center py-8">Зареждам инвентара...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">📦 Управление на инвентара</h2>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus size={20} />
          Добавяне на продукт
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-blue-50 rounded-lg p-6 mb-6 border-l-4 border-blue-600">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">
              {editingId ? '✏️ Редактиране' : '➕ Добавяне на продукт'}
            </h3>
            <button
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="text-gray-600 hover:text-gray-800"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ID на продукт</label>
              <input
                type="text"
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                placeholder="напр. keychain-001"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Име на продукт</label>
              <input
                type="text"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                placeholder="напр. Ключодържател"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Категория</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Избери категория</option>
                <option value="keychains">🔑 Ключодържатели</option>
                <option value="figures">🎮 Фигурки</option>
                <option value="parts">⚙️ Части</option>
                <option value="organizers">📦 Органайзери</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Базова цена (лв.)</label>
              <input
                type="number"
                step="0.01"
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                placeholder="напр. 12.50"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Тегло (грамове)</label>
              <input
                type="number"
                min="0"
                value={formData.weightGrams}
                onChange={(e) => setFormData({ ...formData, weightGrams: e.target.value })}
                placeholder="напр. 120"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Ниво за преоредериране</label>
              <input
                type="number"
                value={formData.reorderLevel}
                onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                placeholder="напр. 10"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Цветове и количества */}
            <div className="md:col-span-3">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-semibold text-gray-700">🎨 Цветове и наличности</label>
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-1 text-sm"
                >
                  <Plus size={16} />
                  Добави цвят
                </button>
              </div>

              {formData.colorStock.length > 0 ? (
                <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                  {formData.colorStock.map((colorItem, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <select
                        value={colorItem.color}
                        onChange={(e) => handleColorChange(index, 'color', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Избери цвят</option>
                        {getAvailableColors(formData.category).map(color => (
                          <option key={color} value={color}>{color}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="0"
                        value={colorItem.stock}
                        onChange={(e) => handleColorChange(index, 'stock', e.target.value)}
                        placeholder="Брой"
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveColor(index)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <p className="text-sm font-semibold text-gray-700">
                      Обща наличност: {formData.colorStock.reduce((sum, cs) => sum + (cs.stock || 0), 0)} броя
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500 text-sm">
                  Няма добавени цветове. Кликни "Добави цвят" за да добавиш.
                </div>
              )}
            </div>

            {/* Промоция */}
            <div className="md:col-span-3">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-semibold text-gray-700">🏷️ Промоция</label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!!formData.promoActive}
                    onChange={(e) => setFormData({ ...formData, promoActive: e.target.checked })}
                  />
                  Активна
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-lg">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Тип</label>
                  <select
                    value={formData.promoType}
                    onChange={(e) => setFormData({ ...formData, promoType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="percent">Процент (%)</option>
                    <option value="amount">Сума (лв.)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Стойност</label>
                  <input
                    type="number"
                    min="0"
                    step={formData.promoType === 'percent' ? '1' : '0.01'}
                    value={formData.promoValue}
                    onChange={(e) => setFormData({ ...formData, promoValue: e.target.value })}
                    placeholder={formData.promoType === 'percent' ? 'напр. 15' : 'напр. 5.00'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Начало</label>
                  <input
                    type="date"
                    value={formData.promoStart}
                    onChange={(e) => setFormData({ ...formData, promoStart: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Край</label>
                  <input
                    type="date"
                    value={formData.promoEnd}
                    onChange={(e) => setFormData({ ...formData, promoEnd: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Image upload removed as requested */}

            <div className="md:col-span-3 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >
                Отмяна
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={`px-6 py-2 rounded-lg transition flex items-center gap-2 ${submitting ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                <Save size={20} />
                {submitting ? 'Запис...' : (editingId ? 'Обновяване' : 'Добавяне')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Inventory Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-300">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Продукт</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Категория</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Цена</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Цветове и наличности</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Обща наличност</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Статус</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Действия</th>
            </tr>
          </thead>
          <tbody>
            {inventory.length > 0 ? (
              inventory.map((item) => (
                <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.productName}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.category || '-'}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-900 font-semibold">
                    {parseFloat(item.basePrice || 0).toFixed(2)} лв.
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {item.colorStock && item.colorStock.length > 0 ? (
                      <div className="space-y-1">
                        {item.colorStock.map((cs, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="inline-block w-3 h-3 rounded-full border border-gray-300" 
                                  style={{backgroundColor: cs.color === 'Черен' ? '#000' : cs.color === 'Бял' ? '#fff' : cs.color === 'Червен' ? '#f00' : cs.color === 'Син' ? '#00f' : cs.color === 'Зелен' ? '#0f0' : cs.color === 'Жълт' ? '#ff0' : cs.color === 'Оранжев' ? '#ffa500' : cs.color === 'Лилав' ? '#800080' : '#ccc'}}></span>
                            <span className="font-medium">{cs.color}:</span>
                            <span className={cs.stock <= 0 ? 'text-red-600 font-bold' : 'text-gray-700'}>{cs.stock} бр.</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">Без цветове</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm font-bold text-gray-900">
                      {item.stock || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStockColor(item.stock, item.reorderLevel || 0)}`}>
                      {getStockStatus(item.stock, item.reorderLevel || 0)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition"
                        title="Редактирай"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition"
                        title="Изтрий"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                  <AlertCircle className="inline mr-2" />
                  Нема продукти в инвентара. Добави първия!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-gray-300 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-600">✅ На наличност</p>
          <p className="text-2xl font-bold text-green-600">
            {inventory.filter(i => i.stock > (i.reorderLevel || 0)).length}
          </p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
          <p className="text-sm text-gray-600">⚠️ Ниско ниво</p>
          <p className="text-2xl font-bold text-orange-600">
            {inventory.filter(i => i.stock <= (i.reorderLevel || 0) && i.stock > 0).length}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
          <p className="text-sm text-gray-600">❌ Нема наличност</p>
          <p className="text-2xl font-bold text-red-600">
            {inventory.filter(i => i.stock <= 0).length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;
