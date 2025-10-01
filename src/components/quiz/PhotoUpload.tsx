import React from "react";

type Props = { value?: string | null; onChange: (dataUrl: string | null) => void };

export default function PhotoUpload({ value, onChange }: Props) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  function pickFile() { inputRef.current?.click(); }
  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = () => onChange((reader.result as string) || null);
    reader.readAsDataURL(f);
  }

  return (
    <div
      className={[
        "rounded-[var(--radius-2xl)] border border-[var(--color-border)]",
        "bg-[var(--color-surface)] shadow-[var(--shadow-soft)]",
        "pt-7 pb-6 px-5 sm:px-6",
      ].join(" ")}
    >
      <h2 className="text-lg font-semibold">Foto (optioneel)</h2>
      <p className="mt-1 text-sm text-[var(--color-text)]/70">
        Upload een duidelijke foto (goed licht, geen filter). We verwerken de foto alleen lokaal.
      </p>
      <div className="mt-4 flex items-center gap-4">
        <button
          type="button"
          className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2 text-sm hover:border-[var(--color-primary)]"
          onClick={pickFile}
        >
          Kies een foto
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
        {value ? <span className="text-sm opacity-80">Foto geselecteerd ✓</span> : <span className="text-sm opacity-60">Nog geen foto</span>}
      </div>
      {value ? (
        <div className="mt-4">
          <img src={value} alt="Voorbeeld van geüploade foto" className="max-h-56 rounded-[var(--radius-xl)] border border-[var(--color-border)]" />
        </div>
      ) : null}
    </div>
  );
}