"use client";

import { motion } from "motion/react";

interface MotionCardProps {
  index: number;
  children: React.ReactNode;
}

const MotionCard = ({ index, children }: MotionCardProps) => {
  return (
    <motion.div
      className="group relative h-fit w-full md:w-90 bg-[#0A0A0A] rounded-lg  border border-[#B8860B] shadow-2xs hover:shadow-md shadow-[#DDAE56] hover:-translate-y-2.5 transition-transform duration-200 overflow-hidden cursor-pointer"
      key={index}
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      {children}
    </motion.div>
  );
};

export { MotionCard };
