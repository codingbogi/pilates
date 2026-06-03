"use client";

import { Hero } from "@/components/home/Hero";
import { WhyUs } from "@/components/home/WhyUs";
import { About } from "@/components/home/About";
import { Classes } from "@/components/home/Classes";
import { Reviews } from "@/components/home/Reviews";
import { CTASection } from "@/components/home/CTASection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <WhyUs />
      <About />
      <Classes />
      <Reviews />
      <CTASection />
    </>
  );
}
