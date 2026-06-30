import { createContext, useContext, useState } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (username, password) => {
    const { data } = await client.post('/auth/login/', { username, password });
    localStorage.setItem('access', data.access);
    localStorage.setItem('refresh', data.refresh);
    // Decode basic user info from token payload
    const payload = JSON.parse(atob(data.access.split('.')[1]));
    const userInfo = { id: payload.user_id, username };
    localStorage.setItem('user', JSON.stringify(userInfo));
    setUser(userInfo);
  };

  const register = async (username, email, password) => {
    await client.post('/auth/register/', { username, email, password });
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
