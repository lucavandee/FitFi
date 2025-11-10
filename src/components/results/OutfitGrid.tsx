import React from "react";
import { motion } from "framer-motion";
import OutfitCard, { Outfit } from "./OutfitCard";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300
    }
  }
};

const OutfitGrid: React.FC<{ outfits: Outfit[] }> = ({ outfits }) => {
  if (!outfits?.length) return null;
  return (
    <section aria-labelledby="outfits-title" className="ff-section bg-gradient-to-b from-white to-blue-50/30">
      <div className="ff-container">
        <motion.h2
          id="outfits-title"
          className="text-3xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 25 }}
        >
          Outfits die nu werken voor jou ✨
        </motion.h2>
        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {outfits.map((o, index) => (
            <motion.div key={o.id} variants={item}>
              <OutfitCard outfit={o} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default OutfitGrid;