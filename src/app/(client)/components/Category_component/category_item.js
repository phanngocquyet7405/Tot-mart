import { ChevronRight } from "lucide-react";

export default function CategoryItem({label}) {
    return (
    <div className="flex items-center justify-between bg-white p-4 rounded-xl hover:bg-gray-50 cursor-pointer">
      <span>{label}</span>
      <ChevronRight />
    </div>
  );
}