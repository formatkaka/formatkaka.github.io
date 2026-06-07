import * as React from 'react';
import { Sparkles, Landmark, Moon, Globe } from 'lucide-react';

export const THEMES: Record<PostcardVariant, ThemeConfig> = {
  modern: {
    id: 'modern',
    name: 'Modern',
    front: {
      bgClass: 'bg-[#0f0f11] border border-stone-800',
      textClass: 'text-white',
      subTextClass: 'text-stone-500 font-semibold',
      headerLabel: 'Edition 01 / Minimal',
      placeholderTitle: 'Quiet Space',
      icon: Sparkles,
      footerLeft: '© 2026 PROSE',
      footerRight: 'M01-P7',
      titleStyleClass:
        'text-2xl font-sans font-light tracking-[0.15em] leading-snug uppercase max-w-[85%]',
    },
    back: {
      bgClass: 'bg-white',
      borderClass: 'border-stone-200',
      lineColor: '#f1f1f4',
      textColor: 'text-stone-700',
      headerLabel: 'Note',
      headerStyleClass: 'text-[9px] font-mono uppercase tracking-[0.15em] text-stone-400',
      messageStyleClass:
        'flex-1 relative bg-[repeating-linear-gradient(transparent,transparent_23px,#f1f1f4_23px,#f1f1f4_24px)] leading-6 text-sm font-sans font-light text-stone-700 whitespace-pre-wrap overflow-y-auto max-h-[180px] pt-1 pr-1',
      addressStyleClass: 'text-xs font-sans font-medium text-stone-800 pl-2',
      placeholderMessage: 'Type message here...',
      placeholderRecipient: 'Full Name',
      placeholderAddress: 'Street, City',
      postageBg: 'bg-stone-50',
      postageBorder: 'border-stone-200',
      postagePrice: '1ST CLASS',
      postageLabel: 'STAMP',
      postageEmoji: '🕊️',
    },
  },
  antique: {
    id: 'antique',
    name: 'Antique',
    front: {
      bgClass: 'bg-[#eae0d5] border-8 border-double border-[#5e503f]/20',
      textClass: 'text-[#5e503f]',
      subTextClass: 'text-[#5e503f]/75 font-mono',
      headerLabel: 'Correspondence Carte',
      placeholderTitle: 'Souvenir d’Époque',
      icon: Landmark,
      footerLeft: 'Série Limitée',
      footerRight: '№ 1895',
      titleStyleClass:
        'text-3xl font-serif italic tracking-wide text-[#4f4233] drop-shadow-sm leading-relaxed',
    },
    back: {
      bgClass: 'bg-[#f4ebd0]',
      borderClass: 'border-[#c6ac8f]',
      lineColor: '#c6ac8f',
      textColor: 'text-[#4a3f32]',
      headerLabel: 'Correspondance',
      headerStyleClass:
        'text-[8px] font-serif uppercase tracking-widest text-[#5e503f]/60 font-semibold',
      messageStyleClass:
        'flex-1 relative bg-[repeating-linear-gradient(transparent,transparent_23px,#c6ac8f_23px,#c6ac8f_24px)] leading-6 text-xs font-serif italic text-[#4a3f32] whitespace-pre-wrap overflow-y-auto max-h-[180px] pt-1 pr-1',
      addressStyleClass: 'text-xs font-serif font-semibold text-[#4a3f32] pl-2',
      placeholderMessage: 'Écrivez votre message ici...',
      placeholderRecipient: 'Nom du destinataire',
      placeholderAddress: 'Rue & Ville',
      postageBg: 'bg-[#eae0d5]',
      postageBorder: 'border-[#5e503f]/40',
      postagePrice: '1/2 PENCE',
      postageLabel: 'Postes',
      postageEmoji: '👑',
      postmark: (
        <div className="absolute top-4 right-16 w-20 h-20 border-2 border-dashed border-[#5e503f]/40 rounded-full flex items-center justify-center rotate-12 pointer-events-none z-20">
          <div className="text-[7px] font-serif uppercase tracking-widest text-[#5e503f]/50 text-center select-none font-bold leading-none">
            LONDON
            <br />
            PAID
            <br />
            1895
          </div>
        </div>
      ),
      decorations: (
        <>
          <div className="absolute inset-0 bg-[#5e503f]/5 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(#5e503f_0.5px,transparent_0.5px)] [background-size:12px_12px] opacity-10 pointer-events-none" />
        </>
      ),
    },
  },
  starry: {
    id: 'starry',
    name: 'Starry',
    front: {
      bgClass: 'bg-gradient-to-tr from-slate-950 via-[#0b132b] to-[#1d3f82]',
      textClass: 'text-indigo-100',
      subTextClass: 'text-indigo-300 opacity-80',
      headerLabel: 'Celestial Archive',
      placeholderTitle: 'Wish Upon A Star',
      icon: Moon,
      footerLeft: 'Stellar System',
      footerRight: 'LV-426',
      titleStyleClass:
        'text-2xl sm:text-3xl font-serif italic tracking-wide text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.15)] leading-relaxed',
      decorations: (
        <div className="absolute inset-0 bg-[radial-gradient(white_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
      ),
    },
    back: {
      bgClass: 'bg-[#090b14]',
      borderClass: 'border-indigo-950',
      lineColor: '#1e293b',
      textColor: 'text-indigo-100',
      headerLabel: 'Transmission',
      headerStyleClass: 'text-[8px] font-mono uppercase tracking-wider text-indigo-400 font-bold',
      messageStyleClass:
        'flex-1 relative bg-[repeating-linear-gradient(transparent,transparent_23px,#1e293b_23px,#1e293b_24px)] leading-6 text-xs font-serif italic text-indigo-100 whitespace-pre-wrap overflow-y-auto max-h-[180px] pt-1 pr-1',
      addressStyleClass: 'text-xs font-serif italic font-bold text-white pl-2',
      placeholderMessage: 'Write into the starry sky...',
      placeholderRecipient: 'Voyager Name',
      placeholderAddress: 'Constellation Coordinates',
      postageBg: 'bg-indigo-950/20',
      postageBorder: 'border-indigo-900/50',
      postagePrice: 'SYSTEM.7',
      postageLabel: 'Orbit',
      postageEmoji: '🌙',
      decorations: (
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_0.5px,transparent_0.5px)] [background-size:16px_16px] opacity-5 pointer-events-none" />
      ),
    },
  },
  plain: {
    id: 'plain',
    name: 'Plain',
    front: {
      bgClass: 'bg-white border border-stone-200',
      textClass: 'text-stone-900',
      subTextClass: 'text-stone-500 font-mono',
      headerLabel: 'POSTCARD',
      placeholderTitle: 'A Simple Note',
      icon: Sparkles,
      footerLeft: 'PLAIN SERIES',
      footerRight: 'NO. 01',
      titleStyleClass: 'text-2xl font-serif tracking-wide text-stone-900 leading-snug text-center',
    },
    back: {
      bgClass: 'bg-white',
      borderClass: 'border-stone-200',
      lineColor: '#e5e7eb',
      textColor: 'text-stone-800',
      headerLabel: 'MESSAGE',
      headerStyleClass: 'text-[9px] font-mono uppercase tracking-widest text-stone-400',
      messageStyleClass:
        'flex-1 relative bg-[repeating-linear-gradient(transparent,transparent_23px,#e5e7eb_23px,#e5e7eb_24px)] leading-6 text-sm font-serif text-stone-700 whitespace-pre-wrap overflow-y-auto max-h-[180px] pt-1 pr-1',
      addressStyleClass: 'text-xs font-serif font-semibold text-stone-800 pl-2',
      placeholderMessage: 'Write your note...',
      placeholderRecipient: 'Recipient Name',
      placeholderAddress: 'Street, City',
      postageBg: 'bg-stone-50',
      postageBorder: 'border-stone-200',
      postagePrice: 'STANDARD',
      postageLabel: 'STAMP',
      postageEmoji: '📬',
    },
  },
  travel: {
    id: 'travel',
    name: 'Travel',
    front: {
      bgClass: 'bg-transparent',
      textClass: 'text-stone-800',
      subTextClass: 'text-blue-900/70 font-mono font-semibold tracking-wider',
      headerLabel: 'AIR MAIL / PAR AVION',
      placeholderTitle: 'Paris, France',
      icon: Globe,
      footerLeft: 'POST CARD',
      footerRight: 'BY AIR MAIL',
      titleStyleClass:
        'w-[48%] ml-auto text-center font-serif text-2xl sm:text-3xl font-black italic tracking-wide uppercase text-rose-600 drop-shadow-sm rotate-[-2deg] mt-4',
      decorations: (
        <>
          {/* Left half: Beautiful travel photo slot/montage */}
          <div className="absolute left-6 top-6 bottom-6 w-[42%] bg-gradient-to-b from-sky-100 to-sky-300 rounded-lg shadow-md border-2 border-white overflow-hidden flex flex-col justify-between p-3 z-0 pointer-events-none">
            {/* Soft sky-blue shadow lines */}
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,transparent_45%,#000_45%,#000_55%,transparent_55%)] [background-size:10px_10px]" />

            {/* Sun */}
            <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-amber-300 blur-[1px] opacity-80" />

            {/* Clouds */}
            <span className="absolute top-3 left-3 text-xl opacity-80">☁️</span>
            <span className="absolute top-6 right-6 text-sm opacity-60">☁️</span>

            {/* Montage of emojis */}
            <div className="relative flex-1 flex items-center justify-center gap-1 mt-4">
              <span className="text-4xl drop-shadow-md select-none z-10">🗼</span>
              <span className="text-5xl drop-shadow-md select-none z-20 -mx-3 mb-2">🗽</span>
              <span className="text-4xl drop-shadow-md select-none z-10">🕰️</span>
            </div>

            {/* Suitcase & glasses/cloud at bottom */}
            <div className="flex justify-between items-end z-10">
              <span className="text-2xl drop-shadow-sm select-none">🧳</span>
              <span className="text-xl drop-shadow-sm select-none">🕶️</span>
            </div>
          </div>

          {/* Right half: Retro GREETINGS FROM... typography */}
          <div className="absolute right-6 top-16 bottom-6 left-[50%] flex flex-col items-center justify-start text-center select-none pointer-events-none z-0">
            <span className="font-serif font-black tracking-widest text-amber-800/80 text-[10px] uppercase mb-1 drop-shadow-sm">
              ★ GREETINGS FROM ★
            </span>
          </div>
        </>
      ),
    },
    back: {
      bgClass: 'bg-transparent',
      borderClass: 'border-transparent',
      lineColor: '#e5e7eb',
      textColor: 'text-amber-950',
      headerLabel: 'AIR MAIL',
      headerStyleClass: 'text-[9px] font-sans font-bold uppercase tracking-widest text-blue-900/70',
      messageStyleClass:
        'flex-1 relative bg-[repeating-linear-gradient(transparent,transparent_23px,#e5e7eb_23px,#e5e7eb_24px)] leading-6 text-xs font-serif italic text-amber-900 whitespace-pre-wrap overflow-y-auto max-h-[180px] pt-1 pr-1',
      addressStyleClass: 'text-xs font-serif font-bold text-amber-950 pl-2',
      placeholderMessage: 'Write your travel notes here...',
      placeholderRecipient: 'Recipient Name',
      placeholderAddress: 'Destination Address',
      postageBg: 'bg-amber-50',
      postageBorder: 'border-amber-900/30',
      postagePrice: 'AIR MAIL',
      postageLabel: 'POSTAGE',
      postageEmoji: '✈️',
      postmark: (
        <>
          {/* Stacked bezier curves wavy cancellation lines */}
          <svg
            className="absolute top-4 right-14 w-36 h-16 pointer-events-none select-none z-20 opacity-70"
            viewBox="0 0 100 40"
            fill="none"
          >
            <path
              d="M 0 5 Q 15 15 30 5 T 60 5 T 90 5"
              stroke="#b45309"
              strokeWidth="1"
              strokeLinecap="round"
            />
            <path
              d="M 0 12 Q 15 22 30 12 T 60 12 T 90 12"
              stroke="#b45309"
              strokeWidth="1"
              strokeLinecap="round"
            />
            <path
              d="M 0 19 Q 15 29 30 19 T 60 19 T 90 19"
              stroke="#b45309"
              strokeWidth="1"
              strokeLinecap="round"
            />
            <path
              d="M 0 26 Q 15 36 30 26 T 60 26 T 90 26"
              stroke="#b45309"
              strokeWidth="1"
              strokeLinecap="round"
            />
            <path
              d="M 0 33 Q 15 43 30 33 T 60 33 T 90 33"
              stroke="#b45309"
              strokeWidth="1"
              strokeLinecap="round"
            />
          </svg>
        </>
      ),
      decorations: undefined,
    },
  },
};

export type PostcardVariant = 'modern' | 'antique' | 'starry' | 'plain' | 'travel';

export type ThemeConfig = {
  id: PostcardVariant;
  name: string;
  front: {
    bgClass: string;
    textClass: string;
    subTextClass: string;
    headerLabel: string;
    placeholderTitle: string;
    icon: React.ComponentType<{ className?: string }>;
    decorations?: React.ReactNode;
    footerLeft: string;
    footerRight: string;
    titleStyleClass: string;
  };
  back: {
    bgClass: string;
    borderClass: string;
    lineColor: string;
    textColor: string;
    headerLabel: string;
    headerStyleClass: string;
    messageStyleClass: string;
    addressStyleClass: string;
    placeholderMessage: string;
    placeholderRecipient: string;
    placeholderAddress: string;
    postageBg: string;
    postageBorder: string;
    postagePrice: string;
    postageLabel: string;
    postageEmoji: string;
    postmark?: React.ReactNode;
    decorations?: React.ReactNode;
  };
};
