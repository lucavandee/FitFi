import React from 'react';
import { Helmet } from 'react-helmet-async';
import MarkdownPage from '../components/ui/MarkdownPage';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Privacybeleid - Hoe we omgaan met jouw gegevens | FitFi</title>
        <meta name="description" content="Lees ons privacybeleid en ontdek hoe FitFi omgaat met jouw persoonlijke gegevens. Transparant, veilig en AVG-compliant." />
        <meta property="og:title" content="Privacybeleid - Hoe we omgaan met jouw gegevens" />
        <meta property="og:description" content="Transparant, veilig en AVG-compliant gegevensbeheer bij FitFi." />
        <link rel="canonical" href="https://fitfi.app/privacy-policy" />
      </Helmet>
      
      <MarkdownPage
        title="Privacybeleid"
        description="Hoe we omgaan met jouw gegevens"
        markdownPath="/content/legal/privacy-policy.md"
        downloadUrl="/documents/privacy-policy.pdf"
        backLink="/"
        backLabel="Terug naar home"
      />
    </>
  );
};

export default PrivacyPolicyPage;