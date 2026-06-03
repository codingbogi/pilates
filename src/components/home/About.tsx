"use client";

import { useI18n } from "@/lib/i18n";
import { AnimatedSection } from "./AnimatedSection";

export function About() {
  const { t } = useI18n();

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-white to-pink-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <AnimatedSection>
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-pink-200 via-rose-200 to-pink-300 overflow-hidden shadow-xl">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="text-6xl mb-4">🧘‍♀️</div>
                    <p className="text-pink-700 font-medium text-lg">Pilates Studio</p>
                    <p className="text-pink-600 text-sm mt-1">Est. 2020</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl opacity-20" />
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              {t("about.title")}
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full mb-6" />
            <p className="text-gray-600 leading-relaxed text-lg">
              {t("about.text")}
            </p>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
