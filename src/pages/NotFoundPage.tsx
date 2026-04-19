import React from "react";
import Seo from "@/components/seo/Seo";

const NotFoundPage = () => {
  return (
    <main id="main" className="bg-[#FAFAF8]">
      <Seo
        title="Pagina niet gevonden — FitFi"
        description="Deze pagina bestaat niet. Ga terug naar de homepage of start de stijlquiz."
        noindex
      />
      <section className="min-h-screen flex items-center justify-center px-4 py-24">
        <div className="max-w-md w-full mx-auto text-center">
          <p
            className="text-7xl md:text-8xl font-bold text-[#C2654A] mb-4 leading-none"
            aria-hidden="true"
          >
            404
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-4">
            Pagina niet gevonden
          </h1>
          <p className="text-base text-[#4A4A4A] mb-8 max-w-sm mx-auto leading-relaxed">
            De pagina die je zocht bestaat niet meer of is verplaatst.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/"
              className="bg-[#C2654A] hover:bg-[#A8513A] text-white font-semibold text-base py-3 px-6 rounded-xl transition-colors duration-200"
            >
              Naar de homepage
            </a>
            <a
              href="/onboarding"
              className="bg-white border border-[#E5E5E5] hover:border-[#C2654A] text-[#1A1A1A] font-medium text-base py-3 px-6 rounded-xl transition-colors duration-200"
            >
              Start de stijlquiz
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};

export default NotFoundPage;
