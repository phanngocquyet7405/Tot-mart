"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    number: "01",
    title: "Choose Your Box",
    description:
      "Select from our curated collections or let us surprise you with our monthly themed boxes.",
    image: "/assets/hero_section_picture.jpg",
    // ← đường dẫn đến trang box
    href: "/products/box",
    cta: "Browse Boxes",
  },
  {
    number: "02",
    title: "We Curate & Ship",
    description:
      "Our team handpicks 5-7 full-size products from artisan makers and ships them right to your door.",
    image: "/assets/hero_section_picture.jpg",
    href: "/products/box",
    cta: "See How It Works",
  },
  {
    number: "03",
    title: "Unbox & Enjoy",
    description:
      "Experience the joy of discovering unique, quality products that support independent makers.",
    image: "/assets/hero_section_picture.jpg",
    href: "/products/box",
    cta: "Start Unboxing",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Simple Process
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-4 text-balance">
            How It Works
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
            Getting started with TotMart is easy. Here&apos;s how the magic
            happens.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            /*
             * Bọc toàn bộ Card trong <Link> trỏ đến /products/box
             * Next.js Link không có thẻ <a> mặc định từ v13+,
             * nên dùng className trực tiếp trên Link là được.
             */
            <Link
              key={index}
              href={step.href}
              className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"
            >
              <Card className="overflow-hidden border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl h-full cursor-pointer">
                {/* Ảnh */}
                <div className="aspect-3/2 relative overflow-hidden">
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Số thứ tự nổi trên ảnh */}
                  <div className="absolute top-4 left-4 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                    {index + 1}
                  </div>

                  {/* Overlay tối nhẹ khi hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>

                <CardContent className="p-6">
                  {/* Step label */}
                  <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary/60 mb-2 block">
                    Step {step.number}
                  </span>

                  <h3 className="text-xl font-bold text-card-foreground mb-3 group-hover:text-primary transition-colors duration-200">
                    {step.title}
                  </h3>

                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {step.description}
                  </p>

                  {/* CTA inline — chỉ để hiển thị, không cần href thêm vì đã có Link bọc ngoài */}
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-3 transition-all duration-200">
                    {step.cta}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/products/box"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity shadow-md"
          >
            Xem tất cả hộp sản phẩm
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
