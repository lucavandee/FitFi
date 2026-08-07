#!/usr/bin/env python3
"""FashionCLIP-embeddings voor de FitFi-catalogus.

Leest out/catalog-images.json (van fetch-catalog.mjs), downloadt de
productafbeeldingen (met cache) en schrijft out/product-embeddings.json:
{"<product_id>": [512 floats, L2-genormaliseerd], ...}

Setup (eenmalig):
  python3 -m venv ~/.cache/fitfi-visual-venv
  ~/.cache/fitfi-visual-venv/bin/pip install torch transformers pillow requests

Gebruik:
  ~/.cache/fitfi-visual-venv/bin/python scripts/visual-embeddings/embed_products.py [--limit N] [--input pad.json]
"""
import argparse
import hashlib
import io
import json
import sys
from pathlib import Path

import requests

HERE = Path(__file__).parent
OUT = HERE / "out"
CACHE = OUT / "image-cache"
MODEL = "patrickjohncyh/fashion-clip"
BATCH = 16


def download(url: str) -> "bytes | None":
    CACHE.mkdir(parents=True, exist_ok=True)
    cached = CACHE / hashlib.sha1(url.encode()).hexdigest()
    if cached.exists():
        return cached.read_bytes()
    try:
        r = requests.get(url, timeout=20, headers={"User-Agent": "fitfi-embed/1.0"})
        r.raise_for_status()
        cached.write_bytes(r.content)
        return r.content
    except Exception as e:
        print(f"  download mislukt ({e}): {url[:80]}", file=sys.stderr)
        return None


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", default=str(OUT / "catalog-images.json"))
    ap.add_argument("--output", default=str(OUT / "product-embeddings.json"))
    ap.add_argument("--limit", type=int, default=0, help="alleen eerste N producten")
    args = ap.parse_args()

    products = json.loads(Path(args.input).read_text())
    if args.limit:
        products = products[: args.limit]
    print(f"{len(products)} producten te embedden (model: {MODEL})")

    import torch
    from PIL import Image
    from transformers import CLIPModel, CLIPProcessor

    device = "mps" if torch.backends.mps.is_available() else "cpu"
    model = CLIPModel.from_pretrained(MODEL).to(device)
    model.train(False)  # inferentie-modus, geen gradients nodig
    processor = CLIPProcessor.from_pretrained(MODEL)

    embeddings: "dict[str, list[float]]" = {}
    existing = Path(args.output)
    if existing.exists():
        embeddings = json.loads(existing.read_text())
        print(f"{len(embeddings)} bestaande embeddings hergebruikt")

    batch_imgs: list = []
    batch_ids: "list[str]" = []

    def flush() -> None:
        if not batch_imgs:
            return
        inputs = processor(images=batch_imgs, return_tensors="pt").to(device)
        with torch.no_grad():
            out = model.get_image_features(**inputs)
        # transformers <5 geeft een tensor, v5 een output-object
        if torch.is_tensor(out):
            feats = out
        elif hasattr(out, "image_embeds"):
            feats = out.image_embeds
        else:
            feats = out.pooler_output
        feats = feats / feats.norm(dim=-1, keepdim=True)
        for pid, vec in zip(batch_ids, feats.cpu().tolist()):
            embeddings[pid] = [round(x, 6) for x in vec]
        batch_imgs.clear()
        batch_ids.clear()

    done = 0
    for p in products:
        pid = str(p["id"])
        if pid in embeddings:
            done += 1
            continue
        raw = download(p["image_url"])
        if raw is None:
            continue
        try:
            img = Image.open(io.BytesIO(raw)).convert("RGB")
        except Exception as e:
            print(f"  onleesbare afbeelding ({e}): {pid}", file=sys.stderr)
            continue
        batch_imgs.append(img)
        batch_ids.append(pid)
        if len(batch_imgs) >= BATCH:
            flush()
            done += BATCH
            print(f"  {done}/{len(products)}")
            Path(args.output).write_text(json.dumps(embeddings))
    flush()
    Path(args.output).write_text(json.dumps(embeddings))
    print(f"Klaar: {len(embeddings)} embeddings -> {args.output}")


if __name__ == "__main__":
    main()
