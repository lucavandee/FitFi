import React from "react";

type Props = {
  query: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

const FaqSearch: React.FC<Props> = ({ query, onChange, placeholder = "Zoek in de FAQ…" }) => {
  return (
    <div className="w-full">
      <label htmlFor="faq-search" className="sr-only">Zoek vraag</label>
      <input
        id="faq-search"
        type="search"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="
          w-full rounded-[var(--radius-lg)]
          bg-[var(--color-surface)] border border-[var(--color-border)]
          px-4 py-3
          placeholder:opacity-60
          focus:outline-none focus:ring-2
          focus:ring-[color-mix(in_oklab,_var(--ff-color-primary-700)_50%,_transparent)]
          shadow-[var(--shadow-soft)]
        "
        aria-describedby="faq-search-hint"
      />
      <p id="faq-search-hint" className="mt-2 text-sm opacity-70">
        Tip: zoek op kernwoorden zoals <em>gratis</em>, <em>foto</em> of <em>privacy</em>.
      </p>
    </div>
  );
};

export default FaqSearch;