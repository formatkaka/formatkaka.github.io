import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';

type ThemePreference = 'light' | 'dark' | 'system';

const THEME_STORAGE_KEY = 'yel-lms-theme';

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Monitor },
] as const;

function getSystemPreference() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(preference: ThemePreference) {
  const isDark = preference === 'dark'
    || (preference === 'system' && getSystemPreference());
  const appRoot = document.querySelector<HTMLElement>('[data-yel-lms-root]');

  appRoot?.classList.toggle('dark', isDark);
  if (appRoot) appRoot.style.colorScheme = isDark ? 'dark' : 'light';
}

function readSavedPreference(): ThemePreference {
  try {
    const savedPreference = window.localStorage.getItem(THEME_STORAGE_KEY);
    return savedPreference === 'light' || savedPreference === 'dark' ? savedPreference : 'system';
  } catch {
    return 'system';
  }
}

function savePreference(preference: ThemePreference) {
  try {
    if (preference === 'system') {
      window.localStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      window.localStorage.setItem(THEME_STORAGE_KEY, preference);
    }
  } catch {
    // Theme still applies for the current visit when storage is unavailable.
  }
}

export function ThemeSelector() {
  const [preference, setPreference] = useState<ThemePreference>('system');

  useEffect(() => {
    const initialPreference = readSavedPreference();

    setPreference(initialPreference);
    applyTheme(initialPreference);

    if (typeof window.matchMedia !== 'function') return undefined;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (readSavedPreference() === 'system') applyTheme('system');
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    }

    mediaQuery.addListener(handleSystemThemeChange);
    return () => mediaQuery.removeListener(handleSystemThemeChange);
  }, []);

  const handleChange = (nextPreference: ThemePreference) => {
    setPreference(nextPreference);
    applyTheme(nextPreference);
    savePreference(nextPreference);
  };

  return (
    <div
      aria-label="Color mode"
      className="inline-flex items-center gap-0.5 rounded-full border border-[#dbe1ee] bg-white/90 p-1 shadow-sm backdrop-blur-sm dark:border-[#343b4c] dark:bg-[#191d28]/90"
      role="group"
    >
      {THEME_OPTIONS.map(({ value, label, Icon }) => {
        const isSelected = preference === value;

        return (
          <button
            key={value}
            aria-label={`${label} mode`}
            aria-pressed={isSelected}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#386de0] ${
              isSelected
                ? 'bg-[#386de0] text-white shadow-sm'
                : 'text-[#606977] hover:bg-[#edf1f8] hover:text-[#252b35] dark:text-[#aeb6c5] dark:hover:bg-white/10 dark:hover:text-white'
            }`}
            onClick={() => handleChange(value)}
            title={`${label} mode`}
            type="button"
          >
            <Icon aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
          </button>
        );
      })}
    </div>
  );
}
