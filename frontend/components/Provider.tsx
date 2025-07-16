'use client'

import { useRef, useEffect } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore, saveState } from '@/lib/redux/store';

export function Providers({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  useEffect(() => {
    if (storeRef.current) {
      const unsubscribe = storeRef.current.subscribe(() => {
        saveState(storeRef.current!.getState());
      });
      return () => unsubscribe();
    }
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}