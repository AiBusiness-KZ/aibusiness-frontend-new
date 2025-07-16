// src/context/AuthContext.tsx

'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged - это слушатель из Firebase.
    // Он должен быть внутри одного, верхнеуровневого useEffect.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth State Changed:", user ? user.email : 'No user');
      setUser(user);
      setLoading(false);
    });

    // Отписываемся от слушателя при размонтировании компонента
    return () => unsubscribe();
  }, []); // Пустой массив зависимостей гарантирует, что эффект запустится один раз

  const value = { user, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};