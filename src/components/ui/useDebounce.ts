"use client";

import { useCallback, useEffect, useRef } from "react";

// import { useEffect, useState } from 'react';

// export function useDebounce<T>(value: T, delay: number): T {
//     const [debouncedValue, setDebouncedValue] = useState<T>(value);

//     useEffect(() => {
//         const handler = setTimeout(() => {
//             setDebouncedValue(value);
//         }, delay);

//         return () => clearTimeout(handler);
//     }, [value, delay]);

//     return debouncedValue;
// }

// export function useDebounce<T extends (...args: any[]) => void>(){
//     const timeoutRef = useRef<NodeJS.Timeout | null>(null);

//     const debounce = (func: T, delay: number) => {
//         return (...args: Parameters<T>) => {
//             if (timeoutRef.current) {
//                 clearTimeout(timeoutRef.current);
//             }
//             timeoutRef.current = setTimeout(() => {
//                 func(...args);
//             }, delay);
//         };
//     };
// }

export function useDebounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const funcRef = useRef(func);

  useEffect(() => {
    funcRef.current = func;
  }, [func]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        funcRef.current(...args);
      }, delay);
    },
    [delay],
  );
}
