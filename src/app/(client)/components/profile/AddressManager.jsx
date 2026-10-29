"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import logger from "@/app/util/Logger";

const emptyAddress = {
  country: "",
  city: "",
  district: "",
  address: "",
  phone: "",
  zipCode: "",
};

export function AddressManager({
  addresses,
  onUpsertAddress,
  onDeleteAddress,
  loading,
}) {
  const [newAddress, setNewAddress] = useState(emptyAddress);
  const [editing, setEditing] = useState(null);

  const canCreate = useMemo(
    () =>
      ["country", "city", "district", "address", "phone"].every(
        (key) => newAddress[key].trim().length > 0,
      ),
    [newAddress],
  );

  const onCreateAddress = async () => {
    if (!canCreate) return;
    const addr = { id: `addr-${Date.now()}`, ...newAddress };
    await onUpsertAddress(addr);
    setNewAddress(emptyAddress);
  };

  return (
    <Card className="border-border bg-card shadow-xs rounded-2xl">
      <CardHeader>
        <CardTitle className="text-foreground text-lg font-bold">
          Sổ địa chỉ giao hàng
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* ── CREATE FORM ─────────────────────────────────────────────── */}
        <div className="rounded-xl border border-border/80 bg-muted/30 p-4 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Thêm địa chỉ giao nhận mới
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="new-country" className="text-[11px] font-semibold text-muted-foreground">
                Quốc gia *
              </label>
              <Input
                id="new-country"
                placeholder="Việt Nam"
                value={newAddress.country}
                onChange={(e) =>
                  setNewAddress((p) => ({ ...p, country: e.target.value }))
                }
                className="min-h-11 rounded-xl border-border bg-card text-foreground"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="new-city" className="text-[11px] font-semibold text-muted-foreground">
                Tỉnh / Thành phố *
              </label>
              <Input
                id="new-city"
                placeholder="Hà Nội, TP. Hồ Chí Minh..."
                value={newAddress.city}
                onChange={(e) =>
                  setNewAddress((p) => ({ ...p, city: e.target.value }))
                }
                className="min-h-11 rounded-xl border-border bg-card text-foreground"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="new-district" className="text-[11px] font-semibold text-muted-foreground">
                Quận / Huyện *
              </label>
              <Input
                id="new-district"
                placeholder="Quận Ba Đình, Quận 1..."
                value={newAddress.district}
                onChange={(e) =>
                  setNewAddress((p) => ({ ...p, district: e.target.value }))
                }
                className="min-h-11 rounded-xl border-border bg-card text-foreground"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="new-address" className="text-[11px] font-semibold text-muted-foreground">
                Địa chỉ chi tiết (số nhà, tên đường) *
              </label>
              <Input
                id="new-address"
                placeholder="Số 123 đường ABC..."
                value={newAddress.address}
                onChange={(e) =>
                  setNewAddress((p) => ({ ...p, address: e.target.value }))
                }
                className="min-h-11 rounded-xl border-border bg-card text-foreground"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="new-phone" className="text-[11px] font-semibold text-muted-foreground">
                Số điện thoại liên hệ *
              </label>
              <Input
                id="new-phone"
                type="tel"
                autoComplete="tel"
                placeholder="0912345678"
                value={newAddress.phone}
                onChange={(e) =>
                  setNewAddress((p) => ({ ...p, phone: e.target.value }))
                }
                className="min-h-11 rounded-xl border-border bg-card text-foreground"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="new-zip" className="text-[11px] font-semibold text-muted-foreground">
                Mã bưu điện (Zip code)
              </label>
              <Input
                id="new-zip"
                placeholder="100000"
                value={newAddress.zipCode}
                onChange={(e) =>
                  setNewAddress((p) => ({ ...p, zipCode: e.target.value }))
                }
                className="min-h-11 rounded-xl border-border bg-card text-foreground"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              onClick={onCreateAddress}
              disabled={!canCreate || loading}
              className="min-h-11 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider hover:bg-primary/90 rounded-xl px-4 shadow-xs"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Thêm địa chỉ mới
            </Button>
          </div>
        </div>

        {/* ── LIST ────────────────────────────────────────────────────── */}
        <div className="space-y-3">
          {addresses.length === 0 && (
            <p className="text-xs text-muted-foreground py-4 text-center">
              Chưa có địa chỉ nào được lưu trong sổ địa chỉ của bạn.
            </p>
          )}

          {addresses.map((item) => {
            const itemId = item._id ?? item.id;

            return (
              <div
                key={itemId}
                className="rounded-xl border border-border bg-card p-4 shadow-2xs space-y-2"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <Badge className="bg-primary/10 text-primary border border-primary/20 text-xs font-bold">
                    {item.city}
                  </Badge>

                  <div className="flex items-center gap-2">
                    {/* ── EDIT DIALOG ──────────────────────────────────── */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditing(item)}
                          className="min-h-9 border-border text-foreground hover:bg-muted text-xs font-semibold rounded-lg"
                        >
                          <Pencil className="mr-1.5 h-3.5 w-3.5" />
                          Chỉnh sửa
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card border-border sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-foreground">
                            Chỉnh sửa địa chỉ
                          </DialogTitle>
                          <DialogDescription className="text-muted-foreground text-xs">
                            Cập nhật thông tin giao hàng của bạn.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-3 py-2">
                          <Input
                            placeholder="Quốc gia"
                            value={editing?.country ?? ""}
                            onChange={(e) =>
                              setEditing((p) =>
                                p ? { ...p, country: e.target.value } : p,
                              )
                            }
                            className="min-h-11 rounded-xl border-border bg-card text-foreground"
                          />
                          <Input
                            placeholder="Tỉnh / Thành phố"
                            value={editing?.city ?? ""}
                            onChange={(e) =>
                              setEditing((p) =>
                                p ? { ...p, city: e.target.value } : p,
                              )
                            }
                            className="min-h-11 rounded-xl border-border bg-card text-foreground"
                          />
                          <Input
                            placeholder="Quận / Huyện"
                            value={editing?.district ?? ""}
                            onChange={(e) =>
                              setEditing((p) =>
                                p ? { ...p, district: e.target.value } : p,
                              )
                            }
                            className="min-h-11 rounded-xl border-border bg-card text-foreground"
                          />
                          <Input
                            placeholder="Địa chỉ chi tiết"
                            value={editing?.address ?? ""}
                            onChange={(e) =>
                              setEditing((p) =>
                                p ? { ...p, address: e.target.value } : p,
                              )
                            }
                            className="min-h-11 rounded-xl border-border bg-card text-foreground"
                          />
                          <Input
                            placeholder="Số điện thoại"
                            value={editing?.phone ?? ""}
                            onChange={(e) =>
                              setEditing((p) =>
                                p ? { ...p, phone: e.target.value } : p,
                              )
                            }
                            className="min-h-11 rounded-xl border-border bg-card text-foreground"
                          />
                          <Input
                            placeholder="Mã bưu chính (Zip code)"
                            value={editing?.zipCode ?? ""}
                            onChange={(e) =>
                              setEditing((p) =>
                                p ? { ...p, zipCode: e.target.value } : p,
                              )
                            }
                            className="min-h-11 rounded-xl border-border bg-card text-foreground"
                          />
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={() => {
                              if (editing) {
                                logger.log("[AddressManager] Saving edit:", editing);
                                onUpsertAddress(editing);
                              }
                            }}
                            className="min-h-11 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider hover:bg-primary/90 rounded-xl px-5"
                          >
                            Lưu thay đổi
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {/* ── DELETE ───────────────────────────────────────── */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-h-9 border-destructive/30 text-destructive-text hover:bg-destructive/10 text-xs font-semibold rounded-lg"
                      onClick={() => onDeleteAddress(itemId)}
                      disabled={loading}
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      Xóa
                    </Button>
                  </div>
                </div>

                {/* ── DISPLAY ──────────────────────────────────────────── */}
                <p className="text-xs sm:text-sm text-foreground font-medium">
                  {item.address}, {item.district}, {item.city}, {item.country}
                  {item.zipCode ? ` (Zip: ${item.zipCode})` : ""}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  SĐT: {item.phone}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
