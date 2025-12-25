import React, { useState } from 'react';
import { Search, Filter, ChevronDown, Eye, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

const OrdersTable = ({ orders, onStatusUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Фильтриране и сортиране
  const filteredOrders = orders
    .filter(order => {
      const matchSearch =
        order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
      
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'price') {
        return (b.totalAmount || 0) - (a.totalAmount || 0);
      } else if (sortBy === 'status') {
        return (a.orderStatus || '').localeCompare(b.orderStatus || '');
      }
      return 0;
    });

  // Изтриване на поръчка
  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Сигурен ли си че искаш да изтриеш тази поръчка?')) {
      setDeletingId(orderId);
      try {
        await deleteDoc(doc(db, 'orders', orderId));
        alert('✅ Поръчката е изтрита успешно');
      } catch (error) {
        alert('❌ Грешка при изтриване: ' + error.message);
      } finally {
        setDeletingId(null);
      }
    }
  };

  // Статус цветове
  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'processing': 'bg-blue-100 text-blue-800',
      'shipped': 'bg-purple-100 text-purple-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const statusLabels = {
    'pending': '⏳ Чакащ',
    'processing': '⚙️ Обработване',
    'shipped': '🚚 Изпратен',
    'delivered': '✅ Доставен',
    'cancelled': '❌ Отменен',
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">📦 Таблица на поръчките</h2>

      {/* Search & Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Търси по имейл, ID..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">🔽 Всички статуси</option>
          <option value="pending">⏳ Чакащ</option>
          <option value="processing">⚙️ Обработване</option>
          <option value="shipped">🚚 Изпратен</option>
          <option value="delivered">✅ Доставен</option>
          <option value="cancelled">❌ Отменен</option>
        </select>

        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="date">📅 Сортирай по дата</option>
          <option value="price">💰 Сортирай по цена</option>
          <option value="status">📌 Сортирай по статус</option>
        </select>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-600">
        Намерени: <span className="font-bold text-blue-600">{filteredOrders.length}</span> поръчки
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-300">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Клиент</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Сума</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Статус</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Дата</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <React.Fragment key={order.id}>
                  <tr className="border-b border-gray-200 hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm font-mono text-gray-700">
                      {order.id.substring(0, 8)}...
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <div className="font-medium">{order.userName || order.customerInfo?.name || order.customerName || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{order.userEmail || order.customerInfo?.email || order.customerEmail || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      {(order.totalAmount || order.total || 0).toFixed(2)} лв.
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.orderStatus)}`}>
                        {statusLabels[order.orderStatus] || order.orderStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {typeof order.createdAt === 'string' ? order.createdAt.split(' ')[0] : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                          className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition"
                          title="Преглед"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          disabled={deletingId === order.id}
                          className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition disabled:opacity-50"
                          title="Изтрий"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Details */}
                  {expandedOrder === order.id && (
                    <tr className="bg-blue-50 border-b border-gray-200">
                      <td colSpan="6" className="px-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Order Details */}
                          <div>
                            <h4 className="font-bold text-gray-800 mb-2">📋 Детайли на поръчката:</h4>
                            <div className="text-sm text-gray-700 space-y-1">
                              <p><strong>Адрес:</strong> {order.customerInfo?.address || order.address || 'N/A'}</p>
                              <p><strong>Град:</strong> {order.customerInfo?.city || order.city || 'N/A'}</p>
                              <p><strong>Пощински код:</strong> {order.customerInfo?.postalCode || order.postalCode || 'N/A'}</p>
                              <p><strong>Телефон:</strong> {order.customerInfo?.phone || order.phone || 'N/A'}</p>
                              <p><strong>Бележка:</strong> {order.notes || 'Нема бележка'}</p>
                            </div>
                          </div>

                          {/* Products */}
                          <div>
                            <h4 className="font-bold text-gray-800 mb-2">🛒 Продукти:</h4>
                            <div className="text-sm text-gray-700 space-y-2">
                              {(order.items || order.cartItems) && (order.items || order.cartItems).length > 0 ? (
                                (order.items || order.cartItems).map((item, idx) => (
                                  <div key={idx} className="bg-white p-2 rounded border border-gray-200">
                                    <p><strong>{item.name}</strong></p>
                                    <p className="text-xs text-gray-500">
                                      Кол: {item.quantity} x {(item.basePrice || 0).toFixed(2)} лв. = {(item.totalPrice || 0).toFixed(2)} лв.
                                    </p>
                                    {(item.selectedColor || item.color) && (
                                      <p className="text-xs">🎨 Цвят: {item.selectedColor || item.color}</p>
                                    )}
                                    {item.material && <p className="text-xs">📦 Материал: {item.material}</p>}
                                  </div>
                                ))
                              ) : (
                                <p className="text-gray-500">Нема продукти</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status Update */}
                        <div className="mt-4 pt-4 border-t border-gray-300">
                          <h4 className="font-bold text-gray-800 mb-2">🔄 Обновяване на статус:</h4>
                          <div className="flex gap-2 flex-wrap">
                            {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                              <button
                                key={status}
                                onClick={() => onStatusUpdate(order.id, status)}
                                className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
                                  order.orderStatus === status
                                    ? getStatusColor(status)
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                              >
                                {statusLabels[status]}
                              </button>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                  <AlertCircle className="inline mr-2" />
                  Нема поръчки за отображение
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersTable;
