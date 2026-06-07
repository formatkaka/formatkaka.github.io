import { createSignal, Show, type Component } from 'solid-js';
import { THEMES } from './config';
import type { PostcardVariant } from './config';

const MapPin: Component<{ class?: string }> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class={props.class}
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const PostcardFront: Component<PostcardFrontProps> = (props) => {
  const theme = () => THEMES[props.variant];
  const isTravel = () => props.variant === 'travel';
  const hasImage = () => Boolean(props.imageUrl);

  const frontContentClass = () =>
    isTravel()
      ? 'relative h-full w-full rounded-md bg-white shadow-[inset_0_0_10px_rgba(0,0,0,0.08)] flex flex-col justify-between p-6'
      : `flex flex-col justify-between h-full${hasImage() ? ' text-white' : ''}`;

  const travelFrameStyle = () =>
    isTravel()
      ? {
          background:
            'repeating-linear-gradient(45deg, #c2272d, #c2272d 12px, #fff 12px, #fff 24px, #1d3f82 24px, #1d3f82 36px, #fff 36px, #fff 48px)',
        }
      : undefined;

  const bgImageStyle = () =>
    !isTravel() && hasImage()
      ? {
          'background-image': `url(${props.imageUrl})`,
          'background-size': 'cover',
          'background-position': 'center',
        }
      : undefined;

  return (
    <div
      class={`absolute inset-0 w-full h-full rounded-2xl shadow-xl select-none overflow-hidden ${
        isTravel() ? 'p-2.5' : 'p-8'
      } ${theme().front.bgClass} ${theme().front.textClass}`}
      style={{
        'backface-visibility': 'hidden',
        '-webkit-backface-visibility': 'hidden',
        transform: 'rotateY(0deg)',
        ...travelFrameStyle(),
        ...bgImageStyle(),
      }}
    >
      {/* Dark gradient overlay for non-travel image backgrounds */}
      {!isTravel() && hasImage() && (
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20 z-0 pointer-events-none" />
      )}

      <div class={frontContentClass()}>
        {/* Travel with image: replace cartoon panel with real photo */}
        {isTravel() && hasImage() ? (
          <>
            <div class="absolute left-6 top-6 bottom-6 w-[42%] rounded-lg shadow-md border-2 border-white overflow-hidden z-0 pointer-events-none">
              <img src={props.imageUrl} alt="Postcard photo" class="w-full h-full object-cover" />
            </div>
            <div class="absolute right-6 top-16 bottom-6 left-[50%] flex flex-col items-center justify-start text-center select-none pointer-events-none z-0">
              <span class="font-serif font-black tracking-widest text-amber-800/80 text-[10px] uppercase mb-1 drop-shadow-sm">
                ★ GREETINGS FROM ★
              </span>
            </div>
          </>
        ) : (
          theme().front.decorations
        )}

        <div class="flex justify-between items-start z-10">
          <span
            class={`text-[10px] font-mono tracking-widest uppercase ${
              hasImage() && !isTravel() ? 'text-white/80' : theme().front.subTextClass
            } ${isTravel() ? 'pl-[45%]' : ''}`}
          >
            {theme().front.headerLabel}
          </span>
          {(() => {
            const Icon = theme().front.icon;
            return (
              <Icon
                class={`w-4 h-4 ${hasImage() && !isTravel() ? 'text-white/80' : 'opacity-70'}`}
              />
            );
          })()}
        </div>

        <div class="my-auto text-center z-10">
          <h2
            class={theme().front.titleStyleClass}
            style={
              hasImage() && !isTravel()
                ? { color: 'white', 'text-shadow': '0 2px 12px rgba(0,0,0,0.6)' }
                : undefined
            }
          >
            {props.title.trim() || theme().front.placeholderTitle}
          </h2>
        </div>

        <div
          class={`flex justify-between items-end z-10 text-[9px] font-mono uppercase tracking-wider ${
            hasImage() && !isTravel() ? 'text-white/70' : theme().front.subTextClass
          }`}
        >
          <span class={isTravel() ? 'pl-[45%]' : ''}>{theme().front.footerLeft}</span>
          <span>{theme().front.footerRight}</span>
        </div>
      </div>
    </div>
  );
};

export const PostcardBack: Component<PostcardBackProps> = (props) => {
  const theme = () => THEMES[props.variant];
  const isTravel = () => props.variant === 'travel';
  const hasImage = () => Boolean(props.imageUrl);

  const backContentClass = () =>
    isTravel()
      ? 'relative h-full w-full rounded-md bg-white shadow-[inset_0_0_10px_rgba(0,0,0,0.08)] flex p-6'
      : 'flex h-full';

  const travelFrameStyle = () =>
    isTravel()
      ? {
          background:
            'repeating-linear-gradient(45deg, #c2272d, #c2272d 12px, #fff 12px, #fff 24px, #1d3f82 24px, #1d3f82 36px, #fff 36px, #fff 48px)',
        }
      : undefined;

  return (
    <div
      class={`absolute inset-0 w-full h-full rounded-2xl shadow-xl overflow-hidden ${
        isTravel() ? 'p-2.5 border-0' : 'p-6 border-4 border-double'
      } ${theme().back.bgClass} ${theme().back.borderClass} ${theme().back.textColor}`}
      style={{
        'backface-visibility': 'hidden',
        '-webkit-backface-visibility': 'hidden',
        transform: 'rotateY(180deg)',
        ...travelFrameStyle(),
      }}
    >
      {theme().back.postmark}

      <div class={backContentClass()}>
        {/* Left Side: Message */}
        <div
          class={`w-[60%] pr-4 flex flex-col justify-between h-full z-10 ${
            isTravel()
              ? 'border-r-4 border-double border-amber-800/30'
              : 'border-r border-dashed border-stone-300'
          }`}
        >
          <div class="flex-1 flex flex-col">
            <span class={theme().back.headerStyleClass}>{theme().back.headerLabel}</span>
            <div class={theme().back.messageStyleClass}>
              {props.message || theme().back.placeholderMessage}
            </div>
          </div>
          <span class="text-[9px] font-mono opacity-50 mt-2">Made with care.</span>
        </div>

        {/* Right Side: Stamp & Recipient */}
        <div class="w-[40%] pl-4 flex flex-col justify-between h-full z-10">
          <div class="flex justify-end">
            <Show
              when={hasImage()}
              fallback={
                <Show
                  when={isTravel()}
                  fallback={
                    <div
                      class={`w-14 h-16 border-2 border-dashed rounded flex flex-col items-center justify-center p-1 shadow-sm ${theme().back.postageBg} ${theme().back.postageBorder}`}
                    >
                      <span class="text-[7px] font-mono opacity-60 uppercase">
                        {theme().back.postageLabel}
                      </span>
                      <span class="text-xl my-0.5">{theme().back.postageEmoji}</span>
                      <span class="text-[7px] font-mono opacity-80 font-bold">
                        {theme().back.postagePrice}
                      </span>
                    </div>
                  }
                >
                  <div class="relative w-14 h-16 bg-amber-50 rounded-sm flex flex-col items-center justify-center p-1 shadow-sm border border-amber-900/10 select-none">
                    <div class="absolute top-[-3px] left-0 right-0 flex justify-around pointer-events-none">
                      <div class="w-1.5 h-1.5 rounded-full bg-white border border-amber-800/10" />
                      <div class="w-1.5 h-1.5 rounded-full bg-white border border-amber-800/10" />
                      <div class="w-1.5 h-1.5 rounded-full bg-white border border-amber-800/10" />
                      <div class="w-1.5 h-1.5 rounded-full bg-white border border-amber-800/10" />
                    </div>
                    <div class="absolute bottom-[-3px] left-0 right-0 flex justify-around pointer-events-none">
                      <div class="w-1.5 h-1.5 rounded-full bg-white border border-amber-800/10" />
                      <div class="w-1.5 h-1.5 rounded-full bg-white border border-amber-800/10" />
                      <div class="w-1.5 h-1.5 rounded-full bg-white border border-amber-800/10" />
                      <div class="w-1.5 h-1.5 rounded-full bg-white border border-amber-800/10" />
                    </div>
                    <div class="absolute left-[-3px] top-0 bottom-0 flex flex-col justify-around pointer-events-none">
                      <div class="w-1.5 h-1.5 rounded-full bg-white border border-amber-800/10" />
                      <div class="w-1.5 h-1.5 rounded-full bg-white border border-amber-800/10" />
                      <div class="w-1.5 h-1.5 rounded-full bg-white border border-amber-800/10" />
                      <div class="w-1.5 h-1.5 rounded-full bg-white border border-amber-800/10" />
                    </div>
                    <div class="absolute right-[-3px] top-0 bottom-0 flex flex-col justify-around pointer-events-none">
                      <div class="w-1.5 h-1.5 rounded-full bg-white border border-amber-800/10" />
                      <div class="w-1.5 h-1.5 rounded-full bg-white border border-amber-800/10" />
                      <div class="w-1.5 h-1.5 rounded-full bg-white border border-amber-800/10" />
                      <div class="w-1.5 h-1.5 rounded-full bg-white border border-amber-800/10" />
                    </div>
                    <span class="text-xl my-0.5 leading-none">✈️</span>
                    <span class="text-[8px] font-sans font-extrabold uppercase tracking-wider text-amber-950 mt-1">
                      TRAVEL
                    </span>
                  </div>
                </Show>
              }
            >
              <div class="w-14 h-16 rounded overflow-hidden shadow-sm border border-stone-200/60 flex-shrink-0">
                <img src={props.imageUrl} alt="Photo" class="w-full h-full object-cover" />
              </div>
            </Show>
          </div>

          {isTravel() ? (
            <div class="space-y-4 mb-2 text-amber-950 font-serif">
              <div class="border-b border-amber-800/30 pb-0.5 min-h-[28px] flex items-end">
                <span class="text-xs font-bold mr-2 text-amber-900/60 select-none">To:</span>
                <span class={`${theme().back.addressStyleClass} flex-1 pb-0.5`}>
                  {props.recipient || theme().back.placeholderRecipient}
                </span>
              </div>
              <div class="border-b border-amber-800/30 pb-0.5 min-h-[28px] flex items-end justify-between">
                <span class={`${theme().back.addressStyleClass} flex-1 pb-0.5`}>
                  {props.address || theme().back.placeholderAddress}
                </span>
                <MapPin class="w-3 h-3 text-amber-800/40 shrink-0 mb-0.5" />
              </div>
            </div>
          ) : (
            <div class="space-y-4 mb-2">
              <div class="border-b border-stone-300 pb-0.5 min-h-[28px]">
                <span class="text-[8px] font-mono opacity-50 block">TO</span>
                <span class={theme().back.addressStyleClass}>
                  {props.recipient || theme().back.placeholderRecipient}
                </span>
              </div>
              <div class="border-b border-stone-300 pb-0.5 min-h-[28px] flex items-center justify-between">
                <div class="flex-1">
                  <span class="text-[8px] font-mono opacity-50 block">ADDRESS</span>
                  <span class={theme().back.addressStyleClass}>
                    {props.address || theme().back.placeholderAddress}
                  </span>
                </div>
                <MapPin class="w-3 h-3 opacity-40 shrink-0" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const Postcard: Component = () => {
  const [isFlipped, setIsFlipped] = createSignal(false);
  const [title, setTitle] = createSignal('');
  const [message, setMessage] = createSignal('');
  const [recipient, setRecipient] = createSignal('');
  const [address, setAddress] = createSignal('');
  const [frontImageUrl, setFrontImageUrl] = createSignal('');
  const [backImageUrl, setBackImageUrl] = createSignal('');
  const [variant, setVariant] = createSignal<PostcardVariant>('modern');

  const handleFlip = () => setIsFlipped((prev) => !prev);
  const handleVariantChange = (v: PostcardVariant) => setVariant(v);
  const currentTheme = () => THEMES[variant()];

  return (
    <div class="w-full max-w-4xl mx-auto flex flex-col lg:flex-row gap-8 items-stretch p-4">
      {/* 1. Postcard Preview */}
      <div class="flex-1 flex flex-col items-center justify-center min-h-[380px]">
        <div
          class="relative w-full max-w-[500px] h-[300px] cursor-pointer"
          style={{ perspective: '1200px' }}
          onClick={handleFlip}
          aria-label="Click to flip postcard"
        >
          <div
            class="relative w-full h-full transition-transform duration-700 ease-out"
            style={{
              'transform-style': 'preserve-3d',
              transform: isFlipped() ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            <PostcardFront
              title={title()}
              variant={variant()}
              imageUrl={frontImageUrl() || undefined}
            />
            <PostcardBack
              message={message()}
              recipient={recipient()}
              address={address()}
              variant={variant()}
              imageUrl={backImageUrl() || undefined}
            />
          </div>
        </div>

        <div class="flex items-center gap-4 mt-6">
          <button
            onClick={handleFlip}
            class="flex items-center gap-2 px-5 py-2.5 bg-stone-800 text-white hover:bg-stone-700 active:scale-95 transition-all rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl cursor-pointer"
          >
            <span>Flip Postcard</span>
            <span>🔄</span>
          </button>
        </div>
      </div>

      {/* 2. Customizer Panel */}
      <div class="w-full lg:w-96 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-md flex flex-col gap-5">
        <h3 class="text-lg font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2 pb-2 border-b border-stone-100 dark:border-stone-800">
          <span>📮</span>
          <span>Customize Postcard</span>
        </h3>

        <div>
          <label class="block text-[10px] font-mono font-bold text-stone-500 uppercase mb-2 tracking-wider">
            Style Variant
          </label>
          <div class="grid grid-cols-5 gap-1.5">
            {(['modern', 'antique', 'starry', 'plain', 'travel'] as const).map((v) => (
              <button
                onClick={() => handleVariantChange(v)}
                class={`py-2 px-1 rounded-xl border text-[10px] font-mono font-bold capitalize transition-all cursor-pointer ${
                  variant() === v
                    ? 'border-rose-500 bg-rose-500/10 text-rose-500 shadow-sm'
                    : 'border-stone-200 dark:border-stone-800 bg-transparent text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                }`}
              >
                {THEMES[v].name}
              </button>
            ))}
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-[10px] font-mono font-bold text-stone-500 uppercase mb-1.5 tracking-wider">
              Front Photo URL <span class="normal-case opacity-60">(optional)</span>
            </label>
            <input
              type="text"
              value={frontImageUrl()}
              onInput={(e) => setFrontImageUrl(e.currentTarget.value)}
              placeholder="https://..."
              class="w-full px-3.5 py-2 border border-stone-200 dark:border-stone-800 rounded-xl text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 dark:text-white transition-all"
            />
            <p class="text-[9px] text-stone-400 mt-1 font-mono">
              {variant() === 'travel'
                ? 'Replaces the illustration panel'
                : 'Full bleed background with overlay'}
            </p>
          </div>

          <div>
            <label class="block text-[10px] font-mono font-bold text-stone-500 uppercase mb-1.5 tracking-wider">
              Back Photo URL <span class="normal-case opacity-60">(optional)</span>
            </label>
            <input
              type="text"
              value={backImageUrl()}
              onInput={(e) => setBackImageUrl(e.currentTarget.value)}
              placeholder="https://..."
              class="w-full px-3.5 py-2 border border-stone-200 dark:border-stone-800 rounded-xl text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 dark:text-white transition-all"
            />
            <p class="text-[9px] text-stone-400 mt-1 font-mono">Replaces the stamp box</p>
          </div>

          <div>
            <label class="block text-[10px] font-mono font-bold text-stone-500 uppercase mb-1.5 tracking-wider">
              Front Cover Title
            </label>
            <input
              type="text"
              value={title()}
              onInput={(e) => setTitle(e.currentTarget.value)}
              placeholder={currentTheme().front.placeholderTitle}
              class="w-full px-3.5 py-2 border border-stone-200 dark:border-stone-800 rounded-xl text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 dark:text-white transition-all"
            />
          </div>

          <div>
            <label class="block text-[10px] font-mono font-bold text-stone-500 uppercase mb-1.5 tracking-wider">
              Message
            </label>
            <textarea
              value={message()}
              onInput={(e) => setMessage(e.currentTarget.value)}
              placeholder={currentTheme().back.placeholderMessage}
              rows={4}
              class="w-full px-3.5 py-2 border border-stone-200 dark:border-stone-800 rounded-xl text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 dark:text-white transition-all resize-none leading-relaxed"
            />
          </div>

          <div>
            <label class="block text-[10px] font-mono font-bold text-stone-500 uppercase mb-1.5 tracking-wider">
              Recipient Name
            </label>
            <input
              type="text"
              value={recipient()}
              onInput={(e) => setRecipient(e.currentTarget.value)}
              placeholder="Name"
              class="w-full px-3.5 py-2 border border-stone-200 dark:border-stone-800 rounded-xl text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 dark:text-white transition-all"
            />
          </div>

          <div>
            <label class="block text-[10px] font-mono font-bold text-stone-500 uppercase mb-1.5 tracking-wider">
              Recipient Address
            </label>
            <input
              type="text"
              value={address()}
              onInput={(e) => setAddress(e.currentTarget.value)}
              placeholder="Street & City"
              class="w-full px-3.5 py-2 border border-stone-200 dark:border-stone-800 rounded-xl text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 dark:text-white transition-all"
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
  imageUrl?: string;
};

type PostcardBackProps = {
  message: string;
  recipient: string;
  address: string;
  variant: PostcardVariant;
  imageUrl?: string;
};
