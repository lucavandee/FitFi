/**
 * Keten-types voor client, scripts en plan 4.
 *
 * De bron staat in supabase/functions/_shared/keten-types.ts, omdat een edge
 * function alleen bestanden binnen supabase/functions kan importeren. Hier
 * exporteren we alles opnieuw zodat de rest van de app uit '@/keten/types'
 * importeert en nooit hoeft te weten waar het bestand staat.
 */
export * from '../../supabase/functions/_shared/keten-types';
