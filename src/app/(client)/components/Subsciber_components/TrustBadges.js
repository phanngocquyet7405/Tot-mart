import { Shield } from "lucide-react";

export default function TrustBadge() {
  return (
    <section className="py-16 text-center border-t">
      <p className="text-gray-500">Chưa chắc chắn?</p>
      <h3 className="font-bold text-xl mb-6">Hủy bất cứ lúc nào</h3>
      <div className="flex flex-wrap justify-center gap-6">
        {[
          "Thanh toán bảo mật",
          "Miễn phí ship",
          "Hoàn tiền 30 ngày",
          "Hỗ trợ 24/7",
        ].map((item) => (
          <div key={item} className="flex gap-2 items-center">
            <Shield className="w-4 h-4 text-green-500" />
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}
