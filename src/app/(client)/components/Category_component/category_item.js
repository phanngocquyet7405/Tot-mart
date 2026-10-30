import { ChevronRight } from "lucide-react";

export default function CategoryItem({label}) {
    return (
    <div className="flex items-center justify-between bg-card border border-border p-4 rounded-xl hover:bg-muted cursor-pointer transition-colors text-foreground">
      <span>{label}</span>
      <ChevronRight />
    </div>
  );
}