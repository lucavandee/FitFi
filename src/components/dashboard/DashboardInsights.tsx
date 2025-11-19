import React from "react";
import { Sparkles } from "lucide-react";
import { NovaInsightCard } from "@/components/Dashboard/NovaInsightCard";
import type { AmbientInsight } from "@/services/nova/ambientInsights";

interface DashboardInsightsProps {
  insights: AmbientInsight[];
  onDismissInsight: (type: any, insight: string) => void;
}

export const DashboardInsights: React.FC<DashboardInsightsProps> = ({
  insights,
  onDismissInsight
}) => {
  if (insights.length === 0) return null;

  return (
    <section className="py-12 bg-[var(--color-bg)]">
      <div className="ff-container">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full text-sm font-bold text-purple-700 dark:text-purple-400 mb-4 border border-purple-200 dark:border-purple-800">
              <Sparkles className="w-4 h-4" />
              NOVA AI INSIGHTS
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-[var(--color-text)] mb-4">
              Slim advies, speciaal voor jou
            </h2>
            <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto">
              Styling tips op basis van jouw profiel
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {insights.slice(0, 3).map((insight, idx) => (
              <NovaInsightCard
                key={idx}
                type={insight.type}
                insight={insight.insight}
                action={insight.action}
                actionLink={insight.actionLink}
                confidence={insight.confidence}
                priority={insight.priority}
                onDismiss={() => onDismissInsight(insight.type, insight.insight)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
