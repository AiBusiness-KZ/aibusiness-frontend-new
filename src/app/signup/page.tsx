// src/app/signup/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Импортируем роутер для перенаправления
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

// Импортируем необходимые функции из Firebase
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase"; // Наш настроенный сервис аутентификации

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter(); // Инициализируем роутер

  const handleSignUp = async () => {
    try {
      // Используем функцию Firebase для создания нового пользователя
      await createUserWithEmailAndPassword(auth, email, password);
      alert('Регистрация прошла успешно! Теперь вы можете войти.');
      router.push('/login'); // Перенаправляем на страницу входа

} catch (error) {
  console.error("Ошибка при регистрации:", error);
  let errorMessage = 'Произошла ошибка при регистрации.';
  if (error instanceof Error) {
    errorMessage = error.message;
  }
  alert(errorMessage);
}

  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Регистрация</CardTitle>
          <CardDescription>
            Создайте новый аккаунт, указав ваш email и пароль.
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
          <Button onClick={handleSignUp} className="w-full">
            Создать аккаунт
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}