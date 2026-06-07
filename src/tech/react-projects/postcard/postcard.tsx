import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { THEMES } from './config';
import type { PostcardVariant } from './config';

export const PostcardFront = (props: PostcardFrontProps) => {
  const { title, variant } = props;
  const theme = THEMES[variant];
  const FrontIcon = theme.front.icon;
  const isTravel = variant === 'travel';
  const frontContentClass = isTravel
    ? 'relative h-full w-full rounded-md bg-white shadow-[inset_0_0_10px_rgba(0,0,0,0.08)] flex flex-col justify-between p-6'
    : 'flex flex-col justify-between h-full';
  const travelFrameStyle = isTravel
    ? {
        background:
          'repeating-linear-gradient(45deg, #c2272d, #c2272d 12px, #fff 12px, #fff 24px, #1d3f82 24px, #1d3f82 36px, #fff 36px, #fff 48px)',
      }
    : undefined;

  return (
    <div
      className={`absolute inset-0 w-full h-full rounded-2xl shadow-xl select-none overflow-hidden ${
        isTravel ? 'p-2.5' : 'p-8'
      } ${theme.front.bgClass} ${theme.front.textClass}`}
      style={{
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: 'rotateY(0deg)',
        ...travelFrameStyle,
      }}
    >
      <div className={frontContentClass}>
        {theme.front.decorations}
        <div className="flex justify-between items-start z-10">
          <span
            className={`text-[10px] font-mono tracking-widest uppercase ${theme.front.subTextClass} ${
              isTravel ? 'pl-[45%]' : ''
            }`}
          >
            {theme.front.headerLabel}
          </span>
          <FrontIcon className="w-4 h-4 opacity-70" />
        </div>
        <div className="my-auto text-center z-10">
          <h2 className={theme.front.titleStyleClass}>
            {title.trim() || theme.front.placeholderTitle}
          </h2>
        </div>
        <div
          className={`flex justify-between items-end z-10 text-[9px] font-mono uppercase tracking-wider ${theme.front.subTextClass}`}
        >
          <span className={isTravel ? 'pl-[45%]' : ''}>{theme.front.footerLeft}</span>
          <span>{theme.front.footerRight}</span>
        </div>
      </div>
    </div>
  );
};

export const PostcardBack = (props: PostcardBackProps) => {
  const { message, recipient, address, variant } = props;
  const theme = THEMES[variant];
  const isTravel = variant === 'travel';
  const backContentClass = isTravel
    ? 'relative h-full w-full rounded-md bg-white shadow-[inset_0_0_10px_rgba(0,0,0,0.08)] flex p-6'
    : 'flex h-full';
  const travelFrameStyle = isTravel
    ? {
        background:
          'repeating-linear-gradient(45deg, #c2272d, #c2272d 12px, #fff 12px, #fff 24px, #1d3f82 24px, #1d3f82 36px, #fff 36px, #fff 48px)',
      }
    : undefined;

  return (
    <div
      className={`absolute inset-0 w-full h-full rounded-2xl shadow-xl overflow-hidden ${
        isTravel ? 'p-2.5 border-0' : 'p-6 border-4 border-double'
      } ${theme.back.bgClass} ${theme.back.borderClass} ${theme.back.textColor}`}
      style={{
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: 'rotateY(180deg)',
        ...travelFrameStyle,
      }}
    >
      {theme.back.postmark}

      <div className={backContentClass}>
        {/* Left Side: Message */}
        <div
          className={`w-[60%] pr-4 flex flex-col justify-between h-full z-10 ${
            isTravel
              ? 'border-r-4 border-double border-amber-800/30'
              : 'border-r border-dashed border-stone-300'
          }`}
        >
          <div className="flex-1 flex flex-col">
            <span className={theme.back.headerStyleClass}>{theme.back.headerLabel}</span>
            <div className={theme.back.messageStyleClass}>
              {message || theme.back.placeholderMessage}
            </div>
          </div>
          <span className="text-[9px] font-mono opacity-50 mt-2">Made with care.</span>
        </div>

        {/* Right Side: Stamp & Recipient */}
        <div className="w-[40%] pl-4 flex flex-col justify-between h-full z-10">
          <div className="flex justify-end">
            {isTravel ? (
              <div className="relative w-14 h-16 bg-amber-50 rounded-sm flex flex-col items-center justify-center p-1 shadow-sm border border-amber-900/10 select-none">
                {/* Scallop "bites" on the edges */}
                <div className="absolute top-[-3px] left-0 right-0 flex justify-around pointer-events-none">
                  <div className="w-1.5 h-1.5 rounded-full bg-white border border-amber-800/10" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white border border-amber-800/10" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white border border-amber-800/10" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white border border-amber-800/10" />
                </div>
                <div className="absolute bottom-[-3px] left-0 right-0 flex justify-around pointer-events-none">
                  <div className="w-1.5 h-1.5 rounded-full bg-white border border-amber-800/10" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white border border-amber-800/10" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white border border-amber-800/10" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white border border-amber-800/10" />
                </div>
                <div className="absolute left-[-3px] top-0 bottom-0 flex flex-col justify-around pointer-events-none">
                  <div className="w-1.5 h-1.5 rounded-full bg-white border border-amber-800/10" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white border border-amber-800/10" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white border border-amber-800/10" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white border border-amber-800/10" />
                </div>
                <div className="absolute right-[-3px] top-0 bottom-0 flex flex-col justify-around pointer-events-none">
                  <div className="w-1.5 h-1.5 rounded-full bg-white border border-amber-800/10" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white border border-amber-800/10" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white border border-amber-800/10" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white border border-amber-800/10" />
                </div>

                <span className="text-xl my-0.5 leading-none">✈️</span>
                <span className="text-[8px] font-sans font-extrabold uppercase tracking-wider text-amber-950 mt-1">
                  TRAVEL
                </span>
              </div>
            ) : (
              <div
                className={`w-14 h-16 border-2 border-dashed rounded flex flex-col items-center justify-center p-1 shadow-sm ${theme.back.postageBg} ${theme.back.postageBorder}`}
              >
                <span className="text-[7px] font-mono opacity-60 uppercase">
                  {theme.back.postageLabel}
                </span>
                <span className="text-xl my-0.5">{theme.back.postageEmoji}</span>
                <span className="text-[7px] font-mono opacity-80 font-bold">
                  {theme.back.postagePrice}
                </span>
              </div>
            )}
          </div>

          {isTravel ? (
            <div className="space-y-4 mb-2 text-amber-950 font-serif">
              <div className="border-b border-amber-800/30 pb-0.5 min-h-[28px] flex items-end">
                <span className="text-xs font-bold mr-2 text-amber-900/60 select-none">To:</span>
                <span className={`${theme.back.addressStyleClass} flex-1 pb-0.5`}>
                  {recipient || theme.back.placeholderRecipient}
                </span>
              </div>
              <div className="border-b border-amber-800/30 pb-0.5 min-h-[28px] flex items-end justify-between">
                <span className={`${theme.back.addressStyleClass} flex-1 pb-0.5`}>
                  {address || theme.back.placeholderAddress}
                </span>
                <MapPin className="w-3 h-3 text-amber-800/40 shrink-0 mb-0.5" />
              </div>
            </div>
          ) : (
            <div className="space-y-4 mb-2">
              <div className="border-b border-stone-300 pb-0.5 min-h-[28px]">
                <span className="text-[8px] font-mono opacity-50 block">TO</span>
                <span className={theme.back.addressStyleClass}>
                  {recipient || theme.back.placeholderRecipient}
                </span>
              </div>
              <div className="border-b border-stone-300 pb-0.5 min-h-[28px] flex items-center justify-between">
                <div className="flex-1">
                  <span className="text-[8px] font-mono opacity-50 block">ADDRESS</span>
                  <span className={theme.back.addressStyleClass}>
                    {address || theme.back.placeholderAddress}
                  </span>
                </div>
                <MapPin className="w-3 h-3 opacity-40 shrink-0" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const Postcard = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [recipient, setRecipient] = useState('');
  const [address, setAddress] = useState('');
  const [variant, setVariant] = useState<PostcardVariant>('modern');

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleVariantChange = (v: PostcardVariant) => {
    setVariant(v);
  };

  const currentTheme = THEMES[variant];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col lg:flex-row gap-8 items-stretch p-4">
      {/* 1. Postcard Preview Column */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-[380px]">
        {/* 3D Flippable Card Frame */}
        <div
          className="relative w-full max-w-[500px] h-[300px] cursor-pointer"
          style={{ perspective: '1200px' }}
          onClick={handleFlip}
          aria-label="Click to flip postcard"
        >
          <div
            className="relative w-full h-full transition-transform duration-700 ease-out"
            style={{
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            <PostcardFront title={title} variant={variant} />
            <PostcardBack
              message={message}
              recipient={recipient}
              address={address}
              variant={variant}
            />
          </div>
        </div>

        {/* Interactive action controls */}
        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={handleFlip}
            className="flex items-center gap-2 px-5 py-2.5 bg-stone-800 text-white hover:bg-stone-700 active:scale-95 transition-all rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl cursor-pointer"
          >
            <span>Flip Postcard</span>
            <span>🔄</span>
          </button>
        </div>
      </div>

      {/* 2. Customizer Editor Panel */}
      <div className="w-full lg:w-96 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-md flex flex-col gap-5">
        <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2 pb-2 border-b border-stone-100 dark:border-stone-800">
          <span>📮</span>
          <span>Customize Postcard</span>
        </h3>

        {/* Variant Picker */}
        <div>
          <label className="block text-[10px] font-mono font-bold text-stone-500 uppercase mb-2 tracking-wider">
            Style Variant
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {(['modern', 'antique', 'starry', 'plain', 'travel'] as const).map((v) => (
              <button
                key={v}
                onClick={() => handleVariantChange(v)}
                className={`py-2 px-1 rounded-xl border text-[10px] font-mono font-bold capitalize transition-all cursor-pointer ${
                  variant === v
                    ? 'border-rose-500 bg-rose-500/10 text-rose-500 shadow-sm'
                    : 'border-stone-200 dark:border-stone-800 bg-transparent text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                }`}
              >
                {THEMES[v].name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono font-bold text-stone-500 uppercase mb-1.5 tracking-wider">
              Front Cover Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={currentTheme.front.placeholderTitle}
              className="w-full px-3.5 py-2 border border-stone-200 dark:border-stone-800 rounded-xl text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 dark:text-white transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold text-stone-500 uppercase mb-1.5 tracking-wider">
              Message content
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={currentTheme.back.placeholderMessage}
              rows={4}
              className="w-full px-3.5 py-2 border border-stone-200 dark:border-stone-800 rounded-xl text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 dark:text-white transition-all resize-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold text-stone-500 uppercase mb-1.5 tracking-wider">
              Recipient Name
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Name"
              className="w-full px-3.5 py-2 border border-stone-200 dark:border-stone-800 rounded-xl text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 dark:text-white transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold text-stone-500 uppercase mb-1.5 tracking-wider">
              Recipient Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street & City"
              className="w-full px-3.5 py-2 border border-stone-200 dark:border-stone-800 rounded-xl text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 dark:text-white transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

type PostcardFrontProps = {
  title: string;
  variant: PostcardVariant;
};

type PostcardBackProps = {
  message: string;
  recipient: string;
  address: string;
  variant: PostcardVariant;
};
