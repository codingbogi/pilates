"use client";

import { useI18n } from "@/lib/i18n";
import { AnimatedSection } from "./AnimatedSection";
import { Award, Users, Sparkles, Clock } from "lucide-react";

const icons = [Award, Users, Sparkles, Clock];

export function WhyUs() {
  const { t } = useI18n();

  const cards = [
    { title: t("whyUs.card1Title"), desc: t("whyUs.card1Desc") },
    { title: t("whyUs.card2Title"), desc: t("whyUs.card2Desc") },
    { title: t("whyUs.card3Title"), desc: t("whyUs.card3Desc") },
    { title: t("whyUs.card4Title"), desc: t("whyUs.card4Desc") },
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t("whyUs.title")}
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-pink-400 to-rose-400 mx-auto rounded-full" />
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, i) => {
            const Icon = icons[i];
            return (
              <AnimatedSection key={i} delay={i * 0.15}>
                <div className="group p-6 rounded-2xl bg-gradient-to-b from-pink-50 to-white border border-pink-100 hover:shadow-lg hover:shadow-pink-100 hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{card.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{card.desc}</p>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
