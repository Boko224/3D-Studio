import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import OrdersTable from '../components/OrdersTable';
import SalesStatistics from '../components/SalesStatistics';
import InventoryManagement from '../components/InventoryManagement';
import LowStockAlert from '../components/LowStockAlert';

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [modelRequests, setModelRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('statistics');
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  const ADMIN_PASSWORD = 'admin123'; // ⚠️ Замени със силна парола!

  useEffect(() => {
    // Check if already authenticated
    const savedAuth = localStorage.getItem('adminAuth');
    if (savedAuth) {
      setIsAuthenticated(true);
      fetchData();
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuth', 'true');
      setPassword('');
      fetchData();
    } else {
      alert('Неправилна парола!');
    }
  };

  const fetchData = () => {
    setLoading(true);

    // Fetch orders
    const ordersRef = collection(db, 'orders');
    const ordersQuery = query(ordersRef, orderBy('createdAt', 'desc'));
    
    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toLocaleString('bg-BG') || 'N/A'
      }));
      setOrders(ordersData);
    });

    // Fetch model requests
    const requestsRef = collection(db, 'modelRequests');
    const requestsQuery = query(requestsRef, orderBy('createdAt', 'desc'));
    
    const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
      const requestsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toLocaleString('bg-BG') || 'N/A'
      }));
      setModelRequests(requestsData);
      setLoading(false);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeRequests();
    };
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuth');
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        orderStatus: newStatus,
      });
      console.log('✅ Order status updated to:', newStatus);
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      alert('Грешка при обновяване на статуса');
    }
  };

  // Update request status
  const updateRequestStatus = async (requestId, newStatus) => {
    try {
      const requestRef = doc(db, 'modelRequests', requestId);
      await updateDoc(requestRef, {
        requestStatus: newStatus,
      });
      console.log('✅ Request status updated to:', newStatus);
    } catch (error) {
      console.error('❌ Error updating request status:', error);
      alert('Грешка при обновяване на статуса');
    }
  };

  // Handle restock from low stock alert
  const handleRestock = (productId) => {
    setSelectedProductId(productId);
    setActiveTab('inventory');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🔐</div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600 mt-2">Въведи парола за достъп</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Парола..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition"
            >
              Вход
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Изход
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-4 mb-6 border-b overflow-x-auto">
          <button
            onClick={() => setActiveTab('statistics')}
            className={`px-6 py-3 font-bold transition whitespace-nowrap ${
              activeTab === 'statistics'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📊 Статистика
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 font-bold transition whitespace-nowrap ${
              activeTab === 'orders'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📦 Поръчки ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-6 py-3 font-bold transition whitespace-nowrap ${
              activeTab === 'inventory'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📦 Инвентар
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-3 font-bold transition whitespace-nowrap ${
              activeTab === 'requests'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📤 Качвания ({modelRequests.length})
          </button>
        </div>

        {/* Low Stock Alert Banner */}
        <LowStockAlert onRestock={handleRestock} />

        {loading ? (
          <div className="text-center py-12">
            <div className="text-2xl">⏳ Зареждане...</div>
          </div>
        ) : (
          <>
            {/* Statistics Tab */}
            {activeTab === 'statistics' && (
              <div>
                <SalesStatistics orders={orders} />
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                <OrdersTable orders={orders} onStatusUpdate={updateOrderStatus} />
              </div>
            )}

            {/* Inventory Tab */}
            {activeTab === 'inventory' && (
              <div>
                <InventoryManagement selectedProductId={selectedProductId} />
              </div>
            )}

            {/* Model Requests Tab */}
            {activeTab === 'requests' && (
              <div className="space-y-4">
                {modelRequests.length === 0 ? (
                  <div className="bg-white rounded-lg p-8 text-center text-gray-500">
                    Няма качвания
                  </div>
                ) : (
                  modelRequests.map((request) => (
                    <div key={request.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h3 className="font-bold text-lg mb-2">{request.customerInfo?.name}</h3>
                          <p className="text-sm text-gray-600">📧 {request.customerInfo?.email}</p>
                          <p className="text-sm text-gray-600">📱 {request.customerInfo?.phone}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">⏰ {request.createdAt}</p>
                          
                          {/* Status with toggle buttons */}
                          <div className="mt-3 flex gap-2 justify-end">
                            <button
                              onClick={() => updateRequestStatus(request.id, 'pending')}
                              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition ${
                                request.requestStatus === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800 ring-2 ring-yellow-300'
                                  : 'bg-gray-200 text-gray-600 hover:bg-yellow-100'
                              }`}
                            >
                              ⏳ Нов
                            </button>
                            <button
                              onClick={() => updateRequestStatus(request.id, 'reviewed')}
                              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition ${
                                request.requestStatus === 'reviewed'
                                  ? 'bg-green-100 text-green-800 ring-2 ring-green-300'
                                  : 'bg-gray-200 text-gray-600 hover:bg-green-100'
                              }`}
                            >
                              ✅ Разглеждан
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="font-bold mb-2">📝 Описание:</h4>
                        <p className="text-gray-700 mb-4">{request.customerInfo?.description}</p>

                        <h4 className="font-bold mb-2">📁 Качени файлове:</h4>
                        <div className="space-y-2">
                          {request.files?.map((file, idx) => (
                            <div key={idx} className="text-sm bg-gray-50 p-3 rounded">
                              📄 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
