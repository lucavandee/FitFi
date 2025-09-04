import { memo } from "react";
import clsx from "clsx";

type Props = {
  status: "ok" | "warn" | "error";
  label?: string;
  className?: string;
};

function StatusBadge({ status, label, className }: Props) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={clsx(
        "inline-flex items-center gap-2 rounded-2xl px-3 py-1 text-sm font-medium",
        "border",
        status === "ok" && "border-green-200 bg-green-50 text-green-700",
        status === "warn" && "border-amber-200 bg-amber-50 text-amber-700",
        status === "error" && "border-red-200 bg-red-50 text-red-700",
        className
      )}
    >
      <span
        className={clsx(
          "h-2 w-2 rounded-full",
          status === "ok" && "bg-green-500",
          status === "warn" && "bg-amber-500",
          status === "error" && "bg-red-500"
        )}
        aria-hidden="true"
      />
      {label ?? (status === "ok" ? "OK" : status === "warn" ? "Let op" : "Fout")}
    </span>
  );
}

export default memo(StatusBadge);