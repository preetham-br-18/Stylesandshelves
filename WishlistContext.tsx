import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { trackEvent } from '../lib/analytics';

const WISHLIST_KEY = 'style-shelf-wishlist';

interface WishlistContextType {
  wishlistIds: string[];
  isWishlisted: (id: number | string) => boolean;
  toggleWishlist: (id: number | string, productName?: string) => void;
  clearWishlist: () => void;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.map(String);
        }
      }
    } catch (e) {
      console.warn('Failed to load wishlist from localStorage:', e);
    }
    return ['1', '8']; // Default 2 items to give immediate life
  });

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlistIds));
    } catch (e) {
      console.warn('Failed to save wishlist to localStorage:', e);
    }
  }, [wishlistIds]);

  const isWishlisted = useCallback(
    (id: number | string) => wishlistIds.includes(String(id)),
    [wishlistIds]
  );

  const toggleWishlist = useCallback(
    (id: number | string, productName?: string) => {
      const stringId = String(id);
      setWishlistIds(prev => {
        const exists = prev.includes(stringId);
        const next = exists ? prev.filter(item => item !== stringId) : [...prev, stringId];
        trackEvent(exists ? 'wishlist_remove' : 'wishlist_add', {
          productId: id,
          productName: productName || `Product #${id}`
        });
        return next;
      });
    },
    []
  );

  const clearWishlist = useCallback(() => {
    setWishlistIds([]);
  }, []);

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        isWishlisted,
        toggleWishlist,
        clearWishlist,
        wishlistCount: wishlistIds.length
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
