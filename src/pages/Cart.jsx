import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { Trash2, Plus, Minus } from 'lucide-react';
import Input from '../components/Input';
import { SHIPPING_METHODS } from '../data/products';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, getDocs, query, where, runTransaction } from 'firebase/firestore';
import { sendOrderConfirmationEmail, sendAdminNotificationEmail } from '../services/emailService';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const { user } = useUser();
  const navigate = useNavigate();

  const [shippingMethod, setShippingMethod] = useState('econt');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    email: '',
  });

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill form data when user is logged in
  useEffect(() => {
    const loadUserData = async () => {
      if (user?.uid) {
        try {
          // Load user profile from Firestore
          const userDocRef = doc(db, 'userProfiles', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setFormData((prev) => ({
              ...prev,
              name: user.displayName || userData.displayName || prev.name,
              email: user.email || userData.email || prev.email,
              phone: userData.phone || prev.phone,
              address: userData.address || prev.address,
              city: userData.city || prev.city,
            }));
          } else {
            // If no profile data, just use auth data
            setFormData((prev) => ({
              ...prev,
              name: user.displayName || prev.name,
              email: user.email || prev.email,
            }));
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
          // Fallback to basic auth data
          setFormData((prev) => ({
            ...prev,
            name: user.displayName || prev.name,
            email: user.email || prev.email,
          }));
        }
      }
    };

    loadUserData();
  }, [user]);

  const shippingPrice = SHIPPING_METHODS.find((m) => m.id === shippingMethod)?.price || 0;
  const subtotal = getTotalPrice();
  const total = subtotal + shippingPrice;

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async () => {
    console.log('🔵 handlePlaceOrder CALLED');
    console.log('Cart items:', cartItems.length);
    
    if (cartItems.length === 0) {
      alert('Количката е празна!');
      return;
    }

    if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.email) {
      alert('Моля, попълни всички полета!');
      return;
    }

    console.log('🟡 Validation passed, setting isSubmitting...');
    setIsSubmitting(true);

    try {
      console.log('🟠 Creating order details...');
      const orderDetails = {
        items: cartItems,
        shippingMethod: SHIPPING_METHODS.find((m) => m.id === shippingMethod),
        total,
        customerInfo: formData,
        orderStatus: 'pending',
        userId: user?.uid || null,
        userName: user?.displayName || formData.name,
        userEmail: user?.email || formData.email,
        createdAt: serverTimestamp(),
      };

      console.log('🟠 DB instance:', db);
      console.log('🟠 Saving to Firestore...');
      // Запиши в Firebase
      const docRef = await addDoc(collection(db, 'orders'), orderDetails);
      console.log('✅ Order saved with ID:', docRef.id);

      // Запиши и в localStorage за backup
      localStorage.setItem('lastOrder', JSON.stringify({ ...orderDetails, id: docRef.id }));

      // Изпрати имейл уведомления
      console.log('📧 Sending email notifications...');
      try {
        // Изпрати имейл до клиента
        const customerEmailResult = await sendOrderConfirmationEmail({
          ...orderDetails,
          orderId: docRef.id,
        });
        
        if (customerEmailResult.success && !customerEmailResult.demo) {
          console.log('✅ Customer email sent successfully');
        } else if (customerEmailResult.demo) {
          console.log('⚠️ Email в demo режим (конфигурирай EmailJS за production)');
        } else {
          console.warn('⚠️ Customer email не беше изпратен:', customerEmailResult.error);
        }

        // Изпрати имейл до admin
        const adminEmailResult = await sendAdminNotificationEmail({
          ...orderDetails,
          orderId: docRef.id,
        });
        
        if (adminEmailResult.success && !adminEmailResult.demo) {
          console.log('✅ Admin notification sent successfully');
        }
      } catch (emailError) {
        console.error('⚠️ Email error (non-blocking):', emailError);
        // Не спираме процеса при грешка с имейлите
      }

      // Декрементирай наличност в инвентара
      try {
        for (const item of cartItems) {
          const invQ = query(collection(db, 'inventory'), where('productId', '==', item.productId));
          const invSnap = await getDocs(invQ);
          if (!invSnap.empty) {
            const invRef = invSnap.docs[0].ref;
            await runTransaction(db, async (tx) => {
              const invDoc = await tx.get(invRef);
              if (!invDoc.exists()) return;
              
              const invData = invDoc.data();
              const currentStock = invData.stock || 0;
              const colorStock = invData.colorStock || [];
              
              // Намери и обнови количеството за избрания цвят
              const updatedColorStock = colorStock.map(cs => {
                if (cs.color === item.selectedColor) {
                  return {
                    ...cs,
                    stock: Math.max(0, cs.stock - (item.quantity || 1))
                  };
                }
                return cs;
              }); // Запазваме всички цветове, включително тези с 0 stock
              
              // Изчисли новата обща наличност
              const newTotalStock = updatedColorStock.reduce((sum, cs) => sum + cs.stock, 0);
              
              tx.update(invRef, { 
                stock: newTotalStock,
                colorStock: updatedColorStock,
                updatedAt: new Date() 
              });
            });
          }
        }
        console.log('📦 Inventory updated after order');
      } catch (invErr) {
        console.error('❌ Inventory update failed:', invErr);
      }

      setOrderPlaced(true);
      clearCart();

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error('❌ Error saving order:', error);
      console.error('Error details:', error.message, error.code);
      alert(`❌ Грешка: ${error.message}\n\nОпитай отново или контактувай поддръжката.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="text-center max-w-md">
          <div className="text-7xl mb-6">✅</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Поръчка приета!</h1>
          <p className="text-gray-600 mb-2">
            Благодарим за покупката! Ще получиш имейл с подробности.
          </p>
          <p className="text-gray-600 mb-8">
            Редирект към начало в 3 секунди...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <section className="hero-bg text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold">Кошница</h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🛒</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Количката е празна</h2>
              <p className="text-gray-600 mb-8">Добави някой продукт, за да продължиш</p>
              <Button onClick={() => navigate('/shop')}>
                Назад в магазина
              </Button>
            </div>
          ) : (
            <>
              {/* Cart Items - Full Width Top */}
              <div className="mb-8">
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold">Вашите продукти ({cartItems.length})</h2>
                  </div>

                  <div className="divide-y divide-gray-200">
                    {cartItems.map((item, idx) => (
                      <div key={idx} className="p-6 hover:bg-gray-50 transition">
                        <div className="flex items-start gap-6">
                          <div className="text-5xl">{item.image}</div>
                          <div className="flex-grow">
                            <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                            {item.customText && (
                              <p className="text-sm text-gray-600">
                                📝 Текст: <span className="font-semibold">{item.customText}</span>
                              </p>
                            )}
                            <p className="text-sm text-gray-600">
                              🎨 Цвят: {item.selectedColor}
                            </p>
                            <p className="text-sm text-gray-600">
                              ⚡ Материал: {item.material}
                            </p>
                            <div className="mt-3 flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(idx, Math.max(1, item.quantity - 1))}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                <Minus size={16} />
                              </button>
                              <span className="px-3">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(idx, item.quantity + 1)}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-2xl font-bold text-indigo-600 mb-4">
                              {item.totalPrice.toFixed(2)} лв.
                            </div>
                            <button
                              onClick={() => removeFromCart(idx)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Summary + Shipping - Bottom Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Shipping Form - Left (Takes 2 columns) */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-lg font-bold mb-4">📍 Данни за доставка</h3>
                    <div className="space-y-4">
                      <Input
                        label="Име"
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                        placeholder="Твоето име"
                      />
                      <Input
                        label="Email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleFormChange}
                        placeholder="твоят@email.com"
                      />
                      <Input
                        label="Телефон"
                        name="phone"
                        value={formData.phone}
                        onChange={handleFormChange}
                        placeholder="+359 88..."
                      />
                      <Input
                        label="Адрес"
                        name="address"
                        value={formData.address}
                        onChange={handleFormChange}
                        placeholder="Улица и номер"
                      />
                      <Input
                        label="Град"
                        name="city"
                        value={formData.city}
                        onChange={handleFormChange}
                        placeholder="Град"
                      />
                    </div>
                  </div>
                </div>

                {/* Order Summary - Right (Sticky) */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-24">
                    {/* Shipping Methods */}
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="text-lg font-bold mb-4">🚚 Доставка</h3>
                      <div className="space-y-3">
                        {SHIPPING_METHODS.map((method) => (
                          <label key={method.id} className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                            style={{
                              borderColor: shippingMethod === method.id ? '#4f46e5' : '#e5e7eb',
                              backgroundColor: shippingMethod === method.id ? '#f3f4f6' : 'white',
                            }}
                          >
                            <input
                              type="radio"
                              name="shipping"
                              value={method.id}
                              checked={shippingMethod === method.id}
                              onChange={(e) => setShippingMethod(e.target.value)}
                              className="w-4 h-4"
                            />
                            <div className="ml-3 flex-grow">
                              <div className="font-semibold text-gray-900">{method.name}</div>
                              <div className="text-sm text-gray-600">
                                {method.price === 0 ? 'Безплатно' : `${method.price.toFixed(2)} лв.`}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="p-6 bg-gray-50 border-t border-gray-200">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-700">Междинен сбор:</span>
                          <span className="font-semibold">{subtotal.toFixed(2)} лв.</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Доставка:</span>
                          <span className="font-semibold text-indigo-600">{shippingPrice.toFixed(2)} лв.</span>
                        </div>
                        <div className="border-t pt-3 flex justify-between text-lg font-bold">
                          <span>Общо:</span>
                          <span className="text-indigo-600">{total.toFixed(2)} лв.</span>
                        </div>
                      </div>
                    </div>

                    {/* Button */}
                    <div className="p-4 border-t border-gray-200">
                      <Button
                        className="w-full text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handlePlaceOrder}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? '⏳ Обработка...' : '✅ Направи поръчка'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Cart;
