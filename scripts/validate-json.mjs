import { readFileSync } from "node:fs";

const files = [
  "public/data/bolt/tribe_challenges.json",
  "public/data/bolt/tribe_challenge_subs.json",
  "public/data/bolt/tribe_ranking.json"
];

let ok = true;

for (const f of files) {
  try {
    const raw = readFileSync(f, "utf8");
    const data = JSON.parse(raw);

    if (!Array.isArray(data)) {
      console.error(`FAIL ${f}: root is not an array`);
      ok = false; continue;
    }

    if (f.includes("challenges") && data.length) {
      const c = data[0];
      for (const k of ["id","tribeId","title","status"]) {
        if (!(k in c)) { console.error(`FAIL ${f}: missing key ${k} in first item`); ok = false; }
      }
    }

    if (f.includes("subs") && data.length) {
      const s = data[0];
      for (const k of ["id","tribeId","challengeId","userId","createdAt"]) {
        if (!(k in s)) { console.error(`FAIL ${f}: missing key ${k} in first item`); ok = false; }
      }
    }

    if (f.includes("ranking") && data.length) {
      const r = data[0];
      for (const k of ["tribeId","points"]) {
        if (!(k in r)) { console.error(`FAIL ${f}: missing key ${k} in first item`); ok = false; }
      }
    }

    console.log(`OK   ${f} (${data.length} items)`);
  } catch (e) {
    console.error(`FAIL ${f}: ${e.message}`);
    ok = false;
  }
}

if (!ok) {
  process.exit(1);
} else {
  console.log("All JSON files are valid ✅");
}