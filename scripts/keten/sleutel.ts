/**
 * De Anthropic API-sleutel voor FitFi-werk dat op de sleutel loopt in plaats
 * van op Lucs abonnement (vooraf keuren, kalibratie). Alleen uit een bestand
 * dat niemand anders kan lezen; de sleutel komt nooit in een log of rapport.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export const SLEUTEL_PAD = join(homedir(), ".config", "fitfi", "anthropic-api-key");

export function leesSleutel(pad: string = SLEUTEL_PAD): string {
  if (!existsSync(pad)) {
    throw new Error(`Geen sleutel in ${pad}. Maak er een op platform.claude.com en zet hem in dit bestand (chmod 600).`);
  }
  const rechten = statSync(pad).mode & 0o777;
  if (rechten & 0o077) {
    throw new Error(`${pad} is ook voor anderen leesbaar (${rechten.toString(8)}). Zet hem op chmod 600.`);
  }
  const sleutel = readFileSync(pad, "utf8").trim();
  if (!sleutel.startsWith("sk-ant-")) throw new Error(`${pad} bevat geen Anthropic-sleutel (begint niet met sk-ant-).`);
  return sleutel;
}
