import React, { useMemo } from 'react';
import { TrendingUp, DollarSign, ShoppingCart, Award } from 'lucide-react';

const SalesStatistics = ({ orders }) => {
  // Изчисляване на статистиката
  const stats = useMemo(() => {
    if (!orders || orders.length === 0) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        deliveredOrders: 0,
        pendingOrders: 0,
        cancelledOrders: 0,
        topProducts: [],
        salesByColor: [],
        revenueByStatus: {},
      };
    }

    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || order.total || 0), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalRevenue / totalOrders;
    const deliveredOrders = orders.filter(o => o.orderStatus === 'delivered').length;
    const pendingOrders = orders.filter(o => o.orderStatus === 'pending').length;
    const cancelledOrders = orders.filter(o => o.orderStatus === 'cancelled').length;

    // Събиране на популярни продукти
    const productMap = {};
    const colorMap = {};
    orders.forEach(order => {
      const items = order.items || order.cartItems || [];
      items.forEach(item => {
        const pid = item.productId || item.id || item.name;
        if (!productMap[pid]) {
          productMap[pid] = {
            name: item.name,
            quantity: 0,
            revenue: 0,
            image: item.image,
          };
        }
        const qty = item.quantity || 1;
        const lineTotal = item.totalPrice || (((item.basePrice || 0) + (item.materialPrice || 0)) * qty);
        productMap[pid].quantity += qty;
        productMap[pid].revenue += lineTotal;

        const color = item.selectedColor || item.color || 'Неопределен';
        if (!colorMap[color]) {
          colorMap[color] = { color, quantity: 0, revenue: 0 };
        }
        colorMap[color].quantity += qty;
        colorMap[color].revenue += lineTotal;
      });
    });

    const topProducts = Object.values(productMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const salesByColor = Object.values(colorMap)
      .sort((a, b) => b.quantity - a.quantity);

    // Приход по статус
    const revenueByStatus = {};
    orders.forEach(order => {
      const status = order.orderStatus || 'unknown';
      if (!revenueByStatus[status]) {
        revenueByStatus[status] = 0;
      }
      revenueByStatus[status] += order.totalAmount || order.total || 0;
    });

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      deliveredOrders,
      pendingOrders,
      cancelledOrders,
      topProducts,
      salesByColor,
      revenueByStatus,
    };
  }, [orders]);

  // Статус цветове
  const getStatusColor = (status) => {
    const colors = {
      'pending': 'from-yellow-400 to-yellow-600',
      'processing': 'from-blue-400 to-blue-600',
      'shipped': 'from-purple-400 to-purple-600',
      'delivered': 'from-green-400 to-green-600',
      'cancelled': 'from-red-400 to-red-600',
    };
    return colors[status] || 'from-gray-400 to-gray-600';
  };

  const statusLabels = {
    'pending': '⏳ Чакащ',
    'processing': '⚙️ Обработване',
    'shipped': '🚚 Изпратен',
    'delivered': '✅ Доставен',
    'cancelled': '❌ Отменен',
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">📊 Статистика на продажби</h2>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-green-500 to-green-700 text-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-80 font-semibold">Общ приход</p>
              <p className="text-3xl font-bold mt-2">{stats.totalRevenue.toFixed(2)} лв.</p>
              <p className="text-xs opacity-75 mt-1">💰 Преглед на приходите</p>
            </div>
            <DollarSign size={32} className="opacity-80" />
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-80 font-semibold">Общо поръчки</p>
              <p className="text-3xl font-bold mt-2">{stats.totalOrders}</p>
              <p className="text-xs opacity-75 mt-1">📦 Всички поръчки</p>
            </div>
            <ShoppingCart size={32} className="opacity-80" />
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-80 font-semibold">Средна стойност</p>
              <p className="text-3xl font-bold mt-2">{stats.averageOrderValue.toFixed(2)} лв.</p>
              <p className="text-xs opacity-75 mt-1">📈 На поръчка</p>
            </div>
            <TrendingUp size={32} className="opacity-80" />
          </div>
        </div>

        {/* Delivered Orders */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-700 text-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-80 font-semibold">Доставени</p>
              <p className="text-3xl font-bold mt-2">{stats.deliveredOrders}</p>
              <p className="text-xs opacity-75 mt-1">✅ Завършени поръчки</p>
            </div>
            <Award size={32} className="opacity-80" />
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-400">
          <p className="text-sm text-gray-600 font-semibold">⏳ Чакащи поръчки</p>
          <p className="text-2xl font-bold text-yellow-600 mt-2">{stats.pendingOrders}</p>
          <p className="text-xs text-gray-500 mt-1">Чакат обработка</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-400">
          <p className="text-sm text-gray-600 font-semibold">❌ Отменени</p>
          <p className="text-2xl font-bold text-red-600 mt-2">{stats.cancelledOrders}</p>
          <p className="text-xs text-gray-500 mt-1">Отменени поръчки</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-400">
          <p className="text-sm text-gray-600 font-semibold">✅ Успешност</p>
          <p className="text-2xl font-bold text-green-600 mt-2">
            {stats.totalOrders > 0 ? ((stats.deliveredOrders / stats.totalOrders) * 100).toFixed(1) : 0}%
          </p>
          <p className="text-xs text-gray-500 mt-1">Доставени / Всички</p>
        </div>
      </div>

      {/* Revenue by Status */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">💹 Приход по статус</h3>
        <div className="space-y-3">
          {Object.entries(stats.revenueByStatus)
            .sort((a, b) => b[1] - a[1])
            .map(([status, revenue]) => {
              const totalRevenue = stats.totalRevenue || 1;
              const percentage = (revenue / totalRevenue) * 100;
              return (
                <div key={status}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-gray-700">
                      {statusLabels[status] || status}
                    </span>
                    <span className="text-sm font-bold text-gray-800">
                      {revenue.toFixed(2)} лв. ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${getStatusColor(status)}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🏆 Топ продукти по приход</h3>
        {stats.topProducts.length > 0 ? (
          <div className="space-y-3">
            {stats.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{product.image}</span>
                  <div>
                    <p className="font-semibold text-gray-800">{product.name}</p>
                    <p className="text-xs text-gray-600">
                      {product.quantity} {product.quantity === 1 ? 'брой' : 'броя'} продадени
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{product.revenue.toFixed(2)} лв.</p>
                  <p className="text-xs text-gray-600">
                    {((product.revenue / stats.totalRevenue) * 100).toFixed(1)}% от приходите
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">Нема продадени продукти</p>
        )}
      </div>

      {/* Sales by Colors */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🎨 Продажби по цветове</h3>
        {stats.salesByColor.length > 0 ? (
          <div className="space-y-3">
            {stats.salesByColor.map((entry) => (
              <div key={entry.color} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="inline-block w-5 h-5 rounded border border-gray-300" style={{backgroundColor: '#fff'}}></span>
                  <div>
                    <p className="font-semibold text-gray-800">{entry.color}</p>
                    <p className="text-xs text-gray-600">{entry.quantity} бр.</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{entry.revenue.toFixed(2)} лв.</p>
                  <p className="text-xs text-gray-600">{((entry.revenue / (stats.totalRevenue || 1)) * 100).toFixed(1)}% от приходите</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">Нема данни за цветове</p>
        )}
      </div>
    </div>
  );
};

export default SalesStatistics;
