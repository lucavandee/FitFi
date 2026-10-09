/*
 * Geen herlaadlogica meer. sw.js roept skipWaiting() aan in install en
 * clients.claim() in activate: een nieuwe worker neemt het altijd meteen over.
 * Navigaties gaan network-first en de assets dragen een hash, dus de open
 * pagina is nooit verouderd en herladen levert niets op.
 *
 * Wat hier stond deed twee dingen verkeerd (gemeten op 8 oktober 2026):
 * - Een controllerchange-reload. Bij een eerste bezoek is er nog geen
 *   controller, claim() vuurt dan toch controllerchange, en elke nieuwe
 *   bezoeker kreeg de pagina 0,5 tot 2,3 s na load een tweede keer (en een
 *   afgebroken hero-clip).
 * - Een confirm("Nieuwe versie beschikbaar! Pagina herladen?") bij elke nieuwe
 *   sw.js. Door skipWaiting() maakte het antwoord niets uit: de reload kwam
 *   er hoe dan ook achteraan.
 */
export function registerServiceWorker(): void {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
        // Silent fail in production
      });
    });
  }
}

export function unregisterServiceWorker(): Promise<boolean> {
  if ('serviceWorker' in navigator) {
    return navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        return Promise.all(registrations.map((r) => r.unregister())).then(() => true);
      })
      .catch(() => false);
  }
  return Promise.resolve(false);
}
