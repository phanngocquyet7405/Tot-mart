import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function ProductRow({ item, onChange, onRemove }) {
  return (
    <div className="grid grid-cols-12 gap-2 items-center">
      <Input
        className="col-span-5"
        placeholder="Product ID"
        value={item._id}
        onChange={(e) => onChange({ ...item, _id: e.target.value })}
      />
      <Input
        className="col-span-3"
        placeholder="Tên SP"
        value={item.name}
        onChange={(e) => onChange({ ...item, name: e.target.value })}
      />
      <Input
        className="col-span-2"
        type="number"
        placeholder="Giá"
        value={item.price}
        onChange={(e) => onChange({ ...item, price: Number(e.target.value) })}
      />
      <Input
        className="col-span-1"
        type="number"
        min={1}
        placeholder="SL"
        value={item.quantity}
        onChange={(e) =>
          onChange({ ...item, quantity: Number(e.target.value) })
        }
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="col-span-1 h-8 w-8 text-destructive hover:bg-red-50"
        onClick={onRemove}
      >
        <X size={14} />
      </Button>
    </div>
  );
}
