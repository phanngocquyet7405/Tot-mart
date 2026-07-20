"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

export function IntroSection() {
  const handleSubscribeClick = () => {
    const section = document.getElementById("choose-plan");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column - Image */}
          <div className="relative">
            <div className="aspect-4/5 relative rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/assets/hero_section_picture.jpg"
                alt="Curated subscription box with artisan products"
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary rounded-2xl -z-10" />
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-secondary rounded-2xl -z-10" />
          </div>

          {/* Right Column - Text */}
          <div className="lg:pl-8">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">
              Welcome to TotMart
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-6 leading-tight text-balance">
              Curated with Care, Delivered with Love
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Every TotMart box is a treasure trove of handpicked items from
              independent makers around the world. We believe in quality over
              quantity, sustainability over fast fashion, and the joy of
              discovering something truly special.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                "5-7 full-size products in every box",
                "Supporting 200+ independent makers",
                "New themes every month",
              ].map((item, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 text-foreground"
                >
                  <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            {/* Button: màu gốc = primary, hover sweep sang màu thứ 2 */}
            {/* Màu 1 (nền): #C85C3C | Màu 2 (hover sweep): #2C1810 */}
            <button
              onClick={handleSubscribeClick}
              className="relative inline-flex items-center gap-2 px-8 py-3 rounded-md text-white font-semibold text-base overflow-hidden group"
              style={{ background: "#C85C3C" }}
            >
              <span
                className="absolute inset-0 transition-transform duration-500 ease-out -translate-x-full group-hover:translate-x-0"
                style={{ background: "#2C1810" }}
              />
              <span className="relative z-10">Subscribe Now</span>
              <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
