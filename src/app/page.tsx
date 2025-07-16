// src/app/page.tsx - ТЕСТОВЫЙ КОД

'use client';

import { useState, useEffect } from 'react';

export default function HomePage() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Этот лог мы обязаны увидеть, если JS работает
    console.log('--- ТЕСТ: Компонент HomePage успешно смонтирован ---');
  }, []);

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '50px', textAlign: 'center', fontSize: '1.2rem' }}>
      <h1>Тестовая страница</h1>
      <p>Если вы видите это, значит, React работает.</p>
      
      <button 
        style={{ padding: '10px 20px', fontSize: '1rem', margin: '20px' }}
        onClick={() => setCount(c => c + 1)}
      >
        Нажми на меня
      </button>

      <p>Счетчик: {count}</p>
    </div>
  );
}