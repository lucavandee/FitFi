import React from 'react';
import { Shield, Lock, Award, Users, Clock, Heart } from 'lucide-react';

const TrustBelt: React.FC = () => {
  const trustItems = [
    {
      icon: Shield,
      text: '100% Privacy-first'
    },
    {
      icon: Lock,
      text: 'Veilige gegevensverwerking'
    },
    {
      icon: Award,
      text: 'AI-gedreven technologie'
    },
    {
      icon: Users,
      text: '25.000+ tevreden gebruikers'
    },
    {
      icon: Clock,
      text: 'Binnen 2 minuten klaar'
    },
    {
      icon: Heart,
      text: 'Volledig gratis'
    }
  ];

  return (
    <section className="py-16 bg-[var(--color-surface)] border-t border-[var(--color-border)]">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {trustItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-3 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors duration-300 group"
              >
                <Icon className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-sm font-medium whitespace-nowrap">
                  {item.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustBelt;