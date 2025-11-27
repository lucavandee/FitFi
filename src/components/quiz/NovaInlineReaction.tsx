import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ThumbsUp, Heart, Zap, Lightbulb } from 'lucide-react';

interface NovaInlineReactionProps {
  field: string;
  value: any;
  allAnswers: Record<string, any>;
  onComplete?: () => void;
}

export function NovaInlineReaction({ field, value, allAnswers, onComplete }: NovaInlineReactionProps) {
  const [reaction, setReaction] = useState<{
    message: string;
    icon: 'thumbs' | 'heart' | 'zap' | 'bulb';
    tone: 'positive' | 'insightful' | 'excited';
  } | null>(null);

  useEffect(() => {
    const r = getReactionForAnswer(field, value, allAnswers);
    setReaction(r);

    // Auto-complete after 3 seconds
    const timer = setTimeout(() => {
      onComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [field, value]);

  if (!reaction) return null;

  const icons = {
    thumbs: ThumbsUp,
    heart: Heart,
    zap: Zap,
    bulb: Lightbulb
  };

  const Icon = icons[reaction.icon];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="mt-6 p-4 bg-gradient-to-r from-[var(--color-primary)]/5 to-[var(--color-accent)]/5 border border-[var(--color-primary)]/20 rounded-[var(--radius-2xl)]"
      >
        <div className="flex items-start gap-3">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center"
          >
            <Icon className="w-5 h-5 text-white" />
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-[var(--color-text)]">Nova</span>
              <Sparkles className="w-3 h-3 text-[var(--color-primary)]" />
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-[var(--color-text)]/80 leading-relaxed"
            >
              {reaction.message}
            </motion.p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function getReactionForAnswer(field: string, value: any, allAnswers: Record<string, any>) {
  // GENDER
  if (field === 'gender') {
    if (value === 'male') {
      return {
        message: 'Perfect! Ik heb 250+ stijlvolle herenoutfits in mijn database klaarstaan voor jou.',
        icon: 'thumbs' as const,
        tone: 'positive' as const
      };
    }
    if (value === 'female') {
      return {
        message: 'Geweldig! Ik heb 350+ inspirerende damesoutfits ready om jouw stijl te ontdekken.',
        icon: 'heart' as const,
        tone: 'excited' as const
      };
    }
  }

  // STYLE PREFERENCES
  if (field === 'stylePreferences' && Array.isArray(value)) {
    const styles = value;

    if (styles.includes('minimal') || styles.includes('modern')) {
      return {
        message: 'Minimalistisch! Dat past perfect bij merken zoals COS, Arket en & Other Stories. Ik ga je clean, tijdloze looks laten zien.',
        icon: 'zap' as const,
        tone: 'insightful' as const
      };
    }

    if (styles.includes('classic') || styles.includes('sophisticated')) {
      return {
        message: 'Klassieke elegantie - ik zie al Ralph Lauren, Hugo Boss en Massimo Dutti voor je. Je stijl is tijdloos!',
        icon: 'thumbs' as const,
        tone: 'positive' as const
      };
    }

    if (styles.includes('streetwear') || styles.includes('urban')) {
      return {
        message: 'Streetwear vibes! Ik ga je connecten met Nike, Adidas Originals en emerging brands. Dit wordt nice!',
        icon: 'zap' as const,
        tone: 'excited' as const
      };
    }

    if (styles.includes('bohemian') || styles.includes('vintage')) {
      return {
        message: 'Bohemian style! Ik ga zoeken naar unieke pieces met karakter. Denk Free People en vintage gems.',
        icon: 'heart' as const,
        tone: 'excited' as const
      };
    }

    if (styles.length > 4) {
      return {
        message: `Je houdt van ${styles.length} verschillende stijlen! Dat geeft me veel vrijheid. Ik ga een eclectische mix voor je maken.`,
        icon: 'bulb' as const,
        tone: 'insightful' as const
      };
    }

    return {
      message: `Interessante combinatie! Ik zie hoe ik deze ${styles.length} stijlen kan mengen voor unieke outfits.`,
      icon: 'bulb' as const,
      tone: 'insightful' as const
    };
  }

  // OCCASIONS
  if (field === 'occasions' && Array.isArray(value)) {
    const occasions = value;

    if (occasions.includes('work') && occasions.includes('casual')) {
      return {
        message: 'Smart! Werk + casual betekent veelzijdige pieces. Ik ga focussen op items die je kunt mix & matchen.',
        icon: 'bulb' as const,
        tone: 'insightful' as const
      };
    }

    if (occasions.includes('formal') || occasions.includes('events')) {
      return {
        message: 'Je hebt formele gelegenheden! Ik ga zorgen dat je outfits hebt waar je met vertrouwen elke gelegenheid aankan.',
        icon: 'thumbs' as const,
        tone: 'positive' as const
      };
    }

    if (occasions.length === 1) {
      return {
        message: 'Gefocust op één gelegenheid - ik ga super specifieke matches voor je vinden!',
        icon: 'zap' as const,
        tone: 'excited' as const
      };
    }

    return {
      message: `${occasions.length} verschillende gelegenheden! Ik ga een veelzijdige garderobe voor je samenstellen.`,
      icon: 'thumbs' as const,
      tone: 'positive' as const
    };
  }

  // BUDGET
  if (field === 'budgetRange') {
    const budget = value;

    if (budget >= 200) {
      return {
        message: 'Met dit budget kan ik echt premium merken voor je selecteren. Denk aan hoogwaardige basics en statement pieces.',
        icon: 'zap' as const,
        tone: 'excited' as const
      };
    }

    if (budget >= 100) {
      return {
        message: 'Perfect middensegment! Hier zit de beste value for money. Merken zoals Zara, Mango en Selected hebben hier geweldige pieces.',
        icon: 'thumbs' as const,
        tone: 'positive' as const
      };
    }

    if (budget < 100) {
      const hasLuxuryStyle = allAnswers.stylePreferences?.some((s: string) =>
        ['classic', 'sophisticated', 'elegant'].includes(s)
      );

      if (hasLuxuryStyle) {
        return {
          message: 'Je stijl is premium, maar je budget is bewust. Smart! Ik ga je laten zien hoe je die look bereikt met slimme keuzes.',
          icon: 'bulb' as const,
          tone: 'insightful' as const
        };
      }

      return {
        message: 'Budget-vriendelijk! Ik ken alle merken met de beste prijs-kwaliteit verhouding. Dit wordt een treasure hunt!',
        icon: 'heart' as const,
        tone: 'excited' as const
      };
    }
  }

  // BODY TYPE
  if (field === 'bodyType') {
    return {
      message: 'Got it! Lichaamstype helpt me enorm om silhouettes te vinden die jouw figuur flatteren. Ik ga dit meenemen in mijn selectie.',
      icon: 'thumbs' as const,
      tone: 'insightful' as const
    };
  }

  // COLORS
  if (field === 'baseColors') {
    return {
      message: 'Je kleurenpalet staat! Ik ga outfits samenstellen die perfect bij jouw favoriete kleuren passen.',
      icon: 'heart' as const,
      tone: 'positive' as const
    };
  }

  // PHOTO UPLOADED
  if (field === 'photoUrl') {
    return {
      message: 'Foto ontvangen! Ik ga je kleurtype analyseren. Dit maakt je aanbevelingen 3x persoonlijker.',
      icon: 'zap' as const,
      tone: 'excited' as const
    };
  }

  // DEFAULT
  return {
    message: 'Duidelijk! Ik gebruik dit om je perfecte outfits te vinden.',
    icon: 'thumbs' as const,
    tone: 'positive' as const
  };
}
