import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function BoxSkeleton() {
  return (
    <Card className="h-112.5 overflow-hidden">
      <Skeleton className="h-52 w-full rounded-none" />

      <div className="p-5 space-y-4">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-12 w-full" />
      </div>
    </Card>
  );
}
