import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

export default function Portal({ children }: { children: React.ReactNode }) {
  const elRef = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);

  if (!elRef.current && typeof document !== "undefined") {
    elRef.current = document.createElement("div");
    elRef.current.setAttribute("id", "nv-portal");
  }

  useEffect(() => {
    if (!elRef.current || typeof document === "undefined") return;
    document.body.appendChild(elRef.current);
    setMounted(true);
    return () => {
      if (elRef.current?.parentElement) {
        elRef.current.parentElement.removeChild(elRef.current);
      }
    };
  }, []);

  if (!mounted || !elRef.current) return null;
  return ReactDOM.createPortal(children, elRef.current);
}