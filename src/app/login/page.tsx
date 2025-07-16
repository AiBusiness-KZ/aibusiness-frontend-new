// src/app/login/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter, // ИЗМЕНЕНИЕ: Добавлен CardFooter для переключателя
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// ИЗМЕНЕНИЕ: Импортируем функцию для создания пользователя
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { user, loading } = useAuth();

  // ИЗМЕНЕНИЕ: Состояние для переключения между входом и регистрацией
  const [isLoginMode, setIsLoginMode] = useState(true);
  // ИЗМЕНЕНИЕ: Состояние для отображения ошибок на форме
  const [error, setError] = useState('');

  // Этот хук, как и раньше, перенаправляет залогиненного пользователя
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // ИЗМЕНЕНИЕ: Универсальная функция для входа и регистрации
  const handleAuthAction = async () => {
    setError(''); // Сбрасываем ошибку перед новой попыткой
    
    if (isLoginMode) {
      // --- Логика входа ---
      try {
        await signInWithEmailAndPassword(auth, email, password);
        router.push('/dashboard');
      } catch (err) {
        console.error("Ошибка при входе:", err);
        setError('Неверный email или пароль. Пожалуйста, попробуйте снова.');
      }
    } else {
      // --- Логика регистрации ---
      if (password.length < 6) {
        setError('Пароль должен содержать не менее 6 символов.');
        return;
      }
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        // После успешной регистрации Firebase автоматически логинит пользователя,
        // поэтому сработает useEffect и перенаправит на /dashboard
        router.push('/dashboard');
      } catch (err) {
        console.error("Ошибка при регистрации:", err);
        if (err.code === 'auth/email-already-in-use') {
          setError('Этот email уже зарегистрирован.');
        } else {
          setError('Произошла ошибка при регистрации.');
        }
      }
    }
  };
  
  // Переключатель режима
  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError(''); // Сбрасываем ошибку при переключении
  };

  // Пока идет проверка, показываем загрузчик
  if (loading || (!loading && user)) {
    return <p className="flex items-center justify-center min-h-screen">Загрузка...</p>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-sm">
        <CardHeader>
          {/* ИЗМЕНЕНИЕ: Заголовок меняется в зависимости от режима */}
          <CardTitle className="text-2xl">{isLoginMode ? 'Вход' : 'Регистрация'}</CardTitle>
          <CardDescription>
            {isLoginMode
              ? 'Введите ваш email и пароль для входа в аккаунт.'
              : 'Создайте новый аккаунт, чтобы начать работу.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {/* ИЗМЕНЕНИЕ: Отображение текста ошибки */}
          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          
          {/* ИЗМЕНЕНИЕ: Кнопка теперь универсальная */}
          <Button onClick={handleAuthAction} className="w-full">
            {isLoginMode ? 'Войти' : 'Зарегистрироваться'}
          </Button>
        </CardContent>
        {/* ИЗМЕНЕНИЕ: Ссылка для переключения режима */}
        <CardFooter className="text-sm justify-center">
          <button onClick={toggleMode} className="text-blue-600 hover:underline">
            {isLoginMode
              ? 'Нет аккаунта? Зарегистрироваться'
              : 'Уже есть аккаунт? Войти'}
          </button>
        </CardFooter>
      </Card>
    </div>
  );
}
