import React from 'react';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';
import { Award, Users, Zap } from 'lucide-react';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full">
      {/* Header */}
      <section className="hero-bg text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">За нас</h1>
          <p className="text-gray-300 text-lg">
            Откривайте историята зад 3D Print Studio
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Какво е 3D Print Studio?
              </h2>
              <p className="text-gray-600 text-lg mb-4 leading-relaxed">
                3D Print Studio е съвременна платформа за персонализирани 3D печатни решения. Основана през 2024 година, ние се стремим да направим 3D печата достъпен и лесен за всеки.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                От персонализирани ключодържатели до сложни механични части, имаме опит и качество да превърнем идеите ти в реалност.
              </p>
            </div>
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl p-12 h-96 flex items-center justify-center">
              <img src="/ChatGPT Image 21.12.2025 г., 15_20_34 (1).png" alt="3D Studio Logo" className="h-80 object-contain" />
            </div>
          </div>

          {/* Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-2xl border border-indigo-200">
              <Award className="text-indigo-600 mb-4" size={32} />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Висока качество
              </h3>
              <p className="text-gray-600">
                Използваме професионално оборудване и най-добрите материали за гарантирана качество.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl border border-purple-200">
              <Users className="text-purple-600 mb-4" size={32} />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Клиентоцентричност
              </h3>
              <p className="text-gray-600">
                Твоята задоволеност е нашата приоритет. Слушаме и адаптираме.
              </p>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-red-50 p-8 rounded-2xl border border-pink-200">
              <Zap className="text-pink-600 mb-4" size={32} />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Инновация
              </h3>
              <p className="text-gray-600">
                Постоянно актуализираме технологиите и методите за най-добрите резултати.
              </p>
            </div>
          </div>

          {/* Process */}
          <div className="mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
              Нашия процес
            </h2>

            <div className="space-y-6">
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-600 text-white font-bold text-lg">
                    1
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Консултация</h3>
                  <p className="text-gray-600 mt-2">
                    Анализираме твоя файл или дизайн, проверяваме съответствието със нашите спецификации.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-600 text-white font-bold text-lg">
                    2
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Ценообразуване</h3>
                  <p className="text-gray-600 mt-2">
                    Получаваш детайлна оферта с точната цена и времеви рамки.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-600 text-white font-bold text-lg">
                    3
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Печат</h3>
                  <p className="text-gray-600 mt-2">
                    Старираме твоя проект с перфекционизъм, използвайки най-добрите настройки за материала.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-600 text-white font-bold text-lg">
                    4
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Последваща обработка & Доставка</h3>
                  <p className="text-gray-600 mt-2">
                    Филираме, почистваме и готвим продукта за доставка. Изпращаме ти със следене.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Team */}
          <div className="mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
              Нашият екип
            </h2>
            <p className="text-gray-600 text-lg text-center max-w-2xl mx-auto mb-12">
              Съставени от инженери, дизайнери и ентусиасти за 3D печат, които са страстни по своята работа.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg transition">
                <div className="text-6xl mb-4">👨‍🔧</div>
                <h3 className="text-xl font-bold text-gray-900">Технически експерти</h3>
                <p className="text-gray-600 mt-2">
                  С над 10 години опит с различни 3D принтери и технологии.
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg transition">
                <div className="text-6xl mb-4">🎨</div>
                <h3 className="text-xl font-bold text-gray-900">Дизайнери</h3>
                <p className="text-gray-600 mt-2">
                  Помагаме на клиентите да оптимизират техните модели за печат.
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg transition">
                <div className="text-6xl mb-4">🚀</div>
                <h3 className="text-xl font-bold text-gray-900">Иноватори</h3>
                <p className="text-gray-600 mt-2">
                  Постоянно探索着 новите технологии и методи в 3D печата.
                </p>
              </div>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-12 text-center">
            <h2 className="text-4xl font-bold mb-6">
              Искаш ли да работиш с нас?
            </h2>
            <p className="text-lg text-indigo-100 mb-8 max-w-2xl mx-auto">
              Свържи се с нас за по-сложни проекти, партньорства или персонализирани решения.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button variant="secondary" onClick={() => navigate('/shop')}>
                Разгледай магазина
              </Button>
              <Button variant="secondary" onClick={() => navigate('/upload')}>
                Качи проект
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Contact */}
      <section className="py-12 bg-gray-50 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Контакти</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className="text-gray-600 mb-2">📧 Email</p>
              <a href="mailto:info@3dprintstudio.bg" className="text-indigo-600 font-semibold hover:text-indigo-700">
                info@3dprintstudio.bg
              </a>
            </div>
            <div>
              <p className="text-gray-600 mb-2">📱 Телефон</p>
              <a href="tel:+359881234567" className="text-indigo-600 font-semibold hover:text-indigo-700">
                +359 88 123 45 67
              </a>
            </div>
            <div>
              <p className="text-gray-600 mb-2">📍 Адрес</p>
              <p className="text-indigo-600 font-semibold">
                София, България
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
