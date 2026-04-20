"use client";

import AnnouncementBarBox from "@/components_box/announcement-bar";
import { Navigation } from "@/components_box/nav_box";
import { HeroSection } from "@/components_box/hero-sections";
import { IntroSection } from "@/components_box/intro-section";
import { BrandMarquee } from "@/components_box/brand-marquee";
import { HowItWorks } from "@/components_box/how-it-work";
import { ProductShowcase } from "@/components_box/product-showcase";
import { Testimonials } from "@/components_box/testimonials";
import TotBoxProductChoosePlan from "@/components_box/ChoosePlan";
import { Newsletter } from "@/components_box/newsletter";
import Footer from "./(client)/components/ui/footer";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-white">
      <AnnouncementBarBox />
      <div className="sticky top-0 z-100 w-full">
        <Navigation />
      </div>
      <div className="-mt-22">
        {" "}
        <HeroSection />
      </div>

      <div className="flex flex-col">
        <IntroSection />
        <BrandMarquee />
        <HowItWorks />
        <ProductShowcase />
        <Testimonials />
        <TotBoxProductChoosePlan />
        <Newsletter />
      </div>

      {/* 3. Footer */}
      <Footer />
    </main>
  );
}
