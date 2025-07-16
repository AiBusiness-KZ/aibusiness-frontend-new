// src/app/login/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from '@/context/AuthContext';

// ИЗМЕНЕНИЕ: Определяем тип для ошибки Firebase для безопасности
interface FirebaseError extends Error {
  code?: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { user, loading } = useAuth();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleAuthAction = async () => {
    setError(''); 
    
    if (isLoginMode) {
      // --- Логика входа ---
      try {
        await signInWithEmailAndPassword(auth, email, password);
        router.push('/dashboard');
      } catch (err: unknown) { // Явно указываем тип unknown
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
        router.push('/dashboard');
      } catch (err: unknown) { // Явно указываем тип unknown
        console.error("Ошибка при регистрации:", err);
        
        // ИЗМЕНЕНИЕ: Добавляем безопасную проверку типа ошибки
        const firebaseError = err as FirebaseError;
        if (firebaseError.code === 'auth/email-already-in-use') {
          setError('Этот email уже зарегистрирован.');
        } else {
          setError('Произошла ошибка при регистрации.');
        }
      }
    }
  };
  
  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
  };

  if (loading || (!loading && user)) {
    return <p className="flex items-center justify-center min-h-screen">Загрузка...</p>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-sm">
        <CardHeader>
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
          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          
          <Button onClick={handleAuthAction} className="w-full">
            {isLoginMode ? 'Войти' : 'Зарегистрироваться'}
          </Button>
        </CardContent>
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
