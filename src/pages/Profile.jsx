import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { db, auth } from '../config/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, setDoc, getDoc } from 'firebase/firestore';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import Button from '../components/Button';
import { User, Mail, LogOut, Edit2, Package, Lock, Eye, EyeOff } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, loading } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [userOrders, setUserOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile settings
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  
  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Fetch user orders from Firestore
  useEffect(() => {
    if (user?.uid) {
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.()?.toLocaleString('bg-BG') || 'N/A',
        }));
        setUserOrders(orders);
        setOrdersLoading(false);
      });

      return unsubscribe;
    }
  }, [user?.uid]);

  // Load user profile data from Firestore
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user?.uid) {
        try {
          const userDocRef = doc(db, 'userProfiles', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setPhone(userData.phone || '');
            setAddress(userData.address || '');
            setCity(userData.city || '');
            setPostalCode(userData.postalCode || '');
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      }
    };

    loadUserProfile();
  }, [user?.uid]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-2xl text-gray-600">⏳ Зареждане...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Не си логнат</h1>
          <p className="text-gray-600 mb-8">За да видиш профила си, трябва да се логнеш</p>
          <Button onClick={() => navigate('/auth')}>
            Вход / Регистрация
          </Button>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      alert('Грешка при излизане: ' + err.message);
    }
  };

  const handleUpdateName = async () => {
    if (displayName.trim() === '') {
      alert('Името не може да е празно!');
      return;
    }
    
    try {
      await user.updateProfile({
        displayName: displayName,
      });
      setIsEditing(false);
      alert('✅ Профилът е обновен успешно!');
    } catch (err) {
      alert('❌ Грешка при обновяване: ' + err.message);
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.uid) return;
    
    setProfileSaving(true);
    try {
      await setDoc(doc(db, 'userProfiles', user.uid), {
        displayName,
        phone,
        address,
        city,
        postalCode,
        email: user.email,
        updatedAt: new Date(),
      }, { merge: true });
      
      setIsEditingProfile(false);
      alert('✅ Данните са запазени успешно!');
    } catch (err) {
      alert('❌ Грешка при запазване: ' + err.message);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Моля, попълни всички полета!');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('Новите пароли не съвпадат!');
      return;
    }

    if (newPassword.length < 6) {
      alert('Новата парола трябва да е поне 6 символа!');
      return;
    }

    setPasswordLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
      alert('✅ Паролата е променена успешно!');
    } catch (err) {
      if (err.code === 'auth/wrong-password') {
        alert('❌ Текущата парола е неправилна!');
      } else {
        alert('❌ Грешка: ' + err.message);
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <section className="hero-bg text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold">Мой профил</h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4">
          {/* Tabs */}
          <div className="flex gap-2 mb-8 flex-wrap">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-3 rounded-lg font-bold transition ${
                activeTab === 'profile'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              👤 Профил
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-3 rounded-lg font-bold transition ${
                activeTab === 'settings'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              ⚙️ Настройки
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-6 py-3 rounded-lg font-bold transition ${
                activeTab === 'security'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              🔒 Сигурност
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-3 rounded-lg font-bold transition ${
                activeTab === 'orders'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              📦 Поръчки
            </button>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center gap-6 mb-8 pb-8 border-b">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User size={48} className="text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    {user?.displayName || 'Потребител'}
                  </h2>
                  <p className="text-gray-600 flex items-center gap-2 mt-2">
                    <Mail size={16} />
                    {user?.email}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">👤 Име</label>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="flex-1 px-4 py-3 border-2 border-indigo-500 rounded-lg focus:outline-none"
                      />
                      <Button onClick={handleUpdateName} className="px-6">✅ Запази</Button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setDisplayName(user?.displayName || '');
                        }}
                        className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-bold"
                      >
                        ❌ Отказ
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-lg text-gray-900">{user?.displayName || 'Няма зададено име'}</p>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-bold"
                      >
                        <Edit2 size={18} />
                        Редактирай
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">📧 Имейл</label>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-lg text-gray-900">{user?.email}</p>
                    <p className="text-xs text-gray-600 mt-1">Имейлът не може да бъде променен</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">ℹ️ Информация</label>
                  <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <p className="text-sm text-gray-600"><strong>ID:</strong> {user?.uid}</p>
                    <p className="text-sm text-gray-600 mt-2"><strong>Верификация:</strong> {user?.emailVerified ? '✅ Верифициран' : '❌ Не верифициран'}</p>
                    <p className="text-sm text-gray-600 mt-2"><strong>Регистриран на:</strong> {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('bg-BG') : 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Настройки на профила</h3>
              
              {!isEditingProfile ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><p className="text-sm font-semibold text-gray-600">Телефон</p><p className="text-lg text-gray-900">{phone || 'Не е добавен'}</p></div>
                    <div><p className="text-sm font-semibold text-gray-600">Град</p><p className="text-lg text-gray-900">{city || 'Не е добавен'}</p></div>
                    <div><p className="text-sm font-semibold text-gray-600">Адрес</p><p className="text-lg text-gray-900">{address || 'Не е добавен'}</p></div>
                    <div><p className="text-sm font-semibold text-gray-600">Пощенски код</p><p className="text-lg text-gray-900">{postalCode || 'Не е добавен'}</p></div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <button onClick={() => setIsEditingProfile(true)} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-bold">
                      <Edit2 size={18} />
                      Редактирай настройките
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">📱 Телефон</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+359 XX XXX XXXX" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none" />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">📍 Адрес</label>
                    <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="ул. Примерна 123" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">🏙️ Град</label>
                      <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="София" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">📮 Пощенски код</label>
                      <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="1000" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none" />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button onClick={handleSaveProfile} disabled={profileSaving} className="flex-1">
                      {profileSaving ? '⏳ Запазване...' : '✅ Запази'}
                    </Button>
                    <button onClick={() => { setIsEditingProfile(false); setPhone(''); setAddress(''); setCity(''); setPostalCode(''); }} className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-bold">
                      ❌ Отказ
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Сигурност</h3>
              
              {!showPasswordForm ? (
                <button onClick={() => setShowPasswordForm(true)} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-bold">
                  <Lock size={18} />
                  Смени парола
                </button>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Текуща парола</label>
                    <div className="relative">
                      <input type={showPasswords.current ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none pr-10" />
                      <button type="button" onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))} className="absolute right-3 top-3 text-gray-600">
                        {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Нова парола</label>
                    <div className="relative">
                      <input type={showPasswords.new ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none pr-10" />
                      <button type="button" onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))} className="absolute right-3 top-3 text-gray-600">
                        {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Потвърди новата парола</label>
                    <div className="relative">
                      <input type={showPasswords.confirm ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none pr-10" />
                      <button type="button" onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))} className="absolute right-3 top-3 text-gray-600">
                        {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <button type="submit" disabled={passwordLoading} className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-bold disabled:opacity-50">
                      {passwordLoading ? '⏳ Изпращане...' : '✅ Промени парола'}
                    </button>
                    <button type="button" onClick={() => { setShowPasswordForm(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }} className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-bold">
                      ❌ Отказ
                    </button>
                  </div>
                </form>
              )}

              <div className="pt-8 border-t mt-8">
                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-bold text-lg">
                  <LogOut size={20} />
                  Излез
                </button>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Package size={24} />
                История на поръчките
              </h2>

              {ordersLoading ? (
                <div className="text-center py-8 text-gray-600">⏳ Зареждане на поръчките...</div>
              ) : userOrders.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <div className="text-5xl mb-3">📭</div>
                  <p className="text-gray-600 mb-4">Няма поръчки</p>
                  <Button onClick={() => navigate('/shop')}>Начни пазаруване</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userOrders.map((order) => (
                    <div key={order.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-600 font-semibold">Номер</p>
                          <p className="text-sm font-mono text-gray-900">{order.id.substring(0, 8)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-semibold">Дата</p>
                          <p className="text-sm text-gray-900">{order.createdAt}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-semibold">Сума</p>
                          <p className="text-lg font-bold text-indigo-600">{order.total?.toFixed(2)} лв.</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-semibold">Статус</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                            order.orderStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {order.orderStatus === 'pending' ? '⏳ Очакване' : '✅ Обработена'}
                          </span>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <p className="text-sm font-bold text-gray-700 mb-2">Продукти ({order.items?.length || 0}):</p>
                        <div className="space-y-2">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="text-xs bg-gray-50 p-2 rounded">
                              {item.image} <strong>{item.name}</strong> x{item.quantity}
                              {item.customText && <div className="text-gray-600">Текст: {item.customText}</div>}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t pt-4 mt-4">
                        <p className="text-xs text-gray-600 font-semibold">🚚 Доставка</p>
                        <p className="text-sm text-gray-900">{order.shippingMethod?.name} ({order.shippingMethod?.price.toFixed(2)} лв.)</p>
                        <p className="text-xs text-gray-600 mt-2">📍 {order.customerInfo?.address}, {order.customerInfo?.city}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Profile;
