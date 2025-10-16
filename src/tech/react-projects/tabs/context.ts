import { createContext, use, type KeyboardEvent } from 'react';

export const RootContext = createContext<TRootContext | null>(null);

export const TabContext = createContext<TTabContext | null>(null);

export const useRootContext = () => {
  const value = use(RootContext);

  if (value === null) {
    throw new Error('useRootContext should be wrapped with RootContext');
  }

  return value;
};

export const useTabContext = () => {
  const value = use(TabContext);

  if (value === null) {
    throw new Error('useTabContext should be wrapped with TabContext');
  }

  return value;
};

type TRootContext = {
  onClick: React.Dispatch<React.SetStateAction<number>>;
  index: number;
  id: string;
  panelData: {
    role: string;
    id: string;
    'aria-labelledby': string;
  };
};

type TTabContext = {
  key: string;
  id: string;
  role: string;
  'aria-setsize': number;
  'aria-posinset': number;
  'aria-selected': boolean;
  'aria-controls': string;
  // managing focussability
  tabIndex: number;
  onClick: () => void;
  onKeyDown: (evt: KeyboardEvent<HTMLDivElement>) => void;
  isActive: boolean;
};
