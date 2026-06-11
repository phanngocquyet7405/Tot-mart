/**
 * page.js — Trang hồ sơ cá nhân
 * Route: /profile
 *
 * Layout (Nav, Footer, Toaster, withAuth, padding) do layout.js xử lý.
 * Page này chỉ chịu trách nhiệm load data + render tab content.
 */

"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AddressManager } from "../components/profile/AddressManager";
import { CartManager } from "../components/profile/CartManager";
import { ProfileInfo } from "../components/profile/ProfileInfo";
import { ProfileTabs } from "../components/profile/ProfileTabs";
import { CardContent, Card, CardHeader } from "@/components/ui/card";

import { userService } from "@/app/services/api/userService";
import {
  getCartByUserApi,
  updateCartItemApi,
  deleteFromCartApi,
} from "@/app/services/api/productServices";

import { getTokenUserId } from "@/app/middleware/tokenMiddleware";
import logger from "@/app/util/Logger";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <Card className="border-[#F0DDD5]">
      <CardHeader>
        <div className="h-6 w-48 animate-pulse rounded bg-[#F0DDD5]" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-12 w-full animate-pulse rounded bg-[#F0DDD5]" />
        <div className="h-12 w-full animate-pulse rounded bg-[#F0DDD5]" />
        <div className="h-10 w-36 animate-pulse rounded bg-[#F0DDD5]" />
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [updatingAddress, setUpdatingAddress] = useState(false);
  const [updatingCart, setUpdatingCart] = useState(false);

  // ── Load user + cart ────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      logger.group("[ProfilePage] loadProfileAndCart START");
      try {
        const userId = getTokenUserId();
        logger.log("userId từ token:", userId);

        if (!userId) {
          logger.warn("userId null → không thể gọi API");
          toast.error("Không xác định được người dùng");
          return;
        }

        // 1. User profile
        const userRes = await userService.getMe();
        let userData = userRes.data?.data || userRes.data;

        // 2. Cart
        try {
          const cartRes = await getCartByUserApi(userId);
          const cartData = cartRes.data?.data;
          userData.cart =
            cartData?.items?.map((item) => ({
              productId: item.productId?._id || item.productId,
              productName: item.productId?.name || "Sản phẩm",
              price: item.productId?.price || 0,
              quantity: item.quantity,
              imageUrl: item.productId?.image || "/images/placeholder.png",
            })) ?? [];
        } catch (cartErr) {
          logger.warn("Lỗi cart API:", cartErr?.response || cartErr);
          userData.cart = [];
        }

        userData.addreses = userData.addreses || [];
        setUser(userData);
      } catch (err) {
        logger.error("Lỗi loadProfileAndCart:", err);
        toast.error("Không thể tải thông tin cá nhân");
      } finally {
        setLoading(false);
        logger.groupEnd();
      }
    })();
  }, []);

  // ── handleProfileSave ───────────────────────────────────────────────────────
  const handleProfileSave = async (payload) => {
    if (!user) return;
    const previous = user;
    const userId = user._id || user.id;

    const optimistic = {
      ...user,
      name: payload.name,
      email: payload.email,
      avatar: {
        url: payload.avatarUrl,
        public_id: user.avatar?.public_id || "local-preview",
      },
    };
    setUser(optimistic);
    setSavingProfile(true);

    try {
      const res = await userService.updateUser(userId, {
        name: payload.name,
        email: payload.email,
        avatar: optimistic.avatar,
      });
      const updated = res.data?.data || res.data;
      setUser((prev) => ({ ...prev, ...updated }));
      toast.success("Cập nhật hồ sơ thành công!");
    } catch (err) {
      logger.error("Lỗi cập nhật hồ sơ:", err?.response || err);
      setUser(previous);
      toast.error("Không thể cập nhật hồ sơ");
    } finally {
      setSavingProfile(false);
    }
  };

  // ── handleUpsertAddress ─────────────────────────────────────────────────────
  const handleUpsertAddress = async (address) => {
    if (!user) return;
    const previous = user;
    const userId = user._id || user.id;
    const addressId = address._id || address.id;

    const index = user.addreses.findIndex(
      (item) => (item._id || item.id) === addressId,
    );
    const nextAddresses =
      index >= 0
        ? user.addreses.map((item) =>
            (item._id || item.id) === addressId ? address : item,
          )
        : [address, ...user.addreses];

    setUser({ ...user, addreses: nextAddresses });
    setUpdatingAddress(true);

    try {
      let res;
      if (addressId && String(addressId).startsWith("addr-")) {
        const { id, _id, ...addressData } = address;
        res = await userService.addAddress(userId, addressData);
      } else {
        const { id, _id, __v, ...addressData } = address;
        res = await userService.editAddress(userId, addressId, addressData);
      }
      const updatedUser = res.data?.data || res.data;
      setUser((prev) => ({
        ...prev,
        addreses: updatedUser?.addreses || nextAddresses,
      }));
      toast.success("Đã lưu địa chỉ");
    } catch (err) {
      logger.error("Lỗi lưu địa chỉ:", err?.response || err);
      setUser(previous);
      toast.error("Không thể lưu địa chỉ");
    } finally {
      setUpdatingAddress(false);
    }
  };

  // ── handleDeleteAddress ─────────────────────────────────────────────────────
  const handleDeleteAddress = async (addressId) => {
    if (!user) return;
    const previous = user;
    const userId = user._id || user.id;
    const nextAddresses = user.addreses.filter(
      (item) => (item._id || item.id) !== addressId,
    );

    setUser({ ...user, addreses: nextAddresses });
    setUpdatingAddress(true);

    try {
      const res = await userService.deleteAddress(userId, addressId);
      const updatedUser = res.data?.data || res.data;
      setUser((prev) => ({
        ...prev,
        addreses: updatedUser?.addreses || nextAddresses,
      }));
      toast.success("Đã xóa địa chỉ");
    } catch (err) {
      logger.error("Lỗi xóa địa chỉ:", err?.response || err);
      setUser(previous);
      toast.error("Lỗi khi xóa địa chỉ");
    } finally {
      setUpdatingAddress(false);
    }
  };

  // ── handleChangeQuantity ────────────────────────────────────────────────────
  const handleChangeQuantity = async (productId, nextQuantity) => {
    if (!user || nextQuantity < 1) return;
    const previous = user;
    const userId = user._id || user.id;

    setUser({
      ...user,
      cart: user.cart.map((item) =>
        item.productId === productId
          ? { ...item, quantity: nextQuantity }
          : item,
      ),
    });
    setUpdatingCart(true);

    try {
      await updateCartItemApi(productId, {
        userId,
        productId,
        quantity: nextQuantity,
      });
    } catch (err) {
      logger.error("Lỗi cập nhật số lượng:", err?.response || err);
      setUser(previous);
      toast.error("Không thể cập nhật số lượng");
    } finally {
      setUpdatingCart(false);
    }
  };

  // ── handleRemoveItem ────────────────────────────────────────────────────────
  const handleRemoveItem = async (productId) => {
    if (!user) return;
    const previous = user;
    const userId = user._id || user.id;

    setUser({
      ...user,
      cart: user.cart.filter((item) => item.productId !== productId),
    });
    setUpdatingCart(true);

    try {
      await deleteFromCartApi(productId, { userId, productId });
      toast.success("Đã bỏ sản phẩm khỏi giỏ");
    } catch (err) {
      logger.error("Lỗi xóa sản phẩm:", err?.response || err);
      setUser(previous);
      toast.error("Lỗi khi xóa sản phẩm");
    } finally {
      setUpdatingCart(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-[#2C1810] md:text-3xl tracking-tight">
          Hồ sơ cá nhân
        </h1>
        <p className="text-sm text-stone-500">
          Quản lý thông tin cá nhân, địa chỉ giao hàng và giỏ hàng.
        </p>
      </div>

      {/* Content */}
      {loading || !user ? (
        <ProfileSkeleton />
      ) : (
        <ProfileTabs
          profileContent={
            <ProfileInfo
              name={user.name || ""}
              email={user.email || ""}
              avatarUrl={user.avatar?.url || ""}
              onSave={handleProfileSave}
              saving={savingProfile}
            />
          }
          addressContent={
            <AddressManager
              addresses={user.addreses}
              onUpsertAddress={handleUpsertAddress}
              onDeleteAddress={handleDeleteAddress}
              loading={updatingAddress}
            />
          }
          cartContent={
            <CartManager
              cart={user.cart}
              loading={updatingCart}
              onChangeQuantity={handleChangeQuantity}
              onRemoveItem={handleRemoveItem}
            />
          }
        />
      )}
    </main>
  );
}
