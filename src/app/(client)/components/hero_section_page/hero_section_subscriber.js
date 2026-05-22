import { Badge } from "@/components/ui/badge";

export default function HeroSectionSub() {
  return (
    <section className="relative py-28 px-4 text-center overflow-hidden bg-linear-to-br from-[#1a1a2e] to-[#2C1810]">
      <div className="absolute top-0 left-0 w-72 h-72 rounded-full opacity-10 bg-[#C85C3C] blur-[80px]" />

      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-10 bg-[#B5478A] blur-[100px]" />

      <div className="relative z-10 max-w-3xl mx-auto">
        <Badge className="bg-white/10 text-white mb-6">
          Subscription Boxes
        </Badge>

        <h1 className="text-5xl md:text-7xl font-black text-white">
          Chọn hộp
          <span className="block text-transparent bg-clip-text bg-linear-to-r from-[#C85C3C] to-[#B5478A]">
            của bạn
          </span>
        </h1>

        <p className="text-white/60 mt-5">
          Trải nghiệm những hộp quà tuyển chọn cao cấp mỗi tháng
        </p>
      </div>
    </section>
  );
}
