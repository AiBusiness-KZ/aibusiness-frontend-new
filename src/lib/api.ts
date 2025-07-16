// src/lib/api.ts

import { auth } from './firebase';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Функция для загрузки файла
export async function uploadFile(file: File) {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("Пользователь не авторизован");

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Ошибка при загрузке файла');
  }
  return response.json();
}

// Функция для получения данных профиля
export async function getMe() {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("Пользователь не авторизован");

  const response = await fetch(`${API_URL}/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Ошибка при получении профиля');
  }
  return response.json();
}

// Функция для создания сессии оплаты
export async function createCheckoutSession() {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("Пользователь не авторизован");

  const response = await fetch(`${API_URL}/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Ошибка при создании сессии оплаты');
  }
  return response.json();
}

// Новая функция для получения результата задачи
export async function getTaskResult(taskId: string) {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("Пользователь не авторизован");

  const response = await fetch(`${API_URL}/result/${taskId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Ошибка при получении результата задачи');
  }
  return response.json();
}