import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function IntroSection() {
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
            <Button size="lg" className="gap-2">
              Learn More About Us
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
