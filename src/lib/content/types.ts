export type CTA = { label: string; to: string; variant: "primary" | "secondary" };
export type Badge = { text: string };
export type Step = { title: string; text: string };
export type Reason = { text: string };
export type QA = { q: string; a: string };

export type HomeContent = {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  ctas: CTA[];
  badges: Badge[];
  steps: Step[];
  reasons: Reason[];
  faq: QA[];
};