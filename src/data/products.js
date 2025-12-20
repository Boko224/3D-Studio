// Примерни продукти
export const PRODUCTS = [
  {
    id: 'keychain-001',
    name: 'Ключодържател с име',
    basePrice: 12.00,
    category: 'keychains',
    image: '🔑',
    options: {
      colors: ['Черен', 'Бял', 'Червен', 'Син'],
      materials: ['PLA', 'PETG'],
    },
    customizable: true,
    description: 'Персонализиран ключодържател с твоето име или текст.',
  },
  {
    id: 'figure-001',
    name: 'Гейминг фигурка',
    basePrice: 25.00,
    category: 'figures',
    image: '🎮',
    options: {
      colors: ['Черен', 'Сив', 'Цветен'],
      materials: ['PLA'],
    },
    customizable: false,
    description: 'Висока детайлност фигурка (0.12mm слой)',
  },
  {
    id: 'part-001',
    name: 'Механична част',
    basePrice: 18.00,
    category: 'parts',
    image: '⚙️',
    options: {
      colors: ['Черен', 'Бял'],
      materials: ['PETG'],
    },
    customizable: false,
    description: 'Функционална механична част за 3D екосистема',
  },
  {
    id: 'organizer-001',
    name: 'Органайзер за бюро',
    basePrice: 15.00,
    category: 'organizers',
    image: '📦',
    options: {
      colors: ['Черен', 'Бял', 'Син'],
      materials: ['PLA'],
    },
    customizable: true,
    description: 'Функционален органайзер с место за химикали и малки предмети',
  },
];

export const CATEGORIES = [
  { id: 'all', label: 'Всички', icon: '📦' },
  { id: 'keychains', label: 'Ключодържатели', icon: '🔑' },
  { id: 'figures', label: 'Фигурки', icon: '🎮' },
  { id: 'parts', label: 'Части', icon: '⚙️' },
  { id: 'organizers', label: 'Организатори', icon: '📋' },
];

export const COLORS = {
  'Черен': '#1f2937',
  'Бял': '#f3f4f6',
  'Червен': '#dc2626',
  'Син': '#2563eb',
  'Сив': '#6b7280',
  'Цветен': '#a855f7',
};

export const MATERIALS = {
  'PLA': 0,
  'PETG': 2.00,
};

export const SHIPPING_METHODS = [
  { id: 'econt', name: 'Econt (24-48 часа)', price: 4.00 },
  { id: 'speedy', name: 'Speedy (24-48 часа)', price: 4.50 },
  { id: 'pickup', name: 'Локално теглене (за София)', price: 0 },
];
