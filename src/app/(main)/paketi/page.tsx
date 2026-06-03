"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { AnimatedSection } from "@/components/home/AnimatedSection";
import { Check, Sparkles } from "lucide-react";

const packagesData = [
  { count: 1, price: "1.500 RSD", popular: false },
  { count: 6, price: "7.500 RSD", popular: false },
  { count: 8, price: "9.000 RSD", popular: true },
  { count: 10, price: "10.500 RSD", popular: false },
  { count: 12, price: "12.000 RSD", popular: false },
];

export default function PaketiPage() {
  const { t } = useI18n();

  const features = [
    t("packages.feature1"),
    t("packages.feature2"),
    t("packages.feature3"),
    t("packages.feature4"),
    t("packages.feature5"),
  ];

  return (
    <div className="py-16 px-4 bg-gradient-to-b from-pink-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection className="text-center mb-14">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t("packages.title")}
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {t("packages.subtitle")}
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-pink-400 to-rose-400 mx-auto rounded-full mt-6" />
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {packagesData.map((pkg, i) => (
            <AnimatedSection key={i} delay={i * 0.1}>
              <div
                className={`relative bg-white rounded-2xl p-6 border flex flex-col h-full transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${
                  pkg.popular
                    ? "border-pink-300 shadow-lg shadow-pink-100 ring-2 ring-pink-200"
                    : "border-pink-100 shadow-sm hover:shadow-pink-100"
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-medium px-3 py-1 rounded-full shadow-md">
                      <Sparkles size={12} />
                      {t("packages.popular")}
                    </span>
                  </div>
                )}

                <div className="text-center mb-6 pt-2">
                  <div className="text-4xl font-bold text-gray-900 mb-1">
                    {pkg.count}
                  </div>
                  <div className="text-sm text-gray-500">
                    {pkg.count === 1 ? t("packages.training") : t("packages.trainings")}
                  </div>
                  <div className="text-2xl font-bold text-pink-600 mt-3">
                    {pkg.price}
                  </div>
                </div>

                <div className="border-t border-pink-50 pt-4 mb-6 flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-3">
                    {t("packages.includes")}
                  </p>
                  <ul className="space-y-2">
                    {features.slice(0, pkg.count === 1 ? 3 : 5).map((f, fi) => (
                      <li key={fi} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check size={16} className="text-pink-500 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/kontakt"
                  className={`w-full text-center py-3 rounded-full text-sm font-medium transition-all ${
                    pkg.popular
                      ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md hover:shadow-lg hover:shadow-pink-200"
                      : "bg-pink-50 text-pink-600 hover:bg-pink-100"
                  }`}
                >
                  {t("packages.contactUs")}
                </Link>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </div>
  );
}
