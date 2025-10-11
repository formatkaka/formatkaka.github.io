import { createContext, use } from "react";

// export const TabContext = createContext<TTabContext>();

export const RootContext = createContext<TRootContext | null>(null);

type TRootContext = {
  onClick: React.Dispatch<React.SetStateAction<number>>,
  index: number,
  id: string
}

export const useRootContext = () => {
  const value = use(RootContext);

  if(value === null){
    throw new Error("useRootContext should be wrapped with RootContext");
  }

  return value;
}

// type TTabContext = {
  // ind
// }
