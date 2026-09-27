/** Minimale parser voor `--naam waarde` en losse `--vlag` argumenten. */
export function leesVlag(argv: string[], naam: string): string | undefined {
  const i = argv.indexOf(`--${naam}`);
  if (i === -1) return undefined;
  const waarde = argv[i + 1];
  if (waarde === undefined || waarde.startsWith("--")) return "";
  return waarde;
}

export function heeftVlag(argv: string[], naam: string): boolean {
  return argv.includes(`--${naam}`);
}
