import React from "react";
import Seo from "@/components/Seo";
import SectionHeader from "@/components/marketing/SectionHeader";

// Bestaande imports:
import MarkdownPage from "@/components/ui/MarkdownPage";

const PrivacyPolicyPage: React.FC = () => {
  return (
    <>
      {/* Uniforme SEO */}
      <Seo
        title="Privacybeleid — FitFi"
        description="Transparant, veilig en AVG-compliant gegevensbeheer bij FitFi."
        canonical="/privacy-policy"
      />

      <main className="min-h-screen bg-[var(--color-bg)]">
        <SectionHeader
          eyebrow="TRANSPARANTIE"
          title="Privacybeleid"
          subtitle="We behandelen je gegevens met respect. Hier lees je precies hoe."
          align="left"
          as="h1"
        />

        <MarkdownPage
          title="Privacybeleid"
          description="Wij gaan zorgvuldig met je gegevens om en leggen hier uit hoe."
          // Bestaande props/bron blijven gelijk:
          // source="/markdown/privacy.md" of children → ongewijzigd
        />
      </main>
    </>
  );
};

export default PrivacyPolicyPage;