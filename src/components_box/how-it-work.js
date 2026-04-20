import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    title: "Choose Your Box",
    description:
      "Select from our curated collections or let us surprise you with our monthly themed boxes.",
    // Đã thay đổi đường dẫn ảnh tại đây
    image: "/assets/hero_section_picture.jpg",
  },
  {
    title: "We Curate & Ship",
    description:
      "Our team handpicks 5-7 full-size products from artisan makers and ships them right to your door.",
    // Đã thay đổi đường dẫn ảnh tại đây
    image: "/assets/hero_section_picture.jpg",
  },
  {
    title: "Unbox & Enjoy",
    description:
      "Experience the joy of discovering unique, quality products that support independent makers.",
    // Đã thay đổi đường dẫn ảnh tại đây
    image: "/assets/hero_section_picture.jpg",
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
            <Card
              key={index}
              className="group overflow-hidden border-border hover:border-primary/30 transition-all hover:shadow-xl"
            >
              <div className="aspect-3/2 relative overflow-hidden">
                <Image
                  src={step.image}
                  alt={step.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg">
                  {index + 1}
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-card-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
