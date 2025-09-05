import React from "react";
export default function CookieBanner() {
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => { /* opt-in via CMP later */ }, []);
  if (!visible) return null;
  return (
    <div className="fixed bottom-4 inset-x-0 flex justify-center">
      <div className="ff-card max-w-xl">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm">We gebruiken cookies voor een betere ervaring.</p>
          <button className="px-3 py-1.5 rounded-xl bg-black/80 text-white text-sm" onClick={() => setVisible(false)}>Oké</button>
        </div>
      </div>
    </div>
  );
}