"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { AnimatedSection } from "./AnimatedSection";
import { Users, UserCheck, User } from "lucide-react";

export function Classes() {
  const { t } = useI18n();

  const classes = [
    {
      icon: Users,
      title: t("classes.group"),
      desc: t("classes.groupDesc"),
      capacity: `${t("classes.upTo")} 7 ${t("classes.persons")}`,
      gradient: "from-pink-400 to-rose-500",
    },
    {
      icon: UserCheck,
      title: t("classes.duo"),
      desc: t("classes.duoDesc"),
      capacity: `2 ${t("classes.persons")}`,
      gradient: "from-rose-400 to-pink-500",
    },
    {
      icon: User,
      title: t("classes.individual"),
      desc: t("classes.individualDesc"),
      capacity: `1 ${t("classes.person")}`,
      gradient: "from-pink-500 to-rose-600",
    },
  ];

  return (
    <section className="py-20 px-4 bg-pink-50">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t("classes.title")}
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-pink-400 to-rose-400 mx-auto rounded-full" />
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {classes.map((cls, i) => {
            const Icon = cls.icon;
            return (
              <AnimatedSection key={i} delay={i * 0.15}>
                <div className="group bg-white rounded-2xl p-8 shadow-sm border border-pink-100 hover:shadow-xl hover:shadow-pink-100 hover:-translate-y-2 transition-all duration-300 flex flex-col h-full">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cls.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    <Icon size={28} className="text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{cls.title}</h3>
                  <span className="inline-block px-3 py-1 rounded-full bg-pink-50 text-pink-600 text-xs font-medium mb-4 w-fit">
                    {cls.capacity}
                  </span>
                  <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-6">{cls.desc}</p>
                  <Link
                    href="/paketi"
                    className="inline-flex items-center justify-center bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-full text-sm font-medium hover:shadow-lg hover:shadow-pink-200 transition-all"
                  >
                    {t("classes.cta")}
                  </Link>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
