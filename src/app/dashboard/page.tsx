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
import { uploadFile, getMe, createCheckoutSession, getTaskResult } from '@/lib/api';
import { DownloadButton } from '@/components/DownloadButton';
// ИЗМЕНЕНИЕ: Импортируем иконку для спиннера загрузки
import { Loader2 } from 'lucide-react';

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
  const [finalJsonObject, setFinalJsonObject] = useState<object | null>(null);
  
  // ИЗМЕНЕНИЕ: Новое состояние для хранения текстового статуса загрузки
  const [statusMessage, setStatusMessage] = useState('Ожидание результата...');

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
      return; 
    }

    if (resultObj && resultObj.status === 'processing' && resultObj.task_id) {
      // ИЗМЕНЕНИЕ: Обновляем сообщение для пользователя
      setStatusMessage('Файл обрабатывается на сервере...');
      const intervalId = setInterval(async () => {
        try {
          const taskResult = await getTaskResult(resultObj.task_id);
          
          if (taskResult.status === 'done') {
            clearInterval(intervalId);
            setJsonResult(JSON.stringify(taskResult.result, null, 2));
            setFinalJsonObject(taskResult.result);
            setIsParsing(false);
          } else if (taskResult.status === 'error') {
            clearInterval(intervalId);
            setJsonResult(JSON.stringify(taskResult.result, null, 2));
            setFinalJsonObject(null);
            setIsParsing(false);
          }
        } catch (error) {
          console.error(error);
          clearInterval(intervalId);
          setIsParsing(false);
          setFinalJsonObject(null);
          setStatusMessage('Произошла ошибка при получении результата.');
        }
      }, 3000);

      return () => clearInterval(intervalId);
    }
  }, [jsonResult]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleParse = async () => {
    if (!selectedFile) return alert('Пожалуйста, выберите файл!');
    
    setIsParsing(true);
    setJsonResult(''); // Очищаем поле результата
    setFinalJsonObject(null); 
    // ИЗМЕНЕНИЕ: Устанавливаем начальное сообщение
    setStatusMessage('Отправка файла на сервер...');

    try {
      const result = await uploadFile(selectedFile);
      setJsonResult(JSON.stringify(result, null, 2));
      
      const updatedProfile = await getMe();
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Ошибка парсинга:', error);
      let errorMessage = 'Произошла неизвестная ошибка.';
      if (error instanceof Error) errorMessage = error.message;
      alert(`Ошибка: ${errorMessage}`);
      setJsonResult(`Ошибка: ${errorMessage}`);
      setStatusMessage(`Ошибка: ${errorMessage}`);
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
    // ИЗМЕНЕНИЕ: Улучшенный глобальный экран загрузки
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
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
              <Input id="pdf-file" type="file" accept=".pdf" onChange={handleFileChange} disabled={isParsing} />
            </div>
            <Button 
              onClick={handleParse} 
              disabled={isParsing || !selectedFile || (profile?.plan === 'free' && profile?.usage_count >= 10)}
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
            {/* --- ИЗМЕНЕНИЕ: ЛОГИКА ОТОБРАЖЕНИЯ РЕЗУЛЬТАТА --- */}
            {isParsing ? (
              // Если идет парсинг, показываем спиннер и статус
              <div className="flex flex-col items-center justify-center h-96">
                <Loader2 className="h-16 w-16 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-500">{statusMessage}</p>
              </div>
            ) : finalJsonObject ? (
              // Если парсинг завершен и есть результат, показываем кнопку и данные
              <>
                <div className="mb-4">
                  <DownloadButton 
                    jsonData={finalJsonObject} 
                    userEmail={profile.email} 
                  />
                </div>
                <Textarea
                  readOnly
                  value={jsonResult}
                  className="h-96 font-mono"
                />
              </>
            ) : (
              // В остальных случаях (ошибка или начальное состояние) показываем Textarea
              <Textarea
                readOnly
                value={jsonResult}
                placeholder={statusMessage}
                className="h-96 font-mono"
              />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
