import { createContext, useContext, useState } from 'react';
import { adminLogin } from '../api';

interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // En el pre-render (Node) no existe localStorage
  const [token, setToken] = useState<string | null>(
    () => (typeof window === 'undefined' ? null : localStorage.getItem('admin_token'))
  );

  const login = async (email: string, password: string) => {
    const data = await adminLogin(email, password);
    setToken(data.token);
    localStorage.setItem('admin_token', data.token);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('admin_token');
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
