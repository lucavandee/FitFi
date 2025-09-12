// Klein, idempotent boot-script (kan veilig meeliften in main.tsx)
declare global {
  interface Window {
    __fitfi_boot?: boolean;
  }
}

if (typeof window !== "undefined" && !window.__fitfi_boot) {
  window.__fitfi_boot = true;
  // Event stubs – integreer met je analytics layer indien gewenst
  // track("nova:boot");
}