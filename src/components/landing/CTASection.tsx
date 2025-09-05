import { Link } from "react-router-dom";
import track from "@/services/analytics";

export default function CTASection(){
  return(
    <section className="rounded-3xl p-8 sm:p-10 bg-[color:var(--ff-midnight)] text-white grid gap-6 sm:grid-cols-2 items-center shadow-[0_20px_50px_rgba(13,27,42,.25)]">
      <div>
        <h2 className="font-heading text-2xl sm:text-3xl">Klaar voor outfits die kloppen?</h2>
        <p className="mt-2 text-white/80">Doe de stijlscan of bekijk de demo-resultaten. Bij elke look een korte uitleg — menselijk en duidelijk.</p>
      </div>
      <div className="flex sm:justify-end gap-3">
        <Link to="/onboarding" className="btn btn-primary" onClick={()=>track("nova:cta",{where:"cta-band",action:"onboarding"})}>Doe de stijlscan</Link>
        <Link to="/results" className="btn btn-ghost bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={()=>track("nova:cta",{where:"cta-band",action:"demo"})}>Bekijk demo</Link>
      </div>
    </section>
  );
}