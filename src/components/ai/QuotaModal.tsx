import { Fragment } from "react";

type Props = {
  open?: boolean;
  onClose?: () => void;
  title?: string;
  message?: string;
  ctaLabel?: string;
  onUpgrade?: () => void;
  remaining?: number; // resterende acties
  limit?: number;     // limiet
};

export default function QuotaModal({
  open = false,
  onClose,
  title = "Je limiet is bereikt",
  message = "Je hebt de toeslagvrije limiet voor Nova bereikt. Upgrade om verder te gaan.",
  ctaLabel = "Upgrade",
  onUpgrade,
  remaining,
  limit,
}: Props) {
  if (!open) return null;

  return (
    <Fragment>
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quota-title"
        className="fixed inset-0 z-50 grid place-items-center p-4"
      >
        <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-black/5 dark:bg-zinc-900">
          <div className="mb-3">
            <h2 id="quota-title" className="text-lg font-semibold">
              {title}
            </h2>
            <p className="mt-1 text-sm opacity-80">{message}</p>
            {(typeof remaining === "number" || typeof limit === "number") && (
              <p className="mt-2 text-xs opacity-60">
                {typeof remaining === "number" && `Resterend: ${remaining}`}{" "}
                {typeof limit === "number" && `(limiet: ${limit})`}
              </p>
            )}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              className="inline-flex flex-1 items-center justify-center rounded-xl border px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5"
              onClick={onClose}
            >
              Sluiten
            </button>
            <button
              type="button"
              className="inline-flex flex-1 items-center justify-center rounded-xl bg-black px-3 py-2 text-sm text-white hover:opacity-90 dark:bg-white dark:text-black"
              onClick={onUpgrade ?? onClose}
            >
              {ctaLabel}
            </button>
          </div>
        </div>
      </div>
    </Fragment>
  );
}