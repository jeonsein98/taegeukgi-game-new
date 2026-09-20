import React from 'react';

export const metadata = {
  title: '태극기 구성요소 맞추기 - 유아 및 특수교육 플래시 웹게임',
  description: '유아 및 특수교육 학생을 위한 아이패드 터치 최적화 태극기 퍼즐 맞추기 게임 (드래그/클릭 모드, Gemini AI 맞춤 칭찬 및 퀴즈, 구글 시트 연동)',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Jua&family=Noto+Sans+KR:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="overflow-x-hidden select-none bg-slate-100 text-slate-800 antialiased">
        {children}
      </body>
    </html>
  );
}
