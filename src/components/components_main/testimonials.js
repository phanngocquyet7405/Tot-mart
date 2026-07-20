"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Subscriber since 2023",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    content:
      "TotMart has completely changed how I discover new products. Every box feels like a personalized gift. The quality is unmatched!",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Gift Recipient",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    content:
      "My sister gifted me a subscription and now I'm hooked. The artisan products are so unique - you won't find these anywhere else.",
    rating: 5,
  },
  {
    name: "Emma Rodriguez",
    role: "Subscriber since 2022",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    content:
      "I love that TotMart supports small makers. It feels good knowing my subscription helps independent artisans thrive.",
    rating: 5,
  },
  {
    name: "David Park",
    role: "Subscriber since 2024",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    content:
      "The themed boxes are brilliant. Each month tells a story through carefully selected products. Worth every penny!",
    rating: 5,
  },
];

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const next = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length,
    );
  };

  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-4 text-balance">
            What Our Subscribers Say
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
            Join thousands of happy subscribers who look forward to their
            TotMart delivery every month.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Main Testimonial Card */}
          <Card className="border-border shadow-xl overflow-hidden">
            <CardContent className="p-8 sm:p-12">
              <Quote className="h-12 w-12 text-primary/20 mb-6" />

              <div className="relative min-h-50">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className={`transition-all duration-500 ${
                      index === currentIndex
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 absolute inset-0 translate-x-8"
                    }`}
                  >
                    <p className="text-xl sm:text-2xl text-card-foreground leading-relaxed mb-8 text-pretty">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>

                    <div className="flex items-center gap-4">
                      <div className="relative w-14 h-14 rounded-full overflow-hidden">
                        <Image
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-card-foreground">
                          {testimonial.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {testimonial.role}
                        </p>
                      </div>
                      <div className="ml-auto flex">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="h-5 w-5 fill-primary text-primary"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="w-12 h-12 bg-card border border-border rounded-full flex items-center justify-center hover:bg-muted transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsAutoPlaying(false);
                    setCurrentIndex(index);
                  }}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentIndex ? "bg-primary w-8" : "bg-border"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-12 h-12 bg-card border border-border rounded-full flex items-center justify-center hover:bg-muted transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-foreground" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
