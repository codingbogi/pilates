"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { AnimatedSection } from "./AnimatedSection";

export function CTASection() {
  const { t } = useI18n();

  return (
    <section className="py-20 px-4 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600">
      <div className="max-w-4xl mx-auto text-center">
        <AnimatedSection>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {t("ctaSection.title")}
          </h2>
          <p className="text-pink-100 text-lg mb-8 max-w-2xl mx-auto">
            {t("ctaSection.subtitle")}
          </p>
          <Link
            href="/kontakt"
            className="inline-flex items-center gap-2 bg-white text-pink-600 px-8 py-4 rounded-full text-lg font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          >
            {t("ctaSection.cta")}
          </Link>
        </AnimatedSection>
      </div>
    </section>
  );
}
