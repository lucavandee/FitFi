import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AnimatedQuestionTransitionProps {
  questionKey: string | number;
  children: React.ReactNode;
  direction?: "forward" | "backward";
}

export function AnimatedQuestionTransition({
  questionKey,
  children,
  direction = "forward",
}: AnimatedQuestionTransitionProps) {
  const variants = {
    enter: {
      x: direction === "forward" ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    },
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: {
      x: direction === "forward" ? -300 : 300,
      opacity: 0,
      scale: 0.95,
    },
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={questionKey}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
          x: { type: "spring", stiffness: 300, damping: 30 },
          opacity: { duration: 0.2 },
          scale: { duration: 0.2 },
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
