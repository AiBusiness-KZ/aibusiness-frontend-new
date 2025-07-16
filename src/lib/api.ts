// src/lib/api.ts

import { auth } from '@/lib/firebase';

// Получаем URL бэкенда из переменных окружения
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Функция для загрузки файла
export const uploadFile = async (file: File) => {
  // Получаем текущего пользователя и его токен
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Пользователь не авторизован');
  }
  const token = await user.getIdToken();

  // Создаем FormData для отправки файла
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: {
      // Прикрепляем токен для авторизации на бэкенде
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    // Если ответ не успешный, пытаемся прочитать ошибку
    const errorData = await response.json().catch(() => ({ detail: 'Произошла неизвестная ошибка' }));
    throw new Error(errorData.detail || 'Ошибка при загрузке файла');
  }

  return response.json();
};

// Функция для получения информации о текущем пользователе
export const getMe = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Пользователь не авторизован');
  }
  const token = await user.getIdToken();

  const response = await fetch(`${API_URL}/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Не удалось получить данные профиля');
  }

  return response.json();
};

// Функция для создания сессии оплаты Stripe
export const createCheckoutSession = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Пользователь не авторизован');
  }
  const token = await user.getIdToken();

  const response = await fetch(`${API_URL}/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Не удалось создать сессию оплаты');
  }

  return response.json();
};