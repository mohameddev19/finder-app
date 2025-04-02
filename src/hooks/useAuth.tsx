import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

type User = {
  id: number;
  email: string;
  name: string;
  userType: 'family' | 'authority';
  isVerified: boolean;
  organization?: string;
  position?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  clearError: () => void;
};

type RegisterData = {
  email: string;
  password: string;
  name: string;
  phone?: string;
  userType: 'family' | 'authority';
  organization?: string;
  position?: string;
  details?: string;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuthStatus = async () => {
      // Remove the client-side check for the HttpOnly cookie
      // const token = Cookies.get('finder_token'); 
      // console.log('Checking auth with token:', token); // This would always be undefined
      
      // Always attempt to verify session via the API endpoint.
      // The browser will automatically send the HttpOnly cookie if it exists.
      try {
        const response = await fetch('/api/auth/me'); // Removed Authorization header - cookie is sent automatically

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          if (data.user?.userType === 'authority' && !data.user?.isVerified) {
            if (pathname !== '/verification-pending') { 
               router.push('/verification-pending');
            }
          }
        } else {
          // Handle failed verification (e.g., no valid cookie sent, or /api/auth/me returned error)
          if (response.status === 401 || response.status === 403) {
            // No valid session / token invalid - ensure user is null
            // No need to remove cookie here, as it wasn't readable anyway. 
            // If API determines cookie is invalid, it might clear it via Set-Cookie header.
            setUser(null); 
          } else {
            console.error(`Auth check failed with status ${response.status}`);
          }
        }
      } catch (err) {
        console.error('Auth check network/fetch error:', err);
        // Don't assume logout on network error
      } finally {
         // Ensure loading state is always turned off after the attempt
         setIsLoading(false);
      }
    };
    
    checkAuthStatus();
  }, [pathname, router]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        // Specific handling for authority not verified
        if (data.code === 'AUTHORITY_NOT_VERIFIED') {
          router.push('/verification-pending');
          setError('Authority account awaiting verification.'); // Set specific error
        } else {
          throw new Error(data.error || 'Login failed');
        }
      } else {
        setUser(data.user);
        // Token is already set by the server via httpOnly cookie
        router.push('/'); // Redirect to home after successful login
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      
      setUser(data.user);
      // If the user is verified (family), the server sets the cookie.
      // If the user is authority, they need to log in after verification.
      if (userData.userType === 'authority') {
        router.push('/verification-pending');
      } else {
        router.push('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' }); // Call the backend logout endpoint
      Cookies.remove('finder_token'); // Explicitly remove the cookie on logout
      setUser(null);
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
      //setError('Logout failed'); // Optionally set error state
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 