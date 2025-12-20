import React, { useState } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import { sendOrderConfirmationEmail } from '../services/emailService';

const TestEmail = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!email) {
      alert('Въведи имейл получател');
      return;
    }
    setIsSending(true);
    setStatus(null);

    // Създай примерни данни за поръчка
    const orderData = {
      items: [
        {
          name: 'Тестов продукт',
          quantity: 1,
          finalPrice: 19.99,
          selectedColor: 'Черен',
          material: 'PLA',
        },
      ],
      shippingMethod: { id: 'econt', name: 'Econt', price: 6.0 },
      total: 25.99,
      customerInfo: {
        name: 'Тестов Клиент',
        phone: '+359 888 000 000',
        address: 'ул. Тест 1',
        city: 'София',
      },
      orderStatus: 'pending',
      userId: null,
      userName: 'Тестов Клиент',
      userEmail: email,
      orderId: `TEST-${Date.now()}`,
    };

    const res = await sendOrderConfirmationEmail(orderData);
    setIsSending(false);
    setStatus(res);
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">Тест на Email уведомление</h1>
      <p className="text-gray-600 mb-6">
        Въведи имейл за получаване и изпрати тестово потвърждение на поръчка.
      </p>

      <div className="space-y-4">
        <Input
          type="email"
          name="email"
          placeholder="customer@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button onClick={handleSend} disabled={isSending}>
          {isSending ? 'Изпращане...' : 'Изпрати тестов имейл'}
        </Button>
      </div>

      {status && (
        <div className="mt-6 p-4 rounded-lg border">
          {status.success ? (
            <div>
              <div className="text-2xl mb-2">✅</div>
              <p className="font-semibold">Имейл изпратен успешно</p>
              {status.demo && (
                <p className="text-sm text-gray-600 mt-2">
                  Работи в demo режим — конфигурирай EmailJS за реално изпращане.
                </p>
              )}
            </div>
          ) : (
            <div>
              <div className="text-2xl mb-2">⚠️</div>
              <p className="font-semibold">Грешка при изпращане</p>
              <p className="text-sm text-gray-600 mt-2">{status.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TestEmail;
