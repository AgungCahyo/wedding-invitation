"use client";

import { motion } from "motion/react";
import { invitation } from "@/src/data/invitation";

export function Story() {
  const { story } = invitation;

  return (
    <section className="section bg-[#faf8f3]">
      <div className="section-inner max-w-3xl">
        {/* Section title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16 md:mb-24"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex-1 h-px bg-[#e8e3dd]" />
            <p className="text-[#8b7f76] text-xs tracking-widest font-body">
              KISAH KAMI
            </p>
            <div className="flex-1 h-px bg-[#e8e3dd]" />
          </div>
        </motion.div>

        {/* Timeline */}
        <div className="space-y-8 md:space-y-12 relative">
          {/* Vertical line */}
          <div
            className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-[#e8e3dd] transform md:-translate-x-1/2"
            aria-hidden="true"
          />

          {/* Timeline items */}
          {story.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              viewport={{ once: true }}
              className={`relative pt-0 md:pt-2 ${
                index % 2 === 0 ? "md:pr-1/2 md:text-right" : "md:pl-1/2 md:ml-1/2"
              }`}
            >
              {/* Timeline dot */}
              <div className="absolute left-0 md:left-1/2 top-2 md:top-4 w-4 h-4 bg-[#c9a876] rounded-full transform -translate-x-1.5 md:-translate-x-1/2 md:translate-y-0 border-2 border-white" />

              {/* Content */}
              <div className="ml-8 md:ml-0">
                <p className="text-[#8b7f76] text-sm tracking-widest font-body mb-2">
                  {item.date}
                </p>
                <h4 className="text-xl md:text-2xl font-display text-[#2b2520] mb-2">
                  {item.title}
                </h4>
                <p className="text-[#5a524a] text-sm md:text-base font-body">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
