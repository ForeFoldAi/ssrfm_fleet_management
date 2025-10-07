import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * NavigationTracker component that tracks the last visited path
 * Note: This is currently used for page refresh scenarios only.
 * Login redirects always go to role-specific defaults since logout clears this path.
 */
export const NavigationTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Don't track login page
    if (location.pathname !== '/login') {
      // Store the current path as the last visited path
      localStorage.setItem('last-visited-path', location.pathname);
      console.log('NavigationTracker: Stored last visited path:', location.pathname);
    }
  }, [location.pathname]);

  // This component doesn't render anything
  return null;
};

/**
 * Utility function to clear the last visited path
 * Call this when user explicitly navigates to dashboard
 */
export const clearLastVisitedPath = () => {
  localStorage.removeItem('last-visited-path');
  console.log('NavigationTracker: Cleared last visited path');
};
