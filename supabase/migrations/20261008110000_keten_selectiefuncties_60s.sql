/*
  # keten_tag_kandidaten en keten_embed_kandidaten: 60 s in plaats van 8 s

  ## Probleem, gemeten in de premiumrun van 2 tot 5 oktober 2026
  De scripts roepen deze selectiefuncties aan met de service role, die de 8 s van
  de authenticator erft. De eerste pagina van keten_tag_kandidaten loopt in
  product_id-volgorde over product_attributes en moet daarbij duizenden al
  getagde rijen overslaan. Elke rij kost een leesactie van de tabel, en op een
  koude cache (schijf van 11 tot 15 MB/s) lukt dat niet in 8 s. 14 van de 41
  blokken in de premiumrun stierven op de allereerste pagina met "canceling
  statement due to statement timeout"; de runner startte ze opnieuw, wat een
  derde van de pogingen kostte. Op een warme cache (de tweede pagina en verder)
  is dezelfde aanroep snel.

  ## Wat deze migratie doet
  Een functie-instelling gaat voor op die van de rol (gemeten op 1 oktober 2026,
  zie 20261001150000_get_kandidaten_dekkende_index.sql). Dezelfde 60 s als de
  schrijffuncties in 20261002120000_keten_kandidaat_product.sql. De functies
  worden alleen door scripts met de service role aangeroepen (de anon-sleutel is
  uitgesloten), dus dit verruimt niets voor bezoekers.

  De betere oplossing is een gedeeltelijke index op alleen de ongetagde
  kandidaten, zodat de selectie die rijen niet meer hoeft over te slaan. Dat kan
  niet zonder de selectie te herschrijven: de voorwaarde "tagger_version is null
  of niet de huidige versie" is geen deelverzameling van "is null". Nu volstaat
  60 s, want de ongetagde rest is klein (11.233 van ruim 280.000).

  ## Terugdraaien
    alter function keten_tag_kandidaten(text, text, text, integer, uuid, numeric, numeric, text) reset statement_timeout;
    alter function keten_embed_kandidaten(text, integer, uuid) reset statement_timeout;
*/

alter function public.keten_tag_kandidaten(text, text, text, integer, uuid, numeric, numeric, text)
  set statement_timeout = '60s';

alter function public.keten_embed_kandidaten(text, integer, uuid)
  set statement_timeout = '60s';
