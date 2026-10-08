-- Blogartikelen: geld- en beleggingstaal en onbewezen bedragen eruit.
--
-- Aanleiding (8 oktober 2026): bij een scan van de publieke tekst op financiële
-- uitspraken stonden in vier artikelen "Financiële vrijheid", "Investeer in
-- tijdloze stukken", "Investment Pieces", een budgetadvies van 100 tot 200 euro
-- per item en de bewering dat een shirt van 40 euro vijf keer langer meegaat dan
-- vijf van 8 euro. Geen van die uitspraken heeft een bron. De artikelen leven in
-- de database, niet in de repo, dus deze migratie legt de wijziging vast.
--
-- Wat blijft staan: de rekenvoorbeelden bij de kosten-per-keer-formule in
-- duurzame-mode-bewuste-keuzes. Dat is een som, geen claim.
--
-- Idempotent: replace() doet niets als de oude tekst er niet meer staat. De
-- oorspronkelijke teksten staan in tools/blog-backup-2026-10-08.json van de
-- sessie waarin dit is gedaan; de repo bewaart ze in de oudere seed-migraties.

do $migratie$
declare
  v_over text;
begin
  -- accessoires-finishing-touch
  update public.blog_posts set content =
    replace(replace(replace(replace(content,
      '## Investment Pieces', '## Waar kwaliteit telt'),
      'Waar je in moet investeren:', 'Hier let je extra op kwaliteit:'),
      '**High Investment**:', '**Kwaliteit eerst**:'),
      '**Save Money**:', '**Hier kan het eenvoudiger**:')
  where slug = 'accessoires-finishing-touch';

  -- capsule-wardrobe-12-items
  update public.blog_posts set content =
    replace(replace(replace(replace(replace(replace(content,
      E'\n- **Financiële vrijheid**: Investeer in tijdloze stukken', ''),
      'Invest in one perfect pair. Dark wash, no distressing, flattering fit.',
      'Kies één perfecte spijkerbroek: donkere wassing, geen scheuren, flatterende pasvorm.'),
      '**Investeer in**:', '**Kies voor**:'),
      '**Budget tip**: Beter €200 aan 1 perfect item dan €200 aan 5 fast fashion pieces die je 1 seizoen draagt.',
      '**Tip**: Kies liever één stuk van goede kwaliteit dan vijf stuks die je één seizoen draagt.'),
      '**Week 3**: Investeer strategisch', '**Week 3**: Vul gericht aan'),
      E'\n- Budget: €100-200 per item', '')
  where slug = 'capsule-wardrobe-12-items';

  -- capsule-wardrobe-minder-is-meer
  update public.blog_posts set content =
    replace(replace(content,
      E'\n- **Financiële vrijheid**: Investeer in tijdloze stukken in plaats van fast fashion', ''),
      '**Kies voor kwaliteit**: Eén goed basic t-shirt van €40 gaat 5x langer mee dan 5 fast fashion shirts van €8.',
      '**Kies voor kwaliteit**: Eén goed basic t-shirt gaat langer mee dan meerdere goedkope shirts die snel verslijten.')
  where slug = 'capsule-wardrobe-minder-is-meer';

  -- seizoenstrends-2024
  update public.blog_posts set content =
    replace(content,
      'Niet elke trend is voor altijd. Investeer in tijdloze varianten:',
      'Niet elke trend is voor altijd. Kies tijdloze varianten:')
  where slug = 'seizoenstrends-2024';

  -- Controle: staat er in welk artikel dan ook nog geldtaal van deze soort, dan
  -- loopt de hele migratie terug en weten we welk artikel het is.
  select string_agg(slug, ', ') into v_over
  from public.blog_posts
  where content ~* '(financi[eë]le vrijheid|\minvest|budget tip|save money|€ ?100-200)';
  if v_over is not null then
    raise exception 'Blog: geld- of beleggingstaal staat er nog in bij %', v_over;
  end if;
end
$migratie$;
