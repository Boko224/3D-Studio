# 🔥 Firebase Setup Guide

## Стъпка 1: Създай Firebase проект

1. Отиди на https://firebase.google.com/
2. Натисни "Get Started" → "Create a project"
3. Назови го: **3d-print-studio**
4. Избери регион и создай проект

## Стъпка 2: Вземи Firebase конфигурация

1. В Firebase Console, отиди на **Project Settings** (⚙️ икона)
2. Избери **"Web"** приложение
3. Регистрирай ново app и копирай конфигът

Ще изглежда така:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "3d-print-studio",
  storageBucket: "3d-print-studio.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};
```

## Стъпка 3: Обнови Firebase конфиг файла

Отвори `src/config/firebase.js` и замени конфига:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Стъпка 4: Включи Firestore Database

1. В Firebase Console, отиди на **Firestore Database**
2. Натисни **"Create Database"**
3. Избери **"Start in test mode"** (за разработка)
4. Избери регион (closest to you) → **Create**

## Стъпка 5: Създай Firestore Rules (за production)

1. Отиди на **Firestore Database** → **Rules** таб
2. Замени с:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Всеки може да чете и пише (за развойна среда)
    match /{document=**} {
      allow read, write;
    }
  }
}
```

⚠️ **За production:** Направи правилата по-строги за безопасност!

## Стъпка 6: Тестирай базата данни

1. Рестартирай сервера: `npm run dev`
2. Направи поръчка в магазина
3. Отиди на **Admin Panel** (`http://localhost:5173/admin`)
4. Парола по default е: `admin123` (ЗАМЕНИ Я!)
5. Проверка дали поръчката се показва

## 📱 Структура на базата данни

### Collection: `orders`
```
{
  items: [
    {
      productId: "keychain-001",
      name: "Ключодържател",
      quantity: 2,
      customText: "IVAN",
      selectedColor: "Black",
      material: "PLA",
      totalPrice: 24.00
    }
  ],
  customerInfo: {
    name: "John Doe",
    email: "john@example.com",
    phone: "+359 88...",
    address: "Street 123",
    city: "Sofia"
  },
  shippingMethod: {
    id: "econt",
    name: "Econt (24-48 часа)",
    price: 4.00
  },
  total: 28.00,
  orderStatus: "pending",
  createdAt: "2025-11-27T10:30:00Z"
}
```

### Collection: `modelRequests`
```
{
  customerInfo: {
    name: "John Doe",
    email: "john@example.com",
    phone: "+359 88...",
    description: "Качи STL файл за печат..."
  },
  files: [
    {
      name: "model.stl",
      size: 1024000,
      type: "application/octet-stream"
    }
  ],
  requestStatus: "pending",
  createdAt: "2025-11-27T10:30:00Z"
}
```

## 🔐 Промени Admin паролата

Отвори `src/pages/Admin.jsx` и замени:

```javascript
const ADMIN_PASSWORD = 'admin123'; // ЗАМЕНИ СЪС ТВОЯ ПАРОЛА!
```

## ✅ Готово!

Твоята база данни е настроена! Всички поръчки и качвания ще се запазват автоматично в Firestore.

---

## 🆘 Проблеми?

### "Firebase не е инициализиран"
- Провери че конфигът е правилно въведен в `firebase.js`

### "Няма разрешение" (Permission Denied)
- Провери Firestore Rules - трябва да позволяват read/write

### "Firestore не е намерен"
- Убедете се че си активирал Firestore Database в Firebase Console

## 📚 Полезни линкове

- Firebase Docs: https://firebase.google.com/docs
- Firestore Database: https://firebase.google.com/docs/firestore
- React + Firebase: https://firebase.google.com/docs/web/setup
