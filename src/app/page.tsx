// src/app/page.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Пока идет проверка статуса пользователя, ничего не делаем
    if (loading) {
      return;
    }

    // Если пользователь есть, перенаправляем на дашборд
    if (user) {
      router.push('/dashboard');
    } else {
      // Если пользователя нет, перенаправляем на страницу входа
      router.push('/login');
    }
  }, [user, loading, router]);

  // Показываем индикатор загрузки, пока идет проверка
  return <p>Загрузка...</p>;
}