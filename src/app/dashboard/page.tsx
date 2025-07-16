// src/app/dashboard/page.tsx

'use client';

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
// Объединенный импорт для API
import { uploadFile, getMe, createCheckoutSession } from '@/lib/api';


// Типизируем данные профиля
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

  // Этот эффект теперь также загружает данные профиля
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    // Если пользователь есть, загружаем его профиль с бэкенда
    if (user) {
      getMe()
        .then(data => setProfile(data))
        .catch(error => console.error('Ошибка получения профиля:', error));
    }
  }, [user, loading, router]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  // Обновляем функцию парсинга для работы с реальным API
  const handleParse = async () => {
    if (!selectedFile) {
      alert('Пожалуйста, выберите файл!');
      return;
    }
    setIsParsing(true);
    setJsonResult('');

    try {
      // Вызываем функцию загрузки файла из нашего api.ts
      const result = await uploadFile(selectedFile);
      setJsonResult(JSON.stringify(result, null, 2));
      // Обновляем данные профиля после успешного парсинга
      const updatedProfile = await getMe();
      setProfile(updatedProfile);
// Новый, исправленный код
} catch (error) {
  console.error('Ошибка парсинга:', error);
  let errorMessage = 'Произошла неизвестная ошибка.';
  if (error instanceof Error) {
    errorMessage = error.message;
  }
  alert(`Ошибка: ${errorMessage}`);
  setJsonResult(`Ошибка: ${errorMessage}`);
}

finally {
      setIsParsing(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

const handleUpgrade = async () => {
  try {
    const { sessionId } = await createCheckoutSession();
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
    if (stripe) {
      await stripe.redirectToCheckout({ sessionId });
    }

// Новый, исправленный код
} catch (error) {
  console.error('Ошибка при переходе к оплате:', error);
  let errorMessage = 'Не удалось перейти к оплате.';
  // Дополнительно извлекаем сообщение из ошибки, если оно есть
  if (error instanceof Error) {
    errorMessage = error.message;
  }
  alert(errorMessage);
}


};
  
  if (loading || !profile) {
    return <p>Загрузка...</p>;
  }

  if (user) {
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


  {/* Внутри return, после <header> и перед <main> */}

{profile?.plan === 'FREE' && (
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
              <CardDescription>Выберите PDF-файл банковской выписки для обработки. [cite: 2]</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="pdf-file">PDF-файл</Label>
                <Input id="pdf-file" type="file" accept=".pdf" onChange={handleFileChange} />
              </div>

          <Button 
           onClick={handleParse} 
           disabled={isParsing || !selectedFile || (profile?.plan === 'FREE' && profile?.usage_count >= 3)}
           >

                {isParsing ? 'Обработка...' : 'Начать обработку'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Результат (JSON)</CardTitle>
              <CardDescription>Здесь появится результат обработки в формате JSON. [cite: 2, 4]</CardDescription>
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

  return null;
}