import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

const ProductCard = ({ product }) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isFav = isInWishlist(product.id);
  const outOfStock = product.stock !== undefined && product.stock <= 0;
  return (
    <Link to={`/product/${product.id}`} className={outOfStock ? 'pointer-events-none' : ''}>
      <div className={`relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all ${outOfStock ? 'opacity-60' : 'hover:-translate-y-2'} cursor-pointer border border-gray-200`}>
        {outOfStock && (
          <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
            Изчерпано количество
          </div>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 border border-gray-200 hover:border-indigo-300 shadow-sm"
          title={isFav ? 'Премахни от любими' : 'Добави в любими'}
        >
          <Heart
            size={18}
            className={isFav ? 'text-red-500 fill-red-500' : 'text-gray-500'}
          />
        </button>
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
