import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Heart, Star, BookOpen, Medal, Award, Flame } from 'lucide-react';
import { CelebrationCharacterType } from '../types';

interface CelebrationCharactersProps {
  character?: CelebrationCharacterType;
  allowSwitching?: boolean;
}

/**
 * Reusable Taegeuk & 4 Trigrams Halo Background
 * Matches the uploaded portrait artwork with circular Taegeuk (Red/Blue Yin-Yang)
 * and the 4 Trigrams (Geon ☰, Gon ☷, Gam ☵, Ri ☲) positioned diagonally at official angles,
 * plus the vertical '독립' calligraphy seal.
 */
const TaegeukHalo: React.FC = () => {
  return (
    <g className="select-none pointer-events-none">
      {/* Soft warm white glow backing */}
      <circle cx="130" cy="118" r="92" fill="#FFFFFF" opacity="0.95" />
      <circle cx="130" cy="118" r="86" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1.5" />

      {/* Central Taegeuk Circle (Radius 48, Center at 130, 118) */}
      <g id="taegeuk-halo-circle">
        {/* Upper Red Curved Swirl */}
        <path
          d="M 130 70 A 48 48 0 0 1 130 166 A 24 24 0 0 1 130 118 A 24 24 0 0 0 130 70 Z"
          fill="#CD2E3A"
        />
        {/* Lower Blue Curved Swirl */}
        <path
          d="M 130 70 A 24 24 0 0 1 130 118 A 24 24 0 0 0 130 166 A 48 48 0 0 1 130 70 Z"
          fill="#0047A0"
        />
      </g>

      {/* 4 Trigrams (Official 대한민국 국기 규격 diagonal angles) */}
      {/* 1. 건 (Geon, ☰, 좌상단): -56.31° */}
      <g transform="translate(68, 56) rotate(-56.31)">
        <rect x="-18" y="-10" width="36" height="4.5" rx="1.5" fill="#18181B" />
        <rect x="-18" y="-2.25" width="36" height="4.5" rx="1.5" fill="#18181B" />
        <rect x="-18" y="5.5" width="36" height="4.5" rx="1.5" fill="#18181B" />
      </g>

      {/* 2. 곤 (Gon, ☷, 우하단): -56.31° */}
      <g transform="translate(192, 180) rotate(-56.31)">
        <rect x="-18" y="-10" width="16.5" height="4.5" rx="1.5" fill="#18181B" />
        <rect x="1.5" y="-10" width="16.5" height="4.5" rx="1.5" fill="#18181B" />

        <rect x="-18" y="-2.25" width="16.5" height="4.5" rx="1.5" fill="#18181B" />
        <rect x="1.5" y="-2.25" width="16.5" height="4.5" rx="1.5" fill="#18181B" />

        <rect x="-18" y="5.5" width="16.5" height="4.5" rx="1.5" fill="#18181B" />
        <rect x="1.5" y="5.5" width="16.5" height="4.5" rx="1.5" fill="#18181B" />
      </g>

      {/* 3. 감 (Gam, ☵, 우상단): +56.31° */}
      <g transform="translate(192, 56) rotate(56.31)">
        <rect x="-18" y="-10" width="16.5" height="4.5" rx="1.5" fill="#18181B" />
        <rect x="1.5" y="-10" width="16.5" height="4.5" rx="1.5" fill="#18181B" />

        <rect x="-18" y="-2.25" width="36" height="4.5" rx="1.5" fill="#18181B" />

        <rect x="-18" y="5.5" width="16.5" height="4.5" rx="1.5" fill="#18181B" />
        <rect x="1.5" y="5.5" width="16.5" height="4.5" rx="1.5" fill="#18181B" />
      </g>

      {/* 4. 리 (Ri, ☲, 좌하단): +56.31° */}
      <g transform="translate(68, 180) rotate(56.31)">
        <rect x="-18" y="-10" width="36" height="4.5" rx="1.5" fill="#18181B" />

        <rect x="-18" y="-2.25" width="16.5" height="4.5" rx="1.5" fill="#18181B" />
        <rect x="1.5" y="-2.25" width="16.5" height="4.5" rx="1.5" fill="#18181B" />

        <rect x="-18" y="5.5" width="36" height="4.5" rx="1.5" fill="#18181B" />
      </g>

      {/* Vertical Calligraphy Seal: '독립' */}
      <text
        x="36"
        y="125"
        fill="#334155"
        fontSize="13"
        fontFamily="'Nanum Myeongjo', serif"
        fontWeight="900"
        opacity="0.8"
        letterSpacing="2"
      >
        <tspan x="34" dy="0">독</tspan>
        <tspan x="34" dy="16">립</tspan>
      </text>
    </g>
  );
};

export const CelebrationCharacters: React.FC<CelebrationCharactersProps> = ({
  character = 'an-jung-geun',
  allowSwitching = true,
}) => {
  const [activeChar, setActiveChar] = useState<CelebrationCharacterType>(character);

  // Sync if prop changes
  React.useEffect(() => {
    setActiveChar(character);
  }, [character]);

  const isAn = activeChar === 'an-jung-geun';
  const isAhn = activeChar === 'ahn-chang-ho';
  const isRyu = activeChar === 'ryu-gwan-sun';
  const isYun = activeChar === 'yun-bong-gil';
  const isKim = activeChar === 'kim-gu';

  const heroesList: { id: CelebrationCharacterType; name: string; subtitle: string }[] = [
    { id: 'an-jung-geun', name: '안중근 삼촌', subtitle: '씩씩한 영웅' },
    { id: 'ahn-chang-ho', name: '안창호 선생님', subtitle: '지혜로운 스승' },
    { id: 'ryu-gwan-sun', name: '유관순 누나', subtitle: '만세 부른 누나' },
    { id: 'yun-bong-gil', name: '윤봉길 삼촌', subtitle: '용감한 영웅' },
    { id: 'kim-gu', name: '김구 할아버지', subtitle: '따뜻한 할아버지' },
  ];

  return (
    <div className="relative w-full overflow-hidden rounded-3xl p-4 sm:p-5 border-2 border-slate-200 bg-gradient-to-b from-slate-50 via-white to-slate-100 shadow-sm transition-colors">
      {/* Floating background celebratory particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { x: '8%', y: '12%', delay: 0, icon: Star, color: 'text-amber-400' },
          { x: '20%', y: '8%', delay: 0.3, icon: Sparkles, color: 'text-red-400' },
          { x: '88%', y: '14%', delay: 0.2, icon: Star, color: 'text-yellow-400' },
          { x: '82%', y: '28%', delay: 0.5, icon: Heart, color: 'text-rose-400' },
          { x: '50%', y: '6%', delay: 0.4, icon: Sparkles, color: 'text-blue-500' },
        ].map((item, i) => (
          <motion.div
            key={i}
            className={`absolute ${item.color}`}
            style={{ left: item.x, top: item.y }}
            animate={{
              y: [0, -10, 0],
              scale: [0.9, 1.15, 0.9],
              opacity: [0.5, 0.9, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: item.delay,
              ease: 'easeInOut',
            }}
          >
            <item.icon className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
          </motion.div>
        ))}
      </div>

      {/* Hero Switcher Tabs */}
      {allowSwitching && (
        <div className="relative z-20 flex items-center justify-center gap-1.5 mb-3 flex-wrap">
          <span className="text-[11px] font-black text-slate-600 mr-1 flex items-center gap-1">
            <Medal className="w-3.5 h-3.5 text-amber-500" />
            <span>독립투사 축하 인사:</span>
          </span>
          {heroesList.map((hero) => {
            const isSelected = activeChar === hero.id;
            return (
              <button
                key={hero.id}
                type="button"
                onClick={() => setActiveChar(hero.id)}
                className={`px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer shadow-xs flex items-center gap-1 ${
                  isSelected
                    ? 'bg-slate-900 text-white ring-2 ring-slate-400 scale-105 shadow-md'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <span>🇰🇷</span>
                <span>{hero.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Single Celebration Character Display */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center py-1">
        {/* ======================================================== */}
        {/* 1. 안중근 의사 (An Jung-geun) - Top-Left in Image        */}
        {/* ======================================================== */}
        {isAn && (
          <div className="flex flex-col items-center w-full max-w-lg">
            {/* Speech Bubble */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: 'spring' }}
              className="mb-2 bg-white px-4 py-2 rounded-2xl shadow-md border-2 border-slate-800 text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2"
            >
              <span className="text-base">📢</span>
              <span>“태극기를 멋지게 완성했구나! 참 잘했어! 👍”</span>
              <span className="text-base">🇰🇷</span>
            </motion.div>

            {/* Illustration Frame */}
            <div className="relative flex items-center justify-center my-1 select-none">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="relative w-56 h-56 sm:w-64 sm:h-64 filter drop-shadow-xl"
              >
                <svg viewBox="0 0 260 260" className="w-full h-full">
                  {/* Background: Taegeuk & Trigrams Halo */}
                  <TaegeukHalo />

                  {/* Overcoat & Attire (Dark Brown Winter Coat with Broad Collar & Navy Inner High Neck) */}
                  <g id="an-attire">
                    {/* Shoulders & Main Coat */}
                    <path
                      d="M 60 250 L 75 195 C 80 185 180 185 185 195 L 200 250 Z"
                      fill="#2D241C"
                      stroke="#1C150F"
                      strokeWidth="2.5"
                    />
                    {/* High Dark Navy Inner Collar */}
                    <path
                      d="M 112 170 L 112 186 C 112 192 148 192 148 186 L 148 170 Z"
                      fill="#121824"
                      stroke="#0C1019"
                      strokeWidth="1.5"
                    />
                    {/* Folded Coat Lapels */}
                    <path
                      d="M 85 195 L 112 180 L 114 245 L 90 250 Z"
                      fill="#3B3026"
                      stroke="#221B14"
                      strokeWidth="2"
                    />
                    <path
                      d="M 175 195 L 148 180 L 146 245 L 170 250 Z"
                      fill="#3B3026"
                      stroke="#221B14"
                      strokeWidth="2"
                    />
                    <path
                      d="M 114 200 L 130 220 L 146 200"
                      fill="none"
                      stroke="#221B14"
                      strokeWidth="2"
                    />
                  </g>

                  {/* Neck */}
                  <path
                    d="M 116 155 L 116 178 Q 130 182 144 178 L 144 155 Z"
                    fill="#E8B89C"
                  />

                  {/* Face Shape & Jawline */}
                  <path
                    d="M 100 115 C 98 145 106 172 130 172 C 154 172 162 145 160 115 C 160 85 100 85 100 115 Z"
                    fill="#F2C7AD"
                    stroke="#E2B194"
                    strokeWidth="1.2"
                  />

                  {/* Ears */}
                  <ellipse cx="98" cy="128" rx="5.5" ry="9" fill="#E8B89C" />
                  <ellipse cx="162" cy="128" rx="5.5" ry="9" fill="#E8B89C" />

                  {/* Resolute Masculine Eyebrows */}
                  <path
                    d="M 108 116 Q 118 112 124 116"
                    fill="none"
                    stroke="#1E1916"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 136 116 Q 142 112 152 116"
                    fill="none"
                    stroke="#1E1916"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />

                  {/* Focused, Dignified Eyes */}
                  <ellipse cx="117" cy="125" rx="5" ry="3.5" fill="#18181B" />
                  <circle cx="115.5" cy="123.5" r="1.3" fill="#FFFFFF" />
                  <path d="M 111 123 Q 117 121 123 123" fill="none" stroke="#221B14" strokeWidth="1.5" />

                  <ellipse cx="143" cy="125" rx="5" ry="3.5" fill="#18181B" />
                  <circle cx="141.5" cy="123.5" r="1.3" fill="#FFFFFF" />
                  <path d="M 137 123 Q 143 121 149 123" fill="none" stroke="#221B14" strokeWidth="1.5" />

                  {/* Straight Defined Nose */}
                  <path
                    d="M 129 122 L 128 141 L 133 141"
                    fill="none"
                    stroke="#C89679"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />

                  {/* Resolute Lips */}
                  <path
                    d="M 123 152 Q 130 151 137 152"
                    fill="none"
                    stroke="#945242"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Textured Brushed-Back Dark Hair */}
                  <path
                    d="M 96 114 C 94 82 106 72 130 72 C 154 72 166 82 164 114 C 158 96 148 94 130 96 C 112 94 102 96 96 114 Z"
                    fill="#1C1815"
                  />
                  {/* Hair Strands Texture */}
                  <path d="M 110 78 Q 116 88 118 96" stroke="#332B25" strokeWidth="1.5" fill="none" />
                  <path d="M 125 74 Q 128 86 130 96" stroke="#332B25" strokeWidth="1.5" fill="none" />
                  <path d="M 140 76 Q 142 86 142 96" stroke="#332B25" strokeWidth="1.5" fill="none" />
                  <path d="M 152 82 Q 150 90 152 98" stroke="#332B25" strokeWidth="1.5" fill="none" />
                </svg>
              </motion.div>
            </div>

            {/* Hero Bio Card */}
            <div className="bg-slate-900 text-white rounded-2xl px-4 py-2.5 shadow-md border border-slate-700 w-full mt-1">
              <div className="text-xs font-black text-amber-300 flex items-center justify-center gap-1.5 mb-0.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>용감한 독립 영웅 · 안중근 삼촌</span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-200 leading-relaxed font-medium">
                “우리나라를 지키기 위해 용감하게 앞장선 영웅이에요. 태극기를 사랑하는 친구들이 참 자랑스러워요!”
              </p>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. 도산 안창호 선생 (Dosan Ahn Chang-ho) - Top-Right     */}
        {/* ======================================================== */}
        {isAhn && (
          <div className="flex flex-col items-center w-full max-w-lg">
            {/* Speech Bubble */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: 'spring' }}
              className="mb-2 bg-white px-4 py-2 rounded-2xl shadow-md border-2 border-slate-700 text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2"
            >
              <span className="text-base">📢</span>
              <span>“서로 사랑하고 씩씩하게 자라렴! 최고야! ✨”</span>
              <span className="text-base">🇰🇷</span>
            </motion.div>

            {/* Illustration Frame */}
            <div className="relative flex items-center justify-center my-1 select-none">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="relative w-56 h-56 sm:w-64 sm:h-64 filter drop-shadow-xl"
              >
                <svg viewBox="0 0 260 260" className="w-full h-full">
                  {/* Background: Taegeuk & Trigrams Halo */}
                  <TaegeukHalo />

                  {/* Dark Charcoal Tailored Suit & White Shirt & Necktie */}
                  <g id="ahn-suit">
                    {/* Suit Shoulders */}
                    <path
                      d="M 60 250 L 76 195 C 82 185 178 185 184 195 L 200 250 Z"
                      fill="#22262B"
                      stroke="#14171A"
                      strokeWidth="2.5"
                    />
                    {/* White Shirt Collar */}
                    <polygon points="120,172 130,195 140,172" fill="#FFFFFF" />
                    <polygon points="112,170 125,188 120,170" fill="#F1F5F9" />
                    <polygon points="148,170 135,188 140,170" fill="#F1F5F9" />

                    {/* Black Necktie */}
                    <polygon points="127,188 133,188 135,245 125,245" fill="#14171B" />
                    <polygon points="126,186 134,186 132,194 128,194" fill="#0A0C0E" />

                    {/* Suit Lapels */}
                    <path
                      d="M 82 195 L 115 180 L 122 245 L 88 250 Z"
                      fill="#2A2F36"
                      stroke="#171A1E"
                      strokeWidth="2"
                    />
                    <path
                      d="M 178 195 L 145 180 L 138 245 L 172 250 Z"
                      fill="#2A2F36"
                      stroke="#171A1E"
                      strokeWidth="2"
                    />

                    {/* Gold Circular Lapel Badge / Pin */}
                    <circle cx="102" cy="205" r="4.5" fill="#EAB308" stroke="#CA8A04" strokeWidth="1" />
                  </g>

                  {/* Neck */}
                  <path
                    d="M 118 155 L 118 174 Q 130 178 142 174 L 142 155 Z"
                    fill="#F2C7AD"
                  />

                  {/* Refined Intellectual Face Oval */}
                  <path
                    d="M 102 115 C 100 144 108 170 130 170 C 152 170 160 144 158 115 C 158 86 102 86 102 115 Z"
                    fill="#F7D2BD"
                    stroke="#E5B59C"
                    strokeWidth="1.2"
                  />

                  {/* Ears */}
                  <ellipse cx="100" cy="128" rx="5" ry="8.5" fill="#E8B89C" />
                  <ellipse cx="160" cy="128" rx="5" ry="8.5" fill="#E8B89C" />

                  {/* Gentle Dignified Eyebrows */}
                  <path
                    d="M 110 117 Q 118 114 124 117"
                    fill="none"
                    stroke="#221C18"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 136 117 Q 142 114 150 117"
                    fill="none"
                    stroke="#221C18"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Warm, Wise Eyes */}
                  <ellipse cx="118" cy="125" rx="4.8" ry="3.5" fill="#18181B" />
                  <circle cx="116.5" cy="123.5" r="1.3" fill="#FFFFFF" />
                  <path d="M 112 123 Q 118 121 124 123" fill="none" stroke="#221C18" strokeWidth="1.5" />

                  <ellipse cx="142" cy="125" rx="4.8" ry="3.5" fill="#18181B" />
                  <circle cx="140.5" cy="123.5" r="1.3" fill="#FFFFFF" />
                  <path d="M 136 123 Q 142 121 148 123" fill="none" stroke="#221C18" strokeWidth="1.5" />

                  {/* Nose */}
                  <path
                    d="M 130 122 L 129 139 L 133 139"
                    fill="none"
                    stroke="#D29A7D"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />

                  {/* Distinctive Groomed Thin Mustache (콧수염) */}
                  <path
                    d="M 122 146 Q 130 144 138 146 Q 130 148 122 146 Z"
                    fill="#1A1817"
                  />

                  {/* Warm, Kind Lips */}
                  <path
                    d="M 124 153 Q 130 156 136 153"
                    fill="none"
                    stroke="#945242"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />

                  {/* Dapper 1920s Side-Parted Combed Sleek Hair */}
                  <path
                    d="M 98 114 C 96 82 108 72 130 72 C 154 72 164 82 162 114 C 156 96 146 92 130 94 C 114 96 104 98 98 114 Z"
                    fill="#1A1716"
                  />
                  {/* Hair Side Part & Combed Wave Lines */}
                  <path d="M 114 74 Q 116 86 114 94" stroke="#2E2824" strokeWidth="1.5" fill="none" />
                  <path d="M 126 74 Q 134 84 140 94" stroke="#2E2824" strokeWidth="1.5" fill="none" />
                  <path d="M 138 76 Q 146 84 152 94" stroke="#2E2824" strokeWidth="1.5" fill="none" />
                </svg>
              </motion.div>
            </div>

            {/* Hero Bio Card */}
            <div className="bg-slate-900 text-white rounded-2xl px-4 py-2.5 shadow-md border border-slate-700 w-full mt-1">
              <div className="text-xs font-black text-amber-300 flex items-center justify-center gap-1.5 mb-0.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>지혜로운 스승 · 안창호 선생님</span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-200 leading-relaxed font-medium">
                “우리나라 어린이들이 건강하고 착하게 공부하도록 따뜻하게 도와주신 훌륭한 선생님이에요!”
              </p>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. 유관순 열사 (Ryu Gwan-sun) - Bottom-Left in Image     */}
        {/* ======================================================== */}
        {isRyu && (
          <div className="flex flex-col items-center w-full max-w-lg">
            {/* Speech Bubble */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: 'spring' }}
              className="mb-2 bg-white px-4 py-2 rounded-2xl shadow-md border-2 border-rose-500 text-xs sm:text-sm font-black text-rose-950 flex items-center gap-2"
            >
              <span className="text-base">📢</span>
              <span>“대한 독립 만세! 태극기를 찾아주어 정말 고마워! 🌸”</span>
              <span className="text-base">🇰🇷</span>
            </motion.div>

            {/* Illustration Frame */}
            <div className="relative flex items-center justify-center my-1 select-none">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="relative w-56 h-56 sm:w-64 sm:h-64 filter drop-shadow-xl"
              >
                <svg viewBox="0 0 260 260" className="w-full h-full">
                  {/* Background: Taegeuk & Trigrams Halo */}
                  <TaegeukHalo />

                  {/* Traditional Pure White Korean Hanbok (흰색 저고리와 동정, 옷고름) */}
                  <g id="ryu-hanbok">
                    {/* Hanbok Jeogori Shoulders & Torso */}
                    <path
                      d="M 62 250 L 76 198 C 84 186 176 186 184 198 L 198 250 Z"
                      fill="#FFFFFF"
                      stroke="#CBD5E1"
                      strokeWidth="2"
                    />
                    {/* Crossed Neckline Trim (동정, Dongjeong) */}
                    <path
                      d="M 112 170 L 130 196 L 148 170"
                      fill="none"
                      stroke="#94A3B8"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    {/* Otgoreum (옷고름 - Tied White Ribbon) */}
                    <path
                      d="M 130 196 L 126 242 L 132 242 L 134 198 Z"
                      fill="#F8FAFC"
                      stroke="#94A3B8"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M 132 198 L 142 228 L 146 226 L 134 196 Z"
                      fill="#F8FAFC"
                      stroke="#94A3B8"
                      strokeWidth="1.5"
                    />
                  </g>

                  {/* Neck */}
                  <path
                    d="M 120 155 L 120 172 Q 130 176 140 172 L 140 155 Z"
                    fill="#FDE3D2"
                  />

                  {/* Pure Oval Face */}
                  <path
                    d="M 104 116 C 102 144 110 168 130 168 C 150 168 158 144 156 116 C 156 88 104 88 104 116 Z"
                    fill="#FEECE2"
                    stroke="#FBCFE8"
                    strokeWidth="1"
                  />

                  {/* Rosy Peach Cheeks */}
                  <ellipse cx="114" cy="138" rx="6.5" ry="4" fill="#FB7185" opacity="0.45" />
                  <ellipse cx="146" cy="138" rx="6.5" ry="4" fill="#FB7185" opacity="0.45" />

                  {/* Ears */}
                  <ellipse cx="102" cy="130" rx="4.5" ry="8" fill="#FDE3D2" />
                  <ellipse cx="158" cy="130" rx="4.5" ry="8" fill="#FDE3D2" />

                  {/* Natural Graceful Arched Eyebrows */}
                  <path
                    d="M 111 116 Q 118 113 124 116"
                    fill="none"
                    stroke="#27272A"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 136 116 Q 142 113 149 116"
                    fill="none"
                    stroke="#27272A"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />

                  {/* Bright, Earnest, Courageous Eyes */}
                  <ellipse cx="118" cy="125" rx="4.5" ry="4" fill="#18181B" />
                  <circle cx="116.5" cy="123.5" r="1.4" fill="#FFFFFF" />
                  <circle cx="119.5" cy="126" r="0.8" fill="#FFFFFF" />
                  <path d="M 112 123 Q 118 120 124 123" fill="none" stroke="#27272A" strokeWidth="1.5" />

                  <ellipse cx="142" cy="125" rx="4.5" ry="4" fill="#18181B" />
                  <circle cx="140.5" cy="123.5" r="1.4" fill="#FFFFFF" />
                  <circle cx="143.5" cy="126" r="0.8" fill="#FFFFFF" />
                  <path d="M 136 123 Q 142 120 148 123" fill="none" stroke="#27272A" strokeWidth="1.5" />

                  {/* Delicate Nose */}
                  <path
                    d="M 130 123 L 129 139 L 132 139"
                    fill="none"
                    stroke="#E2A68C"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />

                  {/* Resolute Gentle Lips */}
                  <path
                    d="M 124 150 Q 130 153 136 150"
                    fill="none"
                    stroke="#E11D48"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />

                  {/* Traditional Center-Parted Sleek Hair with Low Bun */}
                  <path
                    d="M 100 116 C 98 84 108 72 130 72 C 152 72 162 84 160 116 C 154 98 144 94 130 96 C 116 94 106 98 100 116 Z"
                    fill="#181414"
                  />
                  {/* Center Part Line */}
                  <path d="M 130 72 L 130 96" stroke="#2B2424" strokeWidth="1.5" />
                  {/* Hair swept back curves */}
                  <path d="M 110 82 Q 118 90 126 96" stroke="#2B2424" strokeWidth="1.2" fill="none" />
                  <path d="M 150 82 Q 142 90 134 96" stroke="#2B2424" strokeWidth="1.2" fill="none" />
                </svg>
              </motion.div>
            </div>

            {/* Hero Bio Card */}
            <div className="bg-slate-900 text-white rounded-2xl px-4 py-2.5 shadow-md border border-slate-700 w-full mt-1">
              <div className="text-xs font-black text-rose-400 flex items-center justify-center gap-1.5 mb-0.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                <span>3·1 만세 운동의 영웅 · 유관순 누나</span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-200 leading-relaxed font-medium">
                “태극기를 높이 흔들며 ‘대한 독립 만세!’를 씩씩하게 외친 용감한 누나예요!”
              </p>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 4. 매헌 윤봉길 의사 (Yun Bong-gil) - Bottom-Right in Image */}
        {/* ======================================================== */}
        {isYun && (
          <div className="flex flex-col items-center w-full max-w-lg">
            {/* Speech Bubble */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: 'spring' }}
              className="mb-2 bg-white px-4 py-2 rounded-2xl shadow-md border-2 border-amber-600 text-xs sm:text-sm font-black text-amber-950 flex items-center gap-2"
            >
              <span className="text-base">📢</span>
              <span>“끝까지 포기하지 않고 해냈구나! 정말 멋지다! 🌟”</span>
              <span className="text-base">🇰🇷</span>
            </motion.div>

            {/* Illustration Frame */}
            <div className="relative flex items-center justify-center my-1 select-none">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="relative w-56 h-56 sm:w-64 sm:h-64 filter drop-shadow-xl"
              >
                <svg viewBox="0 0 260 260" className="w-full h-full">
                  {/* Background: Taegeuk & Trigrams Halo */}
                  <TaegeukHalo />

                  {/* Dark Chocolate Brown Suit & White Shirt & Dark Tie */}
                  <g id="yun-suit">
                    {/* Suit Shoulders */}
                    <path
                      d="M 60 250 L 76 195 C 82 185 178 185 184 195 L 200 250 Z"
                      fill="#34281D"
                      stroke="#201811"
                      strokeWidth="2.5"
                    />
                    {/* White Shirt Collar */}
                    <polygon points="120,172 130,195 140,172" fill="#FFFFFF" />
                    <polygon points="112,170 125,188 120,170" fill="#F1F5F9" />
                    <polygon points="148,170 135,188 140,170" fill="#F1F5F9" />

                    {/* Dark Navy/Black Necktie */}
                    <polygon points="127,188 133,188 135,245 125,245" fill="#161E2E" />
                    <polygon points="126,186 134,186 132,194 128,194" fill="#0E1420" />

                    {/* Suit Lapels */}
                    <path
                      d="M 82 195 L 115 180 L 122 245 L 88 250 Z"
                      fill="#423427"
                      stroke="#241C14"
                      strokeWidth="2"
                    />
                    <path
                      d="M 178 195 L 145 180 L 138 245 L 172 250 Z"
                      fill="#423427"
                      stroke="#241C14"
                      strokeWidth="2"
                    />
                  </g>

                  {/* Neck */}
                  <path
                    d="M 118 155 L 118 174 Q 130 178 142 174 L 142 155 Z"
                    fill="#F2C7AD"
                  />

                  {/* Youthful Handsome Masculine Face */}
                  <path
                    d="M 102 115 C 100 144 108 170 130 170 C 152 170 160 144 158 115 C 158 86 102 86 102 115 Z"
                    fill="#F7D0BA"
                    stroke="#E5B298"
                    strokeWidth="1.2"
                  />

                  {/* Ears */}
                  <ellipse cx="100" cy="128" rx="5" ry="8.5" fill="#E8B89C" />
                  <ellipse cx="160" cy="128" rx="5" ry="8.5" fill="#E8B89C" />

                  {/* Bold Spirited Eyebrows */}
                  <path
                    d="M 109 116 Q 118 112 124 116"
                    fill="none"
                    stroke="#1D1917"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 136 116 Q 142 112 151 116"
                    fill="none"
                    stroke="#1D1917"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />

                  {/* Courageous, Deep Eyes */}
                  <ellipse cx="118" cy="125" rx="4.8" ry="3.8" fill="#18181B" />
                  <circle cx="116.5" cy="123.5" r="1.3" fill="#FFFFFF" />
                  <path d="M 112 123 Q 118 120 124 123" fill="none" stroke="#221C18" strokeWidth="1.5" />

                  <ellipse cx="142" cy="125" rx="4.8" ry="3.8" fill="#18181B" />
                  <circle cx="140.5" cy="123.5" r="1.3" fill="#FFFFFF" />
                  <path d="M 136 123 Q 142 120 148 123" fill="none" stroke="#221C18" strokeWidth="1.5" />

                  {/* Nose */}
                  <path
                    d="M 130 122 L 129 139 L 133 139"
                    fill="none"
                    stroke="#D29A7D"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />

                  {/* Confident Reassuring Smile */}
                  <path
                    d="M 122 151 Q 130 156 138 151"
                    fill="none"
                    stroke="#A8483B"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Signature Voluminous Wavy Pompadour Hair */}
                  {/* Left & Right wave curls */}
                  <path
                    d="M 96 114 C 94 80 106 68 128 70 C 130 72 130 76 130 76 C 130 76 132 72 134 70 C 156 68 166 80 164 114 C 156 94 148 92 133 94 C 130 95 127 94 125 94 C 112 92 104 94 96 114 Z"
                    fill="#181412"
                  />
                  {/* Voluminous Curls Highlight Strands */}
                  <path d="M 108 76 Q 118 84 122 94" stroke="#312822" strokeWidth="2" fill="none" />
                  <path d="M 118 72 Q 124 82 126 92" stroke="#312822" strokeWidth="1.8" fill="none" />
                  <path d="M 152 76 Q 142 84 138 94" stroke="#312822" strokeWidth="2" fill="none" />
                  <path d="M 142 72 Q 136 82 134 92" stroke="#312822" strokeWidth="1.8" fill="none" />
                </svg>
              </motion.div>
            </div>

            {/* Hero Bio Card */}
            <div className="bg-slate-900 text-white rounded-2xl px-4 py-2.5 shadow-md border border-slate-700 w-full mt-1">
              <div className="text-xs font-black text-amber-300 flex items-center justify-center gap-1.5 mb-0.5">
                <Medal className="w-3.5 h-3.5 text-amber-400" />
                <span>용감한 독립 영웅 · 윤봉길 삼촌</span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-200 leading-relaxed font-medium">
                “우리나라를 지키려고 굳센 용기를 보여주신 멋진 삼촌이에요!”
              </p>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 5. 백범 김구 선생 (Kim Gu) - Bonus Hero                  */}
        {/* ======================================================== */}
        {isKim && (
          <div className="flex flex-col items-center w-full max-w-lg">
            {/* Speech Bubble */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: 'spring' }}
              className="mb-2 bg-white px-4 py-2 rounded-2xl shadow-md border-2 border-amber-600 text-xs sm:text-sm font-black text-amber-950 flex items-center gap-2"
            >
              <span className="text-base">📢</span>
              <span>“우리나라를 사랑하는 착한 마음, 정말 훌륭해! 🇰🇷”</span>
              <span className="text-base">✨</span>
            </motion.div>

            {/* Illustration Frame */}
            <div className="relative flex items-center justify-center my-1 select-none">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="relative w-56 h-56 sm:w-64 sm:h-64 filter drop-shadow-xl"
              >
                <svg viewBox="0 0 260 260" className="w-full h-full">
                  <TaegeukHalo />

                  {/* Traditional Durumagi */}
                  <path
                    d="M 60 250 L 76 195 C 84 185 176 185 184 195 L 200 250 Z"
                    fill="#F8FAFC"
                    stroke="#CBD5E1"
                    strokeWidth="2.5"
                  />
                  <path d="M 114 172 L 130 196 L 146 172" fill="none" stroke="#94A3B8" strokeWidth="3" />

                  {/* Face */}
                  <path
                    d="M 102 115 C 100 146 108 172 130 172 C 152 172 160 146 158 115 C 158 86 102 86 102 115 Z"
                    fill="#F5CDAF"
                    stroke="#DEB092"
                    strokeWidth="1.2"
                  />

                  {/* Iconic Round Glasses */}
                  <circle cx="118" cy="125" r="9" fill="none" stroke="#334155" strokeWidth="2.5" />
                  <circle cx="142" cy="125" r="9" fill="none" stroke="#334155" strokeWidth="2.5" />
                  <line x1="127" y1="125" x2="133" y2="125" stroke="#334155" strokeWidth="2.5" />

                  {/* Warm Eyes behind glasses */}
                  <ellipse cx="118" cy="125" rx="3.5" ry="3" fill="#18181B" />
                  <ellipse cx="142" cy="125" rx="3.5" ry="3" fill="#18181B" />

                  {/* Gentle Benevolent Smile */}
                  <path d="M 123 151 Q 130 156 137 151" fill="none" stroke="#945242" strokeWidth="2.2" strokeLinecap="round" />

                  {/* Hair */}
                  <path
                    d="M 98 112 C 96 82 108 72 130 72 C 152 72 162 82 162 112 C 156 94 146 92 130 92 C 114 92 104 94 98 112 Z"
                    fill="#27272A"
                  />
                </svg>
              </motion.div>
            </div>

            {/* Hero Bio Card */}
            <div className="bg-slate-900 text-white rounded-2xl px-4 py-2.5 shadow-md border border-slate-700 w-full mt-1">
              <div className="text-xs font-black text-amber-300 flex items-center justify-center gap-1.5 mb-0.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>따뜻한 지도자 · 김구 할아버지</span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-200 leading-relaxed font-medium">
                “우리나라가 평화롭고 행복한 나라가 되도록 늘 힘써 주신 인자한 할아버지예요!”
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
