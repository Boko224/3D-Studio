# Email Templates - Примери за EmailJS

Това са примери на имейл шаблони, които можеш да използваш в EmailJS Dashboard.

## Template 1: Order Confirmation (за клиенти)

**Template Name:** `order_confirmation`  
**Template ID:** `template_order_confirmation`

### Settings:
- **To Email:** `{{to_email}}`
- **From Name:** `3D Print Studio BG`
- **Reply To:** `info@3dprintstudio.bg`

### Subject:
```
Потвърждение на поръчка #{{order_id}} - 3D Print Studio
```

### Content (HTML version):
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f9f9f9;
            padding: 30px;
            border: 1px solid #e0e0e0;
        }
        .order-details {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #667eea;
        }
        .product-item {
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        .total {
            font-size: 1.3em;
            font-weight: bold;
            color: #667eea;
            margin-top: 20px;
        }
        .footer {
            text-align: center;
            padding: 20px;
            background: #333;
            color: white;
            border-radius: 0 0 10px 10px;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎉 Благодарим за поръчката!</h1>
        <p>Поръчка #{{order_id}}</p>
    </div>
    
    <div class="content">
        <p>Здравей <strong>{{to_name}}</strong>,</p>
        
        <p>Получихме твоята поръчка и скоро ще започнем да я обработваме! 🚀</p>
        
        <div class="order-details">
            <h3>📦 Детайли на поръчката</h3>
            <p><strong>Номер:</strong> #{{order_id}}<br>
            <strong>Дата:</strong> {{order_date}}</p>
            
            <h4>Продукти:</h4>
            <div style="white-space: pre-line;">{{items_list}}</div>
            
            <hr>
            
            <p><strong>Доставка:</strong> {{shipping_method}} - {{shipping_price}}</p>
            <p class="total">Обща сума: {{total_price}}</p>
        </div>
        
        <div class="order-details">
            <h3>📍 Адрес за доставка</h3>
            <p>
                <strong>{{customer_name}}</strong><br>
                {{customer_address}}<br>
                {{customer_city}}<br>
                Тел: {{customer_phone}}
            </p>
        </div>
        
        <p>Ще се свържем с теб в рамките на <strong>24 часа</strong> за потвърждение и уточняване на детайлите.</p>
        
        <p>При въпроси, можеш да отговориш директно на този имейл.</p>
        
        <p>Поздрави,<br>
        <strong>Екипът на 3D Print Studio BG</strong></p>
    </div>
    
    <div class="footer">
        <p>3D Print Studio BG | www.3dprintstudio.bg<br>
        info@3dprintstudio.bg | +359 XXX XXX XXX</p>
    </div>
</body>
</html>
```

### Content (Plain Text version):
```
Здравей {{to_name}},

Благодарим за поръчката! 🎉

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ДЕТАЙЛИ НА ПОРЪЧКАТА
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Номер на поръчка: #{{order_id}}
Дата: {{order_date}}

ПРОДУКТИ:
{{items_list}}

ДОСТАВКА:
Метод: {{shipping_method}}
Цена доставка: {{shipping_price}}

ОБЩА СУМА: {{total_price}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
АДРЕС ЗА ДОСТАВКА
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Име: {{customer_name}}
Телефон: {{customer_phone}}
Адрес: {{customer_address}}
Град: {{customer_city}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ще се свържем с теб в рамките на 24 часа за потвърждение.

При въпроси, можеш да ни пишеш на този имейл.

Поздрави,
Екипът на 3D Print Studio BG 🚀

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3D Print Studio | www.3dprintstudio.bg
info@3dprintstudio.bg
```

---

## Template 2: Admin Notification (за администратор)

**Template Name:** `admin_notification`  
**Template ID:** `template_admin_notification`

### Settings:
- **To Email:** `admin@3dprintstudio.bg` (твоя admin email)
- **From Name:** `3D Print Studio - System`
- **Reply To:** `{{customer_email}}`

### Subject:
```
🔔 Нова поръчка #{{order_id}} от {{customer_name}}
```

### Content:
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: monospace;
            background: #1a1a1a;
            color: #0f0;
            padding: 20px;
        }
        .box {
            border: 2px solid #0f0;
            padding: 20px;
            margin: 10px 0;
            background: #0a0a0a;
        }
        h2 {
            color: #0ff;
        }
        .urgent {
            color: #ff0;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="box">
        <h2>🔔 НОВА ПОРЪЧКА</h2>
        <p class="urgent">Поръчка #{{order_id}}</p>
    </div>
    
    <div class="box">
        <h3>КЛИЕНТ:</h3>
        <p>
            Име: {{customer_name}}<br>
            Email: {{customer_email}}<br>
            Телефон: {{customer_phone}}<br>
            Адрес: {{shipping_address}}
        </p>
    </div>
    
    <div class="box">
        <h3>ПРОДУКТИ:</h3>
        <pre>{{items_list}}</pre>
    </div>
    
    <div class="box">
        <h3>СУМА:</h3>
        <p class="urgent">{{total_price}}</p>
    </div>
    
    <p>────────────────────────────────</p>
    <p>Влез в Admin панела за повече детайли.</p>
</body>
</html>
```

---

## Използвани променливи (Template Variables)

Всички тези променливи се попълват автоматично от `emailService.js`:

| Променлива | Описание | Пример |
|------------|----------|---------|
| `{{to_email}}` | Email на клиента | `customer@example.com` |
| `{{to_name}}` | Име на клиента | `Иван Петров` |
| `{{order_id}}` | ID на поръчката | `abc123xyz` |
| `{{order_date}}` | Дата на поръчката | `19.12.2025` |
| `{{items_list}}` | Списък с продукти | (форматиран текст) |
| `{{total_price}}` | Обща цена | `45.00 лв.` |
| `{{shipping_method}}` | Куриерска фирма | `Econt` |
| `{{shipping_price}}` | Цена доставка | `6.00 лв.` |
| `{{customer_name}}` | Име на клиента | `Иван Петров` |
| `{{customer_phone}}` | Телефон | `+359 888 123 456` |
| `{{customer_address}}` | Адрес | `ул. Цар Борис III 10` |
| `{{customer_city}}` | Град | `София` |
| `{{customer_email}}` | Email (копие) | `customer@example.com` |

---

## Как да копираш template-а в EmailJS

1. Влез в [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. Отвори **Email Templates** → **Create New Template**
3. Копирай **Subject** полето
4. Копирай **Content** (избери HTML или Plain Text)
5. Настрой **Settings** (To Email, From Name, Reply To)
6. **Important**: Запази Template ID точно както е посочен
7. Тествай с **Test It** бутона

---

## Тестване на templates

След като създадеш template, използвай **"Test It"** функцията в EmailJS:

1. Кликни на бутона **Test It** в template editor
2. Попълни примерни стойности:
   - `to_email`: твоя имейл
   - `to_name`: `Тестов Клиент`
   - `order_id`: `TEST123`
   - `items_list`: `1. Тестов продукт x1 - 15.00 лв.`
   - и т.н.
3. Изпрати тестов имейл
4. Провери входящата си поща

---

**Готово!** Имейлите ще се изпращат автоматично при всяка нова поръчка. 🚀
