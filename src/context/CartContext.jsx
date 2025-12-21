import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);

  const openMiniCart = () => setIsMiniCartOpen(true);
  const closeMiniCart = () => setIsMiniCartOpen(false);
  const toggleMiniCart = () => setIsMiniCartOpen((prev) => !prev);

  const calculateLineTotal = (item, quantity) => {
    const unitPrice = (item.basePrice || 0) + (item.materialPrice || 0);
    return unitPrice * (quantity || 1);
  };

  const addToCart = (product) => {
    setCartItems((prev) => {
      const productWithTotal = {
        ...product,
        quantity: product.quantity || 1,
        totalPrice: calculateLineTotal(product, product.quantity || 1),
      };
      const updated = [...prev, productWithTotal];
      localStorage.setItem('cart', JSON.stringify(updated));
      return updated;
    });
    openMiniCart();
  };

  const removeFromCart = (index) => {
    setCartItems((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      localStorage.setItem('cart', JSON.stringify(updated));
      return updated;
    });
  };

  const updateQuantity = (index, quantity) => {
    setCartItems((prev) => {
      const updated = [...prev];
      const safeQty = Math.max(1, quantity);
      updated[index].quantity = safeQty;
      updated[index].totalPrice = calculateLineTotal(updated[index], safeQty);
      localStorage.setItem('cart', JSON.stringify(updated));
      return updated;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + calculateLineTotal(item, item.quantity || 1), 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      isMiniCartOpen,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalPrice,
      openMiniCart,
      closeMiniCart,
      toggleMiniCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
