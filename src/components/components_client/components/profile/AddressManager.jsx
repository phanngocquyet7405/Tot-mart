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
    () => Object.values(newAddress).every((value) => value.trim().length > 0),
    [newAddress],
  );

  const onCreateAddress = async () => {
    if (!canCreate) return;
    // id dạng "addr-timestamp" → page.js nhận biết đây là CREATE
    const addr = { id: `addr-${Date.now()}`, ...newAddress };
    logger.log("[AddressManager] Creating address:", addr);
    await onUpsertAddress(addr);
    setNewAddress(emptyAddress);
  };

  return (
    <Card className="border-emerald-100">
      <CardHeader>
        <CardTitle className="text-emerald-700">Address Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* ── CREATE FORM ─────────────────────────────────────────────── */}
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            placeholder="Country"
            value={newAddress.country}
            onChange={(e) =>
              setNewAddress((p) => ({ ...p, country: e.target.value }))
            }
          />
          <Input
            placeholder="City"
            value={newAddress.city}
            onChange={(e) =>
              setNewAddress((p) => ({ ...p, city: e.target.value }))
            }
          />
          <Input
            placeholder="District"
            value={newAddress.district}
            onChange={(e) =>
              setNewAddress((p) => ({ ...p, district: e.target.value }))
            }
          />
          <Input
            placeholder="Street address"
            value={newAddress.address}
            onChange={(e) =>
              setNewAddress((p) => ({ ...p, address: e.target.value }))
            }
          />
          <Input
            placeholder="Phone"
            value={newAddress.phone}
            onChange={(e) =>
              setNewAddress((p) => ({ ...p, phone: e.target.value }))
            }
          />
          <Input
            placeholder="Zip Code"
            value={newAddress.zipCode}
            onChange={(e) =>
              setNewAddress((p) => ({ ...p, zipCode: e.target.value }))
            }
          />
        </div>

        <Button
          onClick={onCreateAddress}
          disabled={!canCreate || loading}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Address
        </Button>

        {/* ── LIST ────────────────────────────────────────────────────── */}
        <div className="space-y-3">
          {addresses.length === 0 && (
            <p className="text-sm text-slate-500">No addresses saved yet.</p>
          )}

          {addresses.map((item) => {
            // FIX: MongoDB trả về _id, client tạm dùng id
            const itemId = item._id ?? item.id;

            return (
              <div
                key={itemId}
                className="rounded-lg border border-emerald-100 bg-white p-4 shadow-sm"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <Badge className="bg-emerald-50 text-emerald-700">
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
                          className="border-emerald-200 text-emerald-700"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Address</DialogTitle>
                          <DialogDescription>
                            Update your delivery information.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-3">
                          <Input
                            placeholder="Country"
                            value={editing?.country ?? ""}
                            onChange={(e) =>
                              setEditing((p) =>
                                p ? { ...p, country: e.target.value } : p,
                              )
                            }
                          />
                          <Input
                            placeholder="City"
                            value={editing?.city ?? ""}
                            onChange={(e) =>
                              setEditing((p) =>
                                p ? { ...p, city: e.target.value } : p,
                              )
                            }
                          />
                          <Input
                            placeholder="District"
                            value={editing?.district ?? ""}
                            onChange={(e) =>
                              setEditing((p) =>
                                p ? { ...p, district: e.target.value } : p,
                              )
                            }
                          />
                          <Input
                            placeholder="Address"
                            value={editing?.address ?? ""}
                            onChange={(e) =>
                              setEditing((p) =>
                                p ? { ...p, address: e.target.value } : p,
                              )
                            }
                          />
                          <Input
                            placeholder="Phone"
                            value={editing?.phone ?? ""}
                            onChange={(e) =>
                              setEditing((p) =>
                                p ? { ...p, phone: e.target.value } : p,
                              )
                            }
                          />
                          <Input
                            placeholder="Zip Code"
                            value={editing?.zipCode ?? ""}
                            onChange={(e) =>
                              setEditing((p) =>
                                p ? { ...p, zipCode: e.target.value } : p,
                              )
                            }
                          />
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={() => {
                              if (editing) {
                                logger.log(
                                  "[AddressManager] Saving edit:",
                                  editing,
                                );
                                onUpsertAddress(editing);
                              }
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            Save Changes
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {/* ── DELETE ───────────────────────────────────────── */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                      // FIX: dùng itemId (_id từ DB) thay vì item.id
                      onClick={() => onDeleteAddress(itemId)}
                      disabled={loading}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>

                {/* ── DISPLAY ──────────────────────────────────────────── */}
                <p className="text-sm text-slate-700">
                  {item.address}, {item.district}, {item.city}, {item.country}
                  {item.zipCode ? `, ${item.zipCode}` : ""}
                </p>
                <p className="text-sm text-slate-500">{item.phone}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
