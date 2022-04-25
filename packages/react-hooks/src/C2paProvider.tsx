/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import React, { createContext, useEffect, ReactNode, useRef } from 'react';
import { createC2pa, C2paConfig, ManifestResolvers, C2pa } from 'c2pa';

export interface C2paProviderProps<T extends ManifestResolvers> {
  config: C2paConfig<T>;
  children: ReactNode;
}

export type C2paContextValue = Promise<C2pa> | null;

export const C2paContext = createContext<C2paContextValue>(null);

export function C2paProvider<T extends ManifestResolvers>({
  config,
  children,
}: C2paProviderProps<T>) {
  const c2paRef = useRef(createC2pa(config));

  useEffect(() => {
    return () => {
      async function cleanup() {
        (await c2paRef.current).dispose();
      }

      cleanup();
    };
  }, []);

  return (
    <C2paContext.Provider value={c2paRef.current}>
      {children}
    </C2paContext.Provider>
  );
}
