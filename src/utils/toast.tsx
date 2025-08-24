import { toast } from "react-hot-toast";
import React from "react";

export function toastSaved(onUndo?: () => void) {
  if (!onUndo) return toast.success("Opgeslagen in favorieten ✓");
  return toast.custom((t) => (
    <div className="rounded-xl bg-white shadow-lg ring-1 ring-black/5 px-4 py-3 text-slate-900 flex items-center gap-3">
      <span>Opgeslagen in favorieten ✓</span>
      <button
        onClick={() => {
          try {
            onUndo?.();
          } finally {
            toast.dismiss(t.id);
          }
        }}
        className="ml-2 text-sm font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg px-3 py-1.5"
      >
        Ongedaan maken
      </button>
    </div>
  ));
}

export function toastRemoved(onUndo?: () => void) {
  if (!onUndo) return toast("Verwijderd uit favorieten", { icon: "🗑️" });
  return toast.custom((t) => (
    <div className="rounded-xl bg-white shadow-lg ring-1 ring-black/5 px-4 py-3 text-slate-900 flex items-center gap-3">
      <span>Verwijderd uit favorieten</span>
      <button
        onClick={() => {
          try {
            onUndo?.();
          } finally {
            toast.dismiss(t.id);
          }
        }}
        className="ml-2 text-sm font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg px-3 py-1.5"
      >
        Ongedaan maken
      </button>
    </div>
  ));
}
