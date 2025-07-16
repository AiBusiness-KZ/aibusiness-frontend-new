import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
// ИЗМЕНЕНИЕ: Убедимся, что глобальные стили импортируются
import './globals.css'; 
import { AuthProvider } from '@/context/AuthContext'; // Убедитесь, что путь верный

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI-парсер',
  description: 'Обработка банковских выписок с помощью AI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
