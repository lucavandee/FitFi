"""Draaien: ~/.cache/fitfi-visual-venv/bin/python -m unittest scripts/keten/__tests__/test_embed_products.py"""
import importlib.util
import unittest
from pathlib import Path

PAD = Path(__file__).resolve().parents[1] / "embed-products.py"
spec = importlib.util.spec_from_file_location("embed_products_keten", PAD)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


class VectorNaarPg(unittest.TestCase):
    def test_pgvector_tekstvorm(self):
        self.assertEqual(mod.vector_naar_pg([0.1, -0.25, 1.0]), "[0.100000,-0.250000,1.000000]")

    def test_lengte_512_blijft_512_waarden(self):
        tekst = mod.vector_naar_pg([0.0] * 512)
        self.assertEqual(tekst.count(",") + 1, 512)


class Verdeel(unittest.TestCase):
    def test_verdeelt_in_stukken(self):
        self.assertEqual(mod.verdeel([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]])
        self.assertEqual(mod.verdeel([], 3), [])


if __name__ == "__main__":
    unittest.main()
