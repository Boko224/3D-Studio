import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { db } from '../config/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useUser } from './UserContext';

const WishlistContext = createContext();

const normalizeItem = (product) => ({
  productId: product.id || product.productId,
  name: product.name,
  basePrice: product.basePrice || 0,
  image: product.image || '📦',
  category: product.category || 'other',
  slug: product.slug || product.id || product.productId,
  addedAt: product.addedAt || new Date().toISOString(),
});

const readGuestStorage = () => {
  try {
    const saved = localStorage.getItem('wishlist_guest');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Wishlist guest read failed', e);
    return [];
  }
};

const writeGuestStorage = (items) => {
  try {
    localStorage.setItem('wishlist_guest', JSON.stringify(items));
  } catch (e) {
    console.error('Wishlist guest write failed', e);
  }
};

export const WishlistProvider = ({ children }) => {
  const { user } = useUser();
  const [wishlist, setWishlist] = useState(() => readGuestStorage());
  const [loading, setLoading] = useState(false);

  // Load and merge remote wishlist when user logs in
  useEffect(() => {
    const syncFromRemote = async () => {
      if (!user?.uid) return;
      setLoading(true);
      try {
        const ref = doc(db, 'wishlists', user.uid);
        const snap = await getDoc(ref);
        const remoteItems = snap.exists() ? snap.data().items || [] : [];
        const guestItems = readGuestStorage();

        const mergedMap = new Map();
        [...remoteItems, ...guestItems].forEach((item) => {
          if (item?.productId) mergedMap.set(item.productId, item);
        });
        const merged = Array.from(mergedMap.values());

        setWishlist(merged);
        await setDoc(ref, { items: merged, updatedAt: serverTimestamp() }, { merge: true });
        writeGuestStorage([]);
      } catch (err) {
        console.error('Wishlist sync failed', err);
      } finally {
        setLoading(false);
      }
    };

    syncFromRemote();
  }, [user]);

  // Persist wishlist changes
  useEffect(() => {
    const persist = async () => {
      if (user?.uid) {
        try {
          const ref = doc(db, 'wishlists', user.uid);
          await setDoc(ref, { items: wishlist, updatedAt: serverTimestamp() }, { merge: true });
        } catch (err) {
          console.error('Wishlist save failed', err);
        }
      } else {
        writeGuestStorage(wishlist);
      }
    };

    persist();
  }, [wishlist, user]);

  const isInWishlist = (productId) => wishlist.some((item) => item.productId === productId);

  const addToWishlist = (product) => {
    const normalized = normalizeItem(product);
    if (!normalized.productId) return;
    setWishlist((prev) => {
      if (prev.some((p) => p.productId === normalized.productId)) return prev;
      return [normalized, ...prev];
    });
  };

  const removeFromWishlist = (productId) => {
    setWishlist((prev) => prev.filter((item) => item.productId !== productId));
  };

  const toggleWishlist = (product) => {
    const pid = product.id || product.productId;
    if (!pid) return;
    if (isInWishlist(pid)) {
      removeFromWishlist(pid);
    } else {
      addToWishlist(product);
    }
  };

  const value = useMemo(() => ({
    wishlist,
    wishlistCount: wishlist.length,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    loading,
  }), [wishlist, loading]);

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};
