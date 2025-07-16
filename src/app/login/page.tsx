// src/app/login/page.tsx

'use client';

import { useState, useEffect } from 'react'; // <--- Добавлен useEffect
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from '@/context/AuthContext'; // <--- 1. Импортируем useAuth

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { user, loading } = useAuth(); // <--- 2. Получаем статус пользователя

  // 3. Добавляем useEffect для перенаправления
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // alert('Вход выполнен успешно!'); // Можно убрать, т.к. редирект сработает автоматически
      router.push('/dashboard');
    } catch (error) {
      console.error("Ошибка при входе:", error);
      let errorMessage = 'Произошла ошибка при входе.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      alert(errorMessage);
    }
  };

  // Пока идет проверка, ничего не показываем или показываем загрузчик
  if (loading || (!loading && user)) {
    return <p>Загрузка...</p>;
  }

  // Если проверки завершены и пользователя нет - показываем форму входа
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Вход</CardTitle>
          <CardDescription>
            Введите ваш email и пароль для входа в аккаунт.
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
          <Button onClick={handleLogin} className="w-full">
            Войти
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}