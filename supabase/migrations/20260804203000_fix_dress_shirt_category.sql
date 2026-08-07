/*
  # Herenoverhemden staan als jurk in de catalogus

  ## Probleem
  De productclassifier gaf het generieke patroon "dress" gewicht 3 en het
  generieke patroon "shirt" gewicht 2. Daardoor won de jurk-categorie van de
  top-categorie bij namen als "OLYMP | Heren | Luxor Modern Fit Dress Shirt".
  Gevolg: herenoverhemden konden in jurk-aanbevelingen opduiken.

  Gevonden op 2026-08-04 met beeld-embeddings (FashionCLIP) op de live
  catalogus. Van de 25 producten met category='dress' en gender='male' bleken
  er 20 een overhemd (OLYMP 14, Profuomo 5, Xacus 1). Met de merkgenoten
  uitgesloten uit de stemming wees de visuele buren-consensus 19 van die 20
  naar 'top'.

  ## Oorzaak weggenomen
  De regel in productClassifier.ts (zowel supabase/functions/_shared/ als
  src/engine/) sluit nu "dress shirt", "dress shoes", "dress pants",
  "dress trousers", "dress socks" en "dress code" uit. "Shirt dress" en
  "shirtjurk" blijven jurken. Blast-radius gemeten op 2.674 echte
  productnamen: exact 20 producten wijzigen, 155 jurken blijven ongemoeid.

  ## Wat deze migratie doet
  Corrigeert de bestaande rijen. Zonder deze stap blijven de al geimporteerde
  producten fout staan, ook al classificeert de code nieuwe imports goed.

  ## Terugdraaien
  UPDATE products SET category = 'dress'
  WHERE category = 'top' AND name ILIKE '%dress shirt%';
*/

-- Controle vooraf (verwacht: 20 rijen)
--   SELECT count(*) FROM products WHERE category = 'dress' AND name ILIKE '%dress shirt%';

UPDATE products
SET category = 'top',
    updated_at = now()
WHERE category = 'dress'
  AND name ILIKE '%dress shirt%';

-- Controle achteraf (verwacht: 0 rijen)
--   SELECT count(*) FROM products WHERE category = 'dress' AND name ILIKE '%dress shirt%';
