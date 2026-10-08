-- Faalt met de slugs van gepubliceerde artikelen waarin geld- of beleggingstaal
-- staat die we met 20261008140000_blog_geldclaims_opruimen.sql hebben verwijderd.
-- Eindigt anders in BLOG_GELDCLAIMS_OK.
--
-- De rekenvoorbeelden bij de kosten-per-keer-formule (duurzame-mode-bewuste-keuzes)
-- vallen er bewust buiten: dat is een som, geen claim.
do $$
declare
  v_over text;
begin
  select string_agg(slug, ', ') into v_over
  from public.blog_posts
  where status = 'published'
    and content ~* '(financi[eë]le vrijheid|\minvest|budget tip|save money|€ ?100-200)';
  if v_over is not null then
    raise exception 'BLOG_GELDCLAIMS_FOUT: %', v_over;
  end if;
end
$$;

select 'BLOG_GELDCLAIMS_OK' as uitslag;
