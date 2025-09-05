// Dev-only stub: voorkomt crashes wanneer dit per ongeluk geïmporteerd/lazy-geladen wordt.
export default function ConsoleInspector() {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.info("[ConsoleInspector] stub actief (DEV).");
  }
  return null;
}