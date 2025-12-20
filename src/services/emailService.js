import emailjs from '@emailjs/browser';

// EmailJS Configuration
// За да работи това, трябва да създадеш акаунт в EmailJS (https://www.emailjs.com/)
// и да замениш следните стойности с твоите credentials

const EMAILJS_SERVICE_ID = 'service_3d'; // Попълнено от EmailJS (Gmail Personal Service)
const EMAILJS_TEMPLATE_ID = 'template_81zhabe'; // Клиентски Template ID (Order Confirmation)
const EMAILJS_PUBLIC_KEY = 'jtItF9BNDYak0eI2y'; // EmailJS Public Key

/**
 * Изпраща имейл уведомление за нова поръчка
 * @param {Object} orderData - Данни за поръчката
 * @returns {Promise} - Promise който resolve-ва при успех
 */
export const sendOrderConfirmationEmail = async (orderData) => {
  try {
    // Проверка дали EmailJS е конфигуриран
    if (EMAILJS_SERVICE_ID === 'service_your_id' || 
        EMAILJS_TEMPLATE_ID === 'template_your_id' || 
        EMAILJS_PUBLIC_KEY === 'your_public_key') {
      console.warn('⚠️ EmailJS не е конфигуриран. Моля, обнови credentials в src/services/emailService.js');
      // В dev режим, просто показваме съобщението в конзолата
      console.log('📧 EMAIL (Demo Mode):', orderData);
      return { success: true, demo: true };
    }

    // Подготви данните за шаблона
    const itemsForTemplate = (orderData.items || []).map((item) => ({
      name: item.name || 'Продукт',
      units: item.quantity ?? 1,
      price: (item.finalPrice ?? item.totalPrice ?? item.price ?? 0).toFixed(2),
    }));

    const templateParams = {
      // Основни (нашите документационни променливи)
      to_email: orderData.userEmail,
      to_name: orderData.userName,
      // Дублирани ключове за съвместимост с готови шаблони на EmailJS
      email: orderData.userEmail,
      name: orderData.userName,
      // Детайли за поръчка
      order_id: orderData.orderId,
      order_date: new Date().toLocaleDateString('bg-BG'),
      items_list: formatItemsList(orderData.items),
      total_price: `${orderData.total.toFixed(2)} лв.`,
      // За шаблони с item repeater ({{#orders}})
      orders: itemsForTemplate,
      // За шаблони които използват {{price}} като обща сума
      price: orderData.total.toFixed(2),
      shipping_method: orderData.shippingMethod?.name || 'Не е посочен',
      shipping_price: `${orderData.shippingMethod?.price || 0} лв.`,
      // Обект за dot-нотация: {{cost.shipping}} и {{cost.tax}}
      cost: {
        shipping: (orderData.shippingMethod?.price || 0).toFixed(2),
        tax: (orderData.tax ?? 0).toFixed(2),
        total: (((orderData.total ?? 0) + (orderData.tax ?? 0))).toFixed(2),
      },
      // Адрес и контакти
      customer_name: orderData.customerInfo.name,
      customer_phone: orderData.customerInfo.phone,
      customer_address: orderData.customerInfo.address,
      customer_city: orderData.customerInfo.city,
    };

    // Изпрати имейла
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    console.log('✅ Email sent successfully:', response);
    return { success: true, response };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    // Не блокираме процеса на поръчката, само логваме грешката
    return { success: false, error: error.message };
  }
};

/**
 * Изпраща имейл уведомление до admin за нова поръчка
 * @param {Object} orderData - Данни за поръчката
 * @returns {Promise} - Promise който resolve-ва при успех
 */
export const sendAdminNotificationEmail = async (orderData) => {
  try {
    // Проверка дали EmailJS е конфигуриран
    if (EMAILJS_SERVICE_ID === 'service_your_id' || 
        EMAILJS_TEMPLATE_ID === 'template_your_id' || 
        EMAILJS_PUBLIC_KEY === 'your_public_key') {
      console.warn('⚠️ EmailJS не е конфигуриран.');
      console.log('📧 ADMIN EMAIL (Demo Mode):', orderData);
      return { success: true, demo: true };
    }

    const templateParams = {
      to_email: 'admin@3dprintstudio.bg', // Замени с admin email
      subject: `Нова поръчка #${orderData.orderId}`,
      order_id: orderData.orderId,
      customer_name: orderData.customerInfo.name,
      customer_email: orderData.userEmail,
        customer_phone: orderData.customerInfo.phone,
        // Дублирани ключове за съвместимост
        orders: (orderData.items || []).map((item) => ({
          name: item.name || 'Продукт',
          units: item.quantity ?? 1,
          price: (item.finalPrice ?? item.totalPrice ?? item.price ?? 0).toFixed(2),
        })),
        items_list: formatItemsList(orderData.items),
        total_price: `${orderData.total.toFixed(2)} лв.`,
        price: orderData.total.toFixed(2),
        cost: {
          shipping: (orderData.shippingMethod?.price || 0).toFixed(2),
          tax: (orderData.tax ?? 0).toFixed(2),
          total: (((orderData.total ?? 0) + (orderData.tax ?? 0))).toFixed(2),
        },
      shipping_address: `${orderData.customerInfo.address}, ${orderData.customerInfo.city}`,
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      'template_admin_notification', // Трябва да създадеш втори template за admin
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    console.log('✅ Admin notification sent:', response);
    return { success: true, response };
  } catch (error) {
    console.error('❌ Error sending admin notification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Форматира списък с продукти за имейла
 * @param {Array} items - Масив с продукти
 * @returns {string} - Форматиран HTML string
 */
const formatItemsList = (items) => {
  return items.map((item, idx) => {
    const price = (item.finalPrice ?? item.totalPrice ?? item.price ?? 0);
    const qty = item.quantity ?? 1;
    let itemText = `${idx + 1}. ${item.name || 'Продукт'} x${qty} - ${price.toFixed(2)} лв.\n`;
    if (item.customText) itemText += `   📝 Текст: ${item.customText}\n`;
    if (item.selectedColor) itemText += `   🎨 Цвят: ${item.selectedColor}\n`;
    if (item.material) itemText += `   ⚡ Материал: ${item.material}\n`;
    return itemText;
  }).join('\n');
};

export default {
  sendOrderConfirmationEmail,
  sendAdminNotificationEmail,
};
