/** Minimale parser voor `--naam waarde`, `--naam=waarde` en losse `--vlag` argumenten. */
export function leesVlag(argv: string[], naam: string): string | undefined {
  const metIs = argv.find((a) => a.startsWith(`--${naam}=`));
  if (metIs !== undefined) return metIs.slice(naam.length + 3);
  const i = argv.indexOf(`--${naam}`);
  if (i === -1) return undefined;
  const waarde = argv[i + 1];
  if (waarde === undefined || waarde.startsWith("--")) return "";
  return waarde;
}

export function heeftVlag(argv: string[], naam: string): boolean {
  return argv.includes(`--${naam}`) || argv.some((a) => a.startsWith(`--${naam}=`));
}

/**
 * De vlaggen die het script niet kent. Een typfout (--max-aanroep) of een
 * onbekende vorm viel anders stil terug op de standaard, en bij de meetnacht is
 * dat het plafond van 72 aanroepen (review 21 oktober 2026).
 */
export function onbekendeVlaggen(argv: string[], toegestaan: string[]): string[] {
  return argv.filter((a) => a.startsWith("--")).filter((a) => !toegestaan.includes(a.slice(2).split("=")[0]));
}
