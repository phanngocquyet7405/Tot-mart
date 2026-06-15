"use client";

import React from "react";

const brandsRow1 = [
  { name: "Artisan Co.", logo: "AC" },
  { name: "Pure Goods", logo: "PG" },
  { name: "Maker Studio", logo: "MS" },
  { name: "Handcraft", logo: "HC" },
  { name: "Nature Labs", logo: "NL" },
  { name: "Local Roots", logo: "LR" },
  { name: "Craft House", logo: "CH" },
  { name: "Studio Nine", logo: "S9" },
];

const brandsRow2 = [
  { name: "Earth Made", logo: "EM" },
  { name: "Folk Art", logo: "FA" },
  { name: "Simple Things", logo: "ST" },
  { name: "Makers Mark", logo: "MM" },
  { name: "Wild Craft", logo: "WC" },
  { name: "Honest Goods", logo: "HG" },
  { name: "True North", logo: "TN" },
  { name: "Origin Co.", logo: "OC" },
];

function MarqueeRow({ brands, reverse = false }) {
  return (
    <div className="flex overflow-hidden">
      <div
        className={`flex gap-12 shrink-0 ${
          reverse ? "animate-marquee-reverse" : "animate-marquee"
        }`}
      >
        {/* Nhân bản mảng để tạo hiệu ứng lặp vô tận */}
        {[...brands, ...brands, ...brands].map((brand, index) => (
          <div
            key={index}
            className="flex items-center gap-3 shrink-0 px-6 py-4 bg-card rounded-xl border border-border hover:border-primary/30 transition-colors"
          >
            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-muted-foreground">
                {brand.logo}
              </span>
            </div>
            <span className="text-foreground font-medium whitespace-nowrap">
              {brand.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BrandMarquee() {
  return (
    <section className="py-20 bg-secondary overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-center">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Trusted Partners
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-4 text-balance">
            Featured by 100+ Artisan Brands
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            We partner with the finest independent makers to bring you unique,
            quality products.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <MarqueeRow brands={brandsRow1} />
        <MarqueeRow brands={brandsRow2} reverse={true} />
      </div>
    </section>
  );
}
