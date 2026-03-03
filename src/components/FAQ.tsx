import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const FAQS = [
  {
    question: "How does the 3D Parallax effect work?",
    answer: "Our AI analyzes the depth of your 2D photos and generates a multi-layered parallax effect, creating a realistic sense of depth and camera movement as if it were a real live video."
  },
  {
    question: "Can I use my own music?",
    answer: "Currently, you can choose from our curated library of cinematic tracks. Pro and Elite users get access to an expanded catalog of high-fidelity music."
  },
  {
    question: "What is the maximum number of photos per video?",
    answer: "You can upload up to 10 photos per project. Our AI will intelligently sequence them to create a cohesive cinematic story."
  },
  {
    question: "How long does video generation take?",
    answer: "Typically, a video is generated in 30 to 60 seconds depending on the complexity of the chosen style and effects."
  }
];

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 bg-[#f5f5f4]">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-sans font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
          <p className="text-black/60">Everything you need to know about Lumina Studio.</p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => (
            <div key={index} className="bg-white rounded-2xl overflow-hidden border border-black/5">
              <button 
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-6 flex items-center justify-between text-left hover:bg-black/[0.02] transition-colors"
              >
                <span className="font-bold text-sm">{faq.question}</span>
                {openIndex === index ? <ChevronUp className="w-4 h-4 text-black/40" /> : <ChevronDown className="w-4 h-4 text-black/40" />}
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-6 pb-6"
                  >
                    <p className="text-sm text-black/60 leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
