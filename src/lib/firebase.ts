// src/lib/firebase.ts

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

console.log("Firebase API Key:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY); 

// Конфигурация вашего Firebase проекта из переменных окружения
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Инициализируем Firebase
// Проверяем, было ли приложение уже инициализировано, чтобы избежать ошибок
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Экспортируем сервис аутентификации для использования в других частях приложения
export const auth = getAuth(app);