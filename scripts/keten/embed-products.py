#!/usr/bin/env python3
"""FashionCLIP-embeddings voor canonieke producten, rechtstreeks naar
product_attributes.embedding (spec 5.1). Hergebruikt het model, de download-
cache en de embed-functie uit scripts/visual-embeddings/embed_products.py.

Setup (eenmalig, zelfde venv als de visual-embeddings-scripts):
  python3 -m venv ~/.cache/fitfi-visual-venv
  ~/.cache/fitfi-visual-venv/bin/pip install torch transformers pillow requests

Gebruik:
  ~/.cache/fitfi-visual-venv/bin/python scripts/keten/embed-products.py --retailer "H&M (NL)" [--limit N]

--retailer is verplicht en moet de letterlijke waarde uit products.retailer
zijn (dezelfde als STANDAARD_RETAILER in scripts/keten/retailers.ts). Een
onbekende naam geeft een fout uit de database, geen lege run.

Omgeving: SUPABASE_URL (of VITE_SUPABASE_URL) en SUPABASE_SERVICE_ROLE_KEY,
uit het proces of de repo-root .env. Waarden worden nooit gelogd.
Idempotent: de RPC geeft alleen rijen zonder embedding terug.
"""
import argparse
import io
import os
import re
import sys
from pathlib import Path

import requests

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
sys.path.insert(0, str(HERE.parent / "visual-embeddings"))
from embed_products import BATCH, download, embed_afbeeldingen, laad_model  # noqa: E402

PAGINA = 500
SCHRIJF_CHUNK = 64


def _ontleed_waarde(sleutel: str, rest: str) -> str:
    """Spiegelt ontleedWaarde() in scripts/keten/env.ts.

    Een waarde tussen aanhalingstekens loopt tot het sluitende teken; daarna
    mag alleen witruimte of een toelichting staan. Zonder aanhalingstekens
    wordt een toelichting achter de waarde afgekapt. Dat laatste is de reden
    dat deze functie bestaat: de oude regex trok "# toelichting" mee in de
    waarde, en omdat waarden nooit gelogd worden was het gevolg een client
    die niet verbindt zonder enig spoor.
    """
    if rest[:1] in ('"', "'"):
        opent = rest[0]
        sluit = rest.find(opent, 1)
        if sluit == -1:
            raise ValueError(f"Ongeldige .env-regel voor {sleutel}: opent met {opent} maar sluit niet af")
        na = rest[sluit + 1:]
        if na.strip() and not na.lstrip().startswith("#"):
            raise ValueError(f"Ongeldige .env-regel voor {sleutel}: onverwachte tekst na de sluitende {opent}")
        return rest[1:sluit]
    return re.sub(r"\s+#.*$", "", rest).strip()


def lees_dotenv() -> "dict[str, str]":
    """Leest de repo-root .env. Regeleinden: een CRLF-bestand laat anders een
    \r achter aan het eind van elke waarde."""
    pad = ROOT / ".env"
    if not pad.exists():
        return {}
    uit = {}
    for ruwe_regel in pad.read_text().split("\n"):
        regel = ruwe_regel.rstrip("\r")
        m = re.match(r"^\s*([A-Z0-9_]+)\s*=\s*(.*)$", regel)
        if m:
            uit[m.group(1)] = _ontleed_waarde(m.group(1), m.group(2))
    return uit


def lees_env() -> "tuple[str, str]":
    bron = {**lees_dotenv(), **os.environ}
    url = bron.get("SUPABASE_URL") or bron.get("VITE_SUPABASE_URL")
    key = bron.get("SUPABASE_SERVICE_ROLE_KEY")
    ontbreekt = [n for n, w in (("SUPABASE_URL", url), ("SUPABASE_SERVICE_ROLE_KEY", key)) if not w]
    if ontbreekt:
        print(f"Ontbrekende omgevingsvariabelen: {', '.join(ontbreekt)}", file=sys.stderr)
        sys.exit(1)
    return url.rstrip("/"), key


def vector_naar_pg(vec) -> str:
    """pgvector leest de tekstvorm '[f1,f2,...]'."""
    return "[" + ",".join(f"{x:.6f}" for x in vec) + "]"


def verdeel(items, n):
    return [items[i : i + n] for i in range(0, len(items), n)]


class Supabase:
    def __init__(self, url: str, key: str) -> None:
        self.url = url
        self.headers = {
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
        }

    def rpc(self, naam: str, body: dict):
        r = requests.post(f"{self.url}/rest/v1/rpc/{naam}", json=body, headers=self.headers, timeout=60)
        if not r.ok:
            raise RuntimeError(f"{naam} gaf {r.status_code}: {r.text[:300]}")
        return r.json()


def haal_kandidaten(sb: Supabase, retailer: str, limiet: int) -> "list[dict]":
    alles: "list[dict]" = []
    after = None
    while True:
        pagina = sb.rpc("keten_embed_kandidaten", {"p_retailer": retailer, "p_limit": PAGINA, "p_after": after})
        alles.extend(pagina)
        if len(pagina) < PAGINA or (limiet and len(alles) >= limiet):
            break
        after = pagina[-1]["product_id"]
    return alles[:limiet] if limiet else alles


def schrijf(sb: Supabase, rijen: "list[dict]") -> int:
    if not rijen:
        return 0
    return int(sb.rpc("keten_schrijf_embeddings", {"p_rijen": rijen}))


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--retailer", required=True, help="letterlijke waarde uit products.retailer")
    ap.add_argument("--limit", type=int, default=0, help="alleen eerste N producten")
    args = ap.parse_args()

    url, key = lees_env()
    sb = Supabase(url, key)

    producten = haal_kandidaten(sb, args.retailer, args.limit)
    print(f"{len(producten)} canonieke producten zonder embedding voor {args.retailer!r}")
    if not producten:
        return

    from PIL import Image

    model, processor, device = laad_model()

    batch_imgs: list = []
    batch_ids: "list[str]" = []
    wachtrij: "list[dict]" = []
    geschreven = 0
    overgeslagen = 0

    def flush() -> None:
        nonlocal geschreven
        if not batch_imgs:
            return
        for pid, vec in zip(batch_ids, embed_afbeeldingen(model, processor, device, batch_imgs)):
            wachtrij.append({"product_id": pid, "embedding": vector_naar_pg(vec)})
        batch_imgs.clear()
        batch_ids.clear()
        if len(wachtrij) >= SCHRIJF_CHUNK:
            geschreven += schrijf(sb, wachtrij)
            wachtrij.clear()
            print(f"  {geschreven}/{len(producten)} geschreven")

    for p in producten:
        raw = download(p["image_url"])
        if raw is None:
            overgeslagen += 1
            continue
        try:
            img = Image.open(io.BytesIO(raw)).convert("RGB")
        except Exception as e:
            print(f"  onleesbare afbeelding ({e}): {p['product_id']}", file=sys.stderr)
            overgeslagen += 1
            continue
        batch_imgs.append(img)
        batch_ids.append(p["product_id"])
        if len(batch_imgs) >= BATCH:
            flush()

    flush()
    geschreven += schrijf(sb, wachtrij)
    print(f"Klaar: {geschreven} embeddings geschreven, {overgeslagen} overgeslagen (geen of onleesbare afbeelding)")


if __name__ == "__main__":
    main()
