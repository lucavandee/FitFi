import { useEffect, useState } from "react";

type Props = {
  label: string;
  href?: string;
  onClick?: () => void;
  sublabel?: string;
  hideOn?: "none" | "xl-up";
};

export default function StickyCTA({
  label,
  href,
  onClick,
  sublabel,
  hideOn = "none",
}: Props) {
  const [visible, setVisible] = useState(true);

  // Verberg bij brede schermen indien gewenst
  const hideClass =
    hideOn === "xl-up" ? "xl:pointer-events-none xl:opacity-0" : "";

  // Minimal scroll-heuristiek: toon na 200px scroll
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY >= 200);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  const Btn = (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center rounded-2xl bg-black px-5 py-3 text-white shadow-lg hover:opacity-90 dark:bg-white dark:text-black"
    >
      {label}
    </button>
  );

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 ${hideClass}`}
      role="region"
      aria-label="Snelle actie"
    >
      <div className="mx-auto max-w-5xl px-4 pb-4">
        <div className="rounded-3xl border bg-white/80 p-4 shadow-xl backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/70">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{sublabel ?? "Boost je stijl met FitFi"}</p>
            </div>
            {href ? (
              <a
                href={href}
                className="inline-flex items-center justify-center rounded-2xl bg-black px-5 py-3 text-white shadow-lg hover:opacity-90 dark:bg-white dark:text-black"
              >
                {label}
              </a>
            ) : (
              Btn
            )}
          </div>
        </div>
      </div>
    </div>
  );
}