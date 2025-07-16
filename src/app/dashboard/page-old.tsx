// src/app/dashboard/page.tsx

'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { loadStripe } from '@stripe/stripe-js';
import { uploadFile, getMe, createCheckoutSession, getTaskResult } from '@/lib/api';

interface UserProfile {
  email: string;
  plan: string;
  usage_count: number;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jsonResult, setJsonResult] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Эффект для защиты роута и первоначальной загрузки профиля
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (user) {
      getMe()
        .then(data => setProfile(data))
        .catch(error => console.error('Ошибка получения профиля:', error));
    }
  }, [user, loading, router]);

  // Эффект для опроса результата задачи
  useEffect(() => {
    let resultObj;
    try {
      resultObj = JSON.parse(jsonResult);
    } catch (e) {
      return; // Выходим, если jsonResult - это не валидный JSON
    }

    // Запускаем опрос только если статус "processing"
    if (resultObj && resultObj.status === 'processing' && resultObj.task_id) {
      const intervalId = setInterval(async () => {
        try {
          const taskResult = await getTaskResult(resultObj.task_id);
          
          if (taskResult.status === 'done') {
            clearInterval(intervalId);
            setJsonResult(JSON.stringify(taskResult.result, null, 2));
            setIsParsing(false); // Завершаем парсинг
          } else if (taskResult.status === 'error') {
            clearInterval(intervalId);
            setJsonResult(JSON.stringify(taskResult.result, null, 2));
            setIsParsing(false); // Завершаем парсинг с ошибкой
          }
          // Если статус все еще "processing", молча ждем следующей итерации
        } catch (error) {
          console.error(error);
          clearInterval(intervalId);
          setIsParsing(false);
        }
      }, 3000); // Опрашиваем каждые 3 секунды

      // Очищаем интервал при размонтировании компонента
      return () => clearInterval(intervalId);
    }
  }, [jsonResult]); // Этот эффект зависит от jsonResult

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleParse = async () => {
    if (!selectedFile) return alert('Пожалуйста, выберите файл!');
    
    setIsParsing(true);
    setJsonResult('{"status": "starting", "message": "Отправка файла..."}');

    try {
      const result = await uploadFile(selectedFile);
      setJsonResult(JSON.stringify(result, null, 2)); // Устанавливаем статус "processing"
      
      // Обновляем счетчик после успешной отправки
      const updatedProfile = await getMe();
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Ошибка парсинга:', error);
      let errorMessage = 'Произошла неизвестная ошибка.';
      if (error instanceof Error) errorMessage = error.message;
      alert(`Ошибка: ${errorMessage}`);
      setJsonResult(`Ошибка: ${errorMessage}`);
      setIsParsing(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const handleUpgrade = async () => {
    try {
      const { url } = await createCheckoutSession();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Ошибка при переходе к оплате:', error);
      alert('Не удалось перейти к оплате.');
    }
  };
  
  if (loading || !profile) {
    return <p>Загрузка...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">AI-парсер</h1>
        <div className="text-right">
          <p>{profile.email}</p>
          <p className="text-sm text-gray-600">Тариф: {profile.plan} | Использовано: {profile.usage_count}</p>
          <Button onClick={handleLogout} variant="link" className="p-0 h-auto">Выйти</Button>
        </div>
      </header>

      {profile?.plan === 'free' && (
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle>Перейдите на PRO</CardTitle>
            <CardDescription>
              Вы использовали {profile.usage_count} из 3 бесплатных попыток. 
              Перейдите на PRO-тариф для неограниченной обработки файлов.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleUpgrade}>Перейти на PRO</Button>
          </CardContent>
        </Card>
      )}

      <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Загрузка PDF</CardTitle>
            <CardDescription>Выберите PDF-файл банковской выписки для обработки.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="pdf-file">PDF-файл</Label>
              <Input id="pdf-file" type="file" accept=".pdf" onChange={handleFileChange} />
            </div>
            <Button 
             onClick={handleParse} 
             disabled={isParsing || !selectedFile || (profile?.plan === 'free' && profile?.usage_count >= 3)}
             >
              {isParsing ? 'Обработка...' : 'Начать обработку'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Результат (JSON)</CardTitle>
            <CardDescription>Здесь появится результат обработки в формате JSON.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              readOnly
              value={jsonResult}
              placeholder="Ожидание результата..."
              className="h-96 font-mono"
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}