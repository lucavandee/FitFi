import React, { useEffect, useRef, PropsWithChildren } from "react";

const KEY = "__FITFI_HEADER_MOUNTED_V2__";
declare global {
  interface Window {
    [key: string]: any;
  }
}

export default function HeaderGuard({ children }: PropsWithChildren) {
  const claimed = useRef(false);

  useEffect(() => {
    if (window[KEY]) return;
    window[KEY] = true;
    claimed.current = true;
    return () => {
      if (claimed.current) window[KEY] = false;
    };
  }, []);

  if (typeof window !== "undefined" && window[KEY] && !claimed.current)
    return null;
  return <>{children}</>;
}

if (import.meta && (import.meta as any).hot) {
  (import.meta as any).hot.accept(() => {
    try {
      window[KEY] = false;
    } catch {}
  });
}
