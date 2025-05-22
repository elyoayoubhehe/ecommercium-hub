import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

// Use relative URLs instead of hardcoded API_URL
// const API_URL = 'http://localhost:5000/api';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'customer' | 'admin';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  handleTokenExpiration: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle expired token
  const handleTokenExpiration = useCallback(() => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
    toast.error('Your session has expired. Please log in again.');
  }, []);

  // Check if user is already logged in (token in localStorage)
  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem('auth_token');
      
      if (storedToken) {
        setToken(storedToken);
        try {
          console.log('Fetching user profile with token...');
          const response = await fetch(`/api/users/profile`, {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
              'Accept': 'application/json'
            },
          });
          
          if (response.ok) {
            const userData = await response.json();
            console.log('User profile loaded:', userData);
            setUser(userData);
          } else {
            console.error('Failed to load user profile:', await response.text());
            // Token invalid or expired
            localStorage.removeItem('auth_token');
            setToken(null);
            setUser(null);
          }
        } catch (err) {
          console.error('Error loading user:', err);
          localStorage.removeItem('auth_token');
          setToken(null);
          setUser(null);
        }
      }
      
      setLoading(false);
    };
    
    loadUser();
  }, []);
  
  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Attempting login for ${email}...`);
      const response = await fetch(`/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      console.log('Login successful, token received');
      
      // Save token to localStorage
      localStorage.setItem('auth_token', data.token);
      setToken(data.token);
      
      // Fetch user profile
      const profileResponse = await fetch(`/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${data.token}`,
          'Accept': 'application/json'
        },
      });
      
      if (profileResponse.ok) {
        const userData = await profileResponse.json();
        console.log('User profile loaded after login:', userData);
        setUser(userData);
      } else {
        console.error('Failed to load user profile after login');
        throw new Error('Failed to load user profile');
      }
      
      toast.success('Login successful!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      console.error('Login error:', err);
      toast.error(errorMessage);
      // Clean up on error
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  
  // Register function
  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          email, 
          password, 
          first_name: firstName, 
          last_name: lastName 
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      // Save token to localStorage
      localStorage.setItem('auth_token', data.token);
      setToken(data.token);
      
      // Fetch user profile after registration
      const profileResponse = await fetch(`/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${data.token}`,
          'Accept': 'application/json'
        },
      });
      
      if (profileResponse.ok) {
        const userData = await profileResponse.json();
        setUser(userData);
        toast.success('Registration successful!');
      } else {
        throw new Error('Failed to load user profile');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      console.error('Registration error:', err);
      toast.error(errorMessage);
      // Clean up on error
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setToken(null);
    toast.info('You have been logged out');
  };
  
  // Clear error
  const clearError = () => {
    setError(null);
  };
  
  // Check if user is admin
  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!token && !!user;
  
  const value = {
    user,
    token,
    isAuthenticated,
    isAdmin,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
    handleTokenExpiration
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}; 