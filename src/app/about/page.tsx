import type { Metadata } from "next";

import { site } from "@/content/site";
import { HeroSection } from "./_components/hero-section";
import { StorySection } from "./_components/story-section";
import { ProcessSection } from "./_components/process-section";
import { CraftSection } from "./_components/craft-section";
import { WarrantySection } from "./_components/warranty-section";
import { ProofSlotsSection } from "./_components/proof-slots-section";
import { QuoteSection } from "./_components/quote-section";

export const metadata: Metadata = {
  title: "About",
  description: `How ${site.name} builds modular homes and businesses in 30 days, and what we put our name to.`,
  alternates: { canonical: "/about" },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "/about",
    siteName: site.name,
    title: "About",
    description: `How ${site.name} builds modular homes and businesses in 30 days, and what we put our name to.`,
  },
};

export default function AboutPage() {
  return (
    <>
      <HeroSection />
      <StorySection />
      <ProcessSection />
      <CraftSection />
      <WarrantySection />
      <ProofSlotsSection />
      <QuoteSection />
    </>
  );
}
