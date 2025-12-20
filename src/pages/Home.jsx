import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Palette, Printer, Truck, ArrowRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import Button from '../components/Button';
import { PRODUCTS } from '../data/products';

const Home = () => {
  const featuredProducts = PRODUCTS.slice(0, 3);

  const steps = [
    {
      icon: <Palette className="w-12 h-12" />,
      title: 'Избери дизайн',
      description: 'Разгледай нашите готови модели или качи твоя собствен',
    },
    {
      icon: <Zap className="w-12 h-12" />,
      title: 'Персонализирай',
      description: 'Избери цвят, материал и добави собствения текст',
    },
    {
      icon: <Printer className="w-12 h-12" />,
      title: 'Принтирай',
      description: 'Ние принтираме на най-висока детайлност',
    },
    {
      icon: <Truck className="w-12 h-12" />,
      title: 'Получи',
      description: 'Доставка до адреса ти в най-кратко време',
    },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="hero-bg text-white pt-32 pb-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-tight">
            Оживи идеите си <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              слой по слой
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Премиум 3D печат на персонализирани ключодържатели, фигурки и функционални части.
            Твоят дизайн или наш модел – изборът е твой.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/shop">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg shadow-indigo-500/50">
                🛒 Разгледай магазина
              </Button>
            </Link>
            <Link to="/upload">
              <Button variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-gray-900">
                📤 Качи твой файл
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Как работим?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              От идея до готов продукт в 4 лесни стъпки
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <div key={idx} className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-2xl border border-indigo-200 hover:shadow-lg transition">
                <div className="text-indigo-600 mb-4 flex justify-center">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">{step.title}</h3>
                <p className="text-gray-600 text-center text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Популярни продукти
            </h2>
            <p className="text-gray-600 text-lg">Най-поръчваните модели тази седмица</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center">
            <Link to="/shop">
              <Button className="inline-flex items-center gap-2">
                Виж всички продукти <ArrowRight size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Имаш готов 3D модел?
          </h2>
          <p className="text-lg text-indigo-100 mb-8 max-w-2xl mx-auto">
            Качи твоя .STL или .OBJ файл и получи цена за印製 в рамките на 24 часа.
          </p>
          <Link to="/upload">
            <Button variant="secondary" className="bg-white text-indigo-600 hover:bg-gray-100">
              Качи модел сега
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
