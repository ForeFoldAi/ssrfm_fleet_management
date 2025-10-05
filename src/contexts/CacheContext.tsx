import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CacheData {
  [key: string]: {
    data: any;
    timestamp: number;
    expiresIn: number; // in milliseconds
  };
}

interface CacheContextType {
  get: (key: string) => any | null;
  set: (key: string, data: any, expiresIn?: number) => void;
  clear: (key?: string) => void;
  isExpired: (key: string) => boolean;
  has: (key: string) => boolean;
}

const CacheContext = createContext<CacheContextType | undefined>(undefined);

export const useCache = () => {
  const context = useContext(CacheContext);
  if (context === undefined) {
    throw new Error('useCache must be used within a CacheProvider');
  }
  return context;
};

export const CacheProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cache, setCache] = useState<CacheData>(() => {
    // Initialize from localStorage
    try {
      const stored = localStorage.getItem('app-cache');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Save to localStorage whenever cache changes
  useEffect(() => {
    localStorage.setItem('app-cache', JSON.stringify(cache));
  }, [cache]);

  // Clean up expired entries periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setCache(prevCache => {
        const now = Date.now();
        const cleaned = Object.entries(prevCache).reduce((acc, [key, value]) => {
          if (now - value.timestamp < value.expiresIn) {
            acc[key] = value;
          }
          return acc;
        }, {} as CacheData);
        
        return Object.keys(cleaned).length !== Object.keys(prevCache).length ? cleaned : prevCache;
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const get = (key: string) => {
    const item = cache[key];
    if (!item) return null;
    
    const now = Date.now();
    if (now - item.timestamp >= item.expiresIn) {
      // Remove expired item
      setCache(prev => {
        const { [key]: removed, ...rest } = prev;
        return rest;
      });
      return null;
    }
    
    return item.data;
  };

  const set = (key: string, data: any, expiresIn: number = 5 * 60 * 1000) => { // Default 5 minutes
    setCache(prev => ({
      ...prev,
      [key]: {
        data,
        timestamp: Date.now(),
        expiresIn,
      },
    }));
  };

  const clear = (key?: string) => {
    if (key) {
      setCache(prev => {
        const { [key]: removed, ...rest } = prev;
        return rest;
      });
    } else {
      setCache({});
    }
  };

  const isExpired = (key: string) => {
    const item = cache[key];
    if (!item) return true;
    
    const now = Date.now();
    return now - item.timestamp >= item.expiresIn;
  };

  const has = (key: string) => {
    return key in cache && !isExpired(key);
  };

  return (
    <CacheContext.Provider value={{ get, set, clear, isExpired, has }}>
      {children}
    </CacheContext.Provider>
  );
};
