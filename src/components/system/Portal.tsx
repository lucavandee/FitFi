import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type Props = { children: React.ReactNode; id?: string };

export default function Portal({ children, id = "fitfi-portal" }: Props) {
  const elRef = useRef<HTMLDivElement | null>(null);
  if (!elRef.current) {
    elRef.current = document.createElement("div");
    elRef.current.setAttribute("id", id);
    elRef.current.style.position = "relative";
    elRef.current.style.zIndex = "2147483647"; // hoogste laag
  }

  useEffect(() => {
    const el = elRef.current!;
    document.body.appendChild(el);
    return () => {
      try { document.body.removeChild(el); } catch {}
    };
  }, []);

  return createPortal(children, elRef.current!);
}