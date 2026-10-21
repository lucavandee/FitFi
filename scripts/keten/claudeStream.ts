/**
 * `claude -p` starten voor het keuren, met stream-uitvoer. Dezelfde aanroep als
 * de kalibratie tot nu toe (bouwClaudeArgs in tagCli.ts: geen tools, de
 * stijl-agent als aanvulling op de systeemprompt), met twee verschillen:
 *  - --effort, zodat het denkniveau vastligt en niet van een standaard afhangt;
 *  - stream-json in plaats van json: de init-regel zegt welk model er echt
 *    draait en hoe er betaald wordt (src/keten/stijl/claudeUitvoer.ts).
 * De kalibratie (stijl-keur.ts) en de nacht (stijl-sets.ts) gebruiken allebei
 * deze aanroep, zodat de kalibratie de nacht meet.
 */
import { execFile } from "node:child_process";
import { leesStream, naarUitkomst, type AanroepUitkomst } from "../../src/keten/stijl/claudeUitvoer";

export function bouwKeurArgs(o: { model: string; effort?: string | null; systeem: string; opdracht: string }): string[] {
  const args = ["-p", "--model", o.model];
  if (o.effort) args.push("--effort", o.effort);
  args.push("--allowed-tools", "", "--append-system-prompt", o.systeem, "--output-format", "stream-json", "--verbose", o.opdracht);
  return args;
}

/**
 * De omgeving voor de aanroep. Met een sleutel betaalt de API-sleutel; zonder
 * gaat ANTHROPIC_API_KEY er juist uit, zodat een vergeten variabele in de shell
 * niet stilletjes de rekening verlegt. De init-regel controleert het daarna.
 */
export function omgevingVoor(via: "abonnement" | "sleutel", sleutel: string | null, basis: NodeJS.ProcessEnv = process.env): NodeJS.ProcessEnv {
  const env = { ...basis };
  delete env.ANTHROPIC_API_KEY;
  if (via === "sleutel") {
    if (!sleutel) throw new Error("via sleutel zonder sleutel");
    env.ANTHROPIC_API_KEY = sleutel;
  }
  return env;
}

/**
 * Start claude en geeft altijd een uitkomst terug, ook bij een fout. execFile
 * zonder shell: de opdracht gaat letterlijk door. stdin gaat direct dicht, anders
 * wacht claude -p op invoer (zie STDIN-FIX in tagCli.ts). Bij een time-out of
 * een onderbreking stuurt execFile een SIGTERM naar claude.
 */
export function roepClaudeAan(args: string[], o: { timeoutMs: number; signal?: AbortSignal; env?: NodeJS.ProcessEnv }): Promise<AanroepUitkomst> {
  return new Promise((resolve) => {
    const kind = execFile(
      "claude",
      args,
      { timeout: o.timeoutMs, maxBuffer: 50 * 1024 * 1024, signal: o.signal, env: o.env ?? process.env },
      (fout, stdout, stderr) => {
        const e = fout as (NodeJS.ErrnoException & { killed?: boolean; signal?: string }) | null;
        const onderbroken = Boolean(o.signal?.aborted);
        const timeout = !onderbroken && Boolean(e && (e.killed || e.signal === "SIGTERM"));
        // e.message bevat de hele commandoregel met de systeemprompt: niet gebruiken.
        const extra = String(stderr ?? "").trim() || (e && !timeout && !onderbroken && e.code !== undefined ? `exitcode ${e.code}` : "");
        resolve(
          naarUitkomst(leesStream(String(stdout ?? "")), { stderr: extra, timeout, onderbroken, exitFout: Boolean(e), timeoutMs: o.timeoutMs })
        );
      }
    );
    kind.stdin?.end();
  });
}
