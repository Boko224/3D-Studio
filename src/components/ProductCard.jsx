import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  return (
    <Link to={`/product/${product.id}`}>
      <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all hover:-translate-y-2 cursor-pointer border border-gray-200">
        <div className="h-64 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-6xl">
          {product.image}
        </div>
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">{product.name}</h3>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-indigo-600">{product.basePrice.toFixed(2)} лв.</span>
            <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
              {product.category}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
