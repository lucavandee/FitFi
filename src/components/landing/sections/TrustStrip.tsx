/**
 * Rustige vertrouwensstrip onder de hero.
 *
 * Hier stond een marquee die deze drie claims dertig seconden per lus door
 * beeld schoof. Die beweging zei niets over FitFi en had op elke andere site
 * net zo goed gepast, terwijl hij wel de aandacht van de hero-CTA wegtrok en
 * de tekst pas leesbaar maakte op het moment dat hij toevallig langskwam.
 * De claims staan nu stil.
 *
 * De drie claims zijn letterlijk die uit de marquee. Bewust niets toegevoegd:
 * elk extra cijfer hier zou een claim zijn die we niet kunnen aantonen.
 */

type Claim = { sterk: string; rest: string };

const CLAIMS: Claim[] = [
  { sterk: "~5 min", rest: "invultijd" },
  { sterk: "Gratis", rest: "geen creditcard" },
  { sterk: "Persoonlijk", rest: "kleurpalet" },
];

export default function TrustStrip() {
  return (
    <div className="bg-[#FAFAF8] border-b border-[#E5E5E5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-7">
        <ul className="list-none m-0 p-0 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-0">
          {CLAIMS.map((claim, i) => (
            <li key={claim.sterk} className="flex items-center">
              {/* Scheiding tussen twee claims; op mobiel staan ze onder elkaar. */}
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className="hidden sm:block w-px h-4 bg-[#A85740]/40 mx-5 md:mx-8"
                />
              )}
              <span className="text-base leading-relaxed text-center">
                <strong className="font-semibold text-[#1A1A1A]">
                  {claim.sterk}
                </strong>{" "}
                <span className="text-[#4A4A4A]">{claim.rest}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
