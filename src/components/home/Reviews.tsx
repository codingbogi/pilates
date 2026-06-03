"use client";

import { useState, useEffect, useCallback } from "react";
import { useI18n } from "@/lib/i18n";
import { AnimatedSection } from "./AnimatedSection";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

const reviewsData = [
  { name: "Marija S.", text: "Pilates studio koji me je potpuno promenio! Treneri su fantastični i uvek posvećeni. Preporučujem svima!", textEn: "A pilates studio that completely changed me! The trainers are fantastic and always dedicated. I recommend it to everyone!", rating: 5 },
  { name: "Ana K.", text: "Već godinu dana treniram ovde i rezultati su neverovatni. Atmosfera je prelepa i opuštajuća.", textEn: "I've been training here for a year and the results are incredible. The atmosphere is beautiful and relaxing.", rating: 5 },
  { name: "Jelena M.", text: "Duo treninzi su savršeni! Moja drugarica i ja uživamo u svakom terminu. Profesionalan pristup.", textEn: "Duo trainings are perfect! My friend and I enjoy every session. Professional approach.", rating: 5 },
  { name: "Ivana P.", text: "Individualni treninzi su mi pomogli sa problemima sa leđima. Trener je prilagodio sve vežbe mojim potrebama.", textEn: "Individual trainings helped me with back problems. The trainer adapted all exercises to my needs.", rating: 4 },
  { name: "Milica T.", text: "Najbolji pilates studio u gradu! Fleksibilni termini, mala grupa, i odlična oprema. Hvala vam!", textEn: "The best pilates studio in town! Flexible schedule, small group, and excellent equipment. Thank you!", rating: 5 },
];

export function Reviews() {
  const { t, locale } = useI18n();
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % reviewsData.length);
  }, []);

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + reviewsData.length) % reviewsData.length);
  };

  useEffect(() => {
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [next]);

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <AnimatedSection className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t("reviews.title")}
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-pink-400 to-rose-400 mx-auto rounded-full" />
        </AnimatedSection>

        <AnimatedSection>
          <div className="relative bg-gradient-to-b from-pink-50 to-white rounded-2xl p-8 sm:p-12 border border-pink-100 shadow-sm">
            <div className="text-center">
              <div className="flex justify-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={i < reviewsData[currentIndex].rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                  />
                ))}
              </div>
              <p className="text-gray-700 text-lg leading-relaxed mb-6 italic min-h-[80px]">
                &ldquo;{locale === "sr" ? reviewsData[currentIndex].text : reviewsData[currentIndex].textEn}&rdquo;
              </p>
              <p className="font-semibold text-gray-800">— {reviewsData[currentIndex].name}</p>
            </div>

            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={prev}
                className="p-2 rounded-full bg-white border border-pink-200 hover:bg-pink-50 transition-colors shadow-sm"
              >
                <ChevronLeft size={20} className="text-pink-500" />
              </button>
              <div className="flex items-center gap-2">
                {reviewsData.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentIndex ? "bg-pink-500 w-6" : "bg-pink-200"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={next}
                className="p-2 rounded-full bg-white border border-pink-200 hover:bg-pink-50 transition-colors shadow-sm"
              >
                <ChevronRight size={20} className="text-pink-500" />
              </button>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
