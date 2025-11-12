import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface CircularProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
}

export function CircularProgressIndicator({
  currentStep,
  totalSteps,
  stepLabels = [],
}: CircularProgressIndicatorProps) {
  const progress = (currentStep / totalSteps) * 100;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Circular Progress Ring */}
      <div className="relative">
        <svg width="160" height="160" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="8"
            opacity="0.2"
          />
          {/* Progress circle */}
          <motion.circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--ff-color-primary-600)" />
              <stop offset="100%" stopColor="var(--ff-color-accent-600)" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            key={currentStep}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <div className="text-4xl font-bold text-[var(--color-text)] mb-1">
              {currentStep}
            </div>
            <div className="text-sm text-[var(--color-text-muted)] font-medium">
              van {totalSteps}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Step Dots */}
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;

          return (
            <motion.div
              key={step}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: step * 0.05 }}
              className={`
                relative flex items-center justify-center
                transition-all duration-300
                ${isCurrent ? "w-10 h-10" : "w-8 h-8"}
              `}
            >
              {isCompleted ? (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-full h-full rounded-full bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center shadow-md"
                >
                  <Check className="w-5 h-5 text-white" />
                </motion.div>
              ) : (
                <div
                  className={`
                    w-full h-full rounded-full border-2 flex items-center justify-center font-semibold text-sm
                    transition-all duration-300
                    ${
                      isCurrent
                        ? "border-[var(--ff-color-primary-600)] bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)] shadow-lg scale-110"
                        : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)]"
                    }
                  `}
                >
                  {step}
                </div>
              )}

              {/* Step Label */}
              {stepLabels[step - 1] && isCurrent && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -bottom-8 whitespace-nowrap text-xs font-semibold text-[var(--ff-color-primary-600)]"
                >
                  {stepLabels[step - 1]}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Progress Percentage */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <div className="text-sm font-semibold text-[var(--color-text-muted)]">
          {Math.round(progress)}% voltooid
        </div>
      </motion.div>
    </div>
  );
}
