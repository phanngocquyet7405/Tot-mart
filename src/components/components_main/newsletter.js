"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle } from "lucide-react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Xử lý khi người dùng nhấn Subscribe
  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      // Giả lập gửi API thành công
      setIsSubmitted(true);
      setEmail("");
    }
  };

  return (
    <section className="py-20 lg:py-32 bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          {/* Icon phong bì */}
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Mail className="h-8 w-8 text-primary-foreground" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6 text-balance">
            Stay in the Loop
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
            Subscribe to our newsletter for exclusive previews, early access to
            limited editions, and special subscriber-only discounts.
          </p>

          {isSubmitted ? (
            /* Thông báo khi đăng ký thành công */
            <div className="flex items-center justify-center gap-3 bg-white/10 rounded-full px-6 py-4 max-w-md mx-auto">
              <CheckCircle className="h-6 w-6 text-primary-foreground" />
              <span className="text-primary-foreground font-medium">
                Thanks for subscribing! Check your inbox soon.
              </span>
            </div>
          ) : (
            /* Form nhập Email */
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
            >
              <div className="flex-1 relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-4 rounded-full bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/50"
                  required
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-8 py-4"
              >
                Subscribe
              </Button>
            </form>
          )}

          <p className="text-primary-foreground/60 text-sm mt-6">
            No spam, ever. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
}
