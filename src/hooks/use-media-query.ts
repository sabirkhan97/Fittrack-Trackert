import { useState, useEffect } from 'react';

type QueryMap = Record<string, boolean>;

export function useMediaQuery(query: string): boolean;
export function useMediaQuery(queries: string[]): QueryMap;
export function useMediaQuery(input: string | string[]): boolean | QueryMap {
  const [state, setState] = useState(() => {
    if (Array.isArray(input)) {
      const initial: QueryMap = {};
      input.forEach((q) => {
        initial[q] = typeof window !== 'undefined' && window.matchMedia(q).matches;
      });
      return initial;
    } else {
      return typeof window !== 'undefined' && window.matchMedia(input).matches;
    }
  });

 
  useEffect(() => {
    const mqlListeners: Array<() => void> = [];
    const mediaQueries = Array.isArray(input) ? input : [input];

    mediaQueries.forEach((query) => {
      const mql = window.matchMedia(query);
      const listener = () =>
        setState((prev) => {
          if (typeof prev === 'boolean') return mql.matches;
          return { ...prev, [query]: mql.matches };
        });

      // React < 18: use mql.addListener(listener)
      if ('addEventListener' in mql) {
        mql.addEventListener('change', listener);
      } else {
        (mql as any).addListener(listener);
      }

      mqlListeners.push(() => {
        if ('removeEventListener' in mql) {
          mql.removeEventListener('change', listener);
        } else {
          (mql as any).removeListener(listener);
        }
      });
    });

    // cleanup
    return () => {
      mqlListeners.forEach((off) => off());
    };
  }, [input]);

  return state;
}


