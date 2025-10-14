export async function* mockNovaStream() {
  // start
  yield { type: "FITFI_JSON", phase: "start", ts: Date.now() };
  await new Promise(r => setTimeout(r, 350));
  // patch
  yield {
    type: "FITFI_JSON",
    phase: "patch",
    ts: Date.now(),
    data: {
      stage: "explainability",
      explanation: "Slank silhouet door tapered broek; koele blauwtinten sluiten aan op je huidondertoon."
    }
  };
  await new Promise(r => setTimeout(r, 200));
  // done
  yield { type: "FITFI_JSON", phase: "done", ts: Date.now(), data: { ok: true } };
}