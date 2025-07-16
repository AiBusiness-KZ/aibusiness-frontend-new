'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface DownloadButtonProps {
  // Данные для скачивания в виде объекта
  jsonData: object; 
  // Email пользователя для имени файла
  userEmail: string; 
}

export const DownloadButton = ({ jsonData, userEmail }: DownloadButtonProps) => {

  const handleDownload = () => {
    // Проверка, что есть что скачивать
    if (!jsonData || Object.keys(jsonData).length === 0) {
      console.error("Нет данных для скачивания.");
      return;
    }
    
    // 1. Формируем дату и время для имени файла
    const date = new Date();
    const dateString = date.toISOString().split('T')[0]; // Формат: YYYY-MM-DD
    const timeString = date.toTimeString().split(' ')[0].replace(/:/g, '-'); // Формат: HH-MM-SS

    // 2. Составляем имя файла из email, даты и времени
    const emailPrefix = userEmail ? userEmail.split('@')[0] : 'result';
    const fileName = `${emailPrefix}_${dateString}_${timeString}.json`;

    // 3. Превращаем объект в строку JSON и создаем файл
    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // 4. Создаем временную ссылку и "нажимаем" на нее для скачивания
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();

    // 5. Очищаем за собой
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      onClick={handleDownload}
      className="bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 active:scale-95 transition-all duration-150 ease-in-out rounded-lg"
    >
      <Download className="mr-2 h-4 w-4" />
      Скачать файл (.json)
    </Button>
  );
};
