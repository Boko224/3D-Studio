import React from 'react';
import { Facebook, Instagram, Mail, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black text-gray-400 py-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-white font-bold mb-4">За нас</h3>
            <p className="text-sm">
              3D Print Studio е вашата врата към бъдещето на персонализирани изделия.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-4">Връзки</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-indigo-400 transition">Магазин</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition">Качи модел</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition">За нас</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition">Контакти</a></li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="text-white font-bold mb-4">Контакти</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Mail size={16} />
                <span>info@3dprintstudio.bg</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} />
                <span>+359 88 123 45 67</span>
              </div>
              <div className="flex gap-4 mt-4">
                <a href="#" className="hover:text-indigo-400 transition">
                  <Facebook size={20} />
                </a>
                <a href="#" className="hover:text-indigo-400 transition">
                  <Instagram size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-sm">
          <p>&copy; 2024 3D Print Studio BG. Всички права запазени.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
