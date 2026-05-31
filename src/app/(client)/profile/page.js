"use client";

import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
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

import { withAuth } from "@/app/middleware/authMiddleware";
import { getTokenUserId } from "@/app/middleware/tokenMiddleware";
import logger from "@/app/util/Logger";

function ProfileSkeleton() {
  return (
    <Card className="border-emerald-100">
      <CardHeader>
        <div className="h-6 w-48 animate-pulse rounded bg-emerald-100" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-12 w-full animate-pulse rounded bg-emerald-100" />
        <div className="h-12 w-full animate-pulse rounded bg-emerald-100" />
        <div className="h-10 w-36 animate-pulse rounded bg-emerald-100" />
      </CardContent>
    </Card>
  );
}

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [updatingAddress, setUpdatingAddress] = useState(false);
  const [updatingCart, setUpdatingCart] = useState(false);
  const userId = getTokenUserId();
  console.log("typeof userId:", typeof userId, "| value:", userId);
  // ── Debug render cycle ────────────────────────────────────────────────────
  logger.log("[ProfilePage] render — loading:", loading, "| user:", user);

  useEffect(() => {
    const loadProfileAndCart = async () => {
      logger.group("[ProfilePage] loadProfileAndCart START");

      try {
        const userId = getTokenUserId();
        logger.log("userId từ token:", userId);

        if (!userId) {
          logger.warn("userId null/undefined → không thể gọi API");
          toast.error("Không xác định được người dùng");
          setLoading(false);
          logger.groupEnd();
          return;
        }

        // ── 1. Gọi API lấy user ────────────────────────────────────────
        logger.log("Gọi userService.getUserById — userId:", userId);
        const userRes = await userService.getUserById(userId);
        logger.log("userService response raw:", userRes);

        let userData = userRes.data;
        logger.log("userData sau parse:", userData);

        try {
          logger.log("Gọi getCartByUserApi — userId:", userId);
          const cartRes = await getCartByUserApi(userId);
          logger.log("cartRes raw:", cartRes);

          const cartData = cartRes.data?.data;
          logger.log("cartData sau parse:", cartData);

          if (cartData && cartData.items) {
            userData.cart = cartData.items.map((item) => ({
              productId: item.productId?._id || item.productId,
              productName: item.productId?.name || "Sản phẩm",
              price: item.productId?.price || 0,
              quantity: item.quantity,
              imageUrl: item.productId?.image || "/images/placeholder.png",
            }));
            logger.log("cart đã map:", userData.cart);
          } else {
            logger.warn("cartData rỗng hoặc không có items:", cartData);
            userData.cart = [];
          }
        } catch (cartErr) {
          logger.warn("Lỗi gọi cart API:", cartErr?.response || cartErr);
          userData.cart = [];
        }

        userData.addreses = userData.addreses || [];
        logger.log("addresses:", userData.addreses);
        logger.log("userData cuối cùng set vào state:", userData);

        setUser(userData);
      } catch (err) {
        logger.error("Lỗi loadProfileAndCart:", err);
        logger.error("err.response:", err?.response);
        logger.error("err.message:", err?.message);
        toast.error("Không thể tải thông tin cá nhân");
      } finally {
        setLoading(false);
        logger.groupEnd();
      }
    };

    loadProfileAndCart();
  }, []);

  const handleProfileSave = async (payload) => {
    if (!user) return;
    const previous = user;
    const userId = user.id || user._id;
    logger.log("handleProfileSave — userId:", userId, "| payload:", payload);

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
      logger.log("updateUser response:", res);
      setUser((prev) => ({ ...prev, ...res.data }));
      toast.success("Cập nhật hồ sơ thành công!");
    } catch (err) {
      logger.error("Lỗi cập nhật hồ sơ:", err?.response || err);
      setUser(previous);
      toast.error("Không thể cập nhật hồ sơ");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpsertAddress = async (address) => {
    if (!user) return;
    const previous = user;
    const userId = user.id || user._id;
    logger.log("handleUpsertAddress — userId:", userId, "| address:", address);

    // 🛠️ SỬA LỖI: Lấy ID duy nhất (hỗ trợ cả id lẫn _id từ DB)
    const addressId = address.id || address._id;

    // Tìm kiếm vị trí địa chỉ trong danh sách hiện tại của State
    const index = user.addreses.findIndex(
      (item) => (item.id || item._id) === addressId,
    );

    const nextAddresses =
      index >= 0
        ? user.addreses.map((item) =>
            (item.id || item._id) === addressId ? address : item,
          )
        : [address, ...user.addreses];

    setUser({ ...user, addreses: nextAddresses });
    setUpdatingAddress(true);

    try {
      let res;
      // Nếu địa chỉ tạm thời được tạo ở Client bắt đầu bằng "addr-"
      if (addressId && String(addressId).startsWith("addr-")) {
        const { id, _id, ...addressData } = address;
        logger.log("addAddress — addressData:", addressData);
        res = await userService.addAddress(userId, addressData);
      } else {
        logger.log("editAddress — addressId:", addressId);
        res = await userService.editAddress(userId, addressId, address);
      }
      logger.log("upsertAddress response:", res);

      setUser((prev) => ({
        ...prev,
        addreses: res.data.addreses || nextAddresses,
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

  const handleDeleteAddress = async (addressId) => {
    if (!user) return;
    const previous = user;
    const userId = user.id || user._id;
    logger.log(
      "🗑️ handleDeleteAddress — userId:",
      userId,
      "| addressId:",
      addressId,
    );

    // 🛠️ SỬA LỖI: Lọc bỏ địa chỉ khớp với ID truyền vào (kiểm tra cả id và _id)
    const nextAddresses = user.addreses.filter(
      (item) => (item.id || item._id) !== addressId,
    );
    setUser({ ...user, addreses: nextAddresses });
    setUpdatingAddress(true);

    try {
      const res = await userService.deleteAddress(userId, addressId);
      logger.log("deleteAddress response:", res);
      setUser((prev) => ({
        ...prev,
        addreses: res.data.addreses || nextAddresses,
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

  const handleChangeQuantity = async (productId, nextQuantity) => {
    if (!user || nextQuantity < 1) return;
    const previous = user;
    const userId = user.id || user._id;
    logger.log(
      "handleChangeQuantity — productId:",
      productId,
      "| qty:",
      nextQuantity,
    );

    const nextCart = user.cart.map((item) =>
      item.productId === productId ? { ...item, quantity: nextQuantity } : item,
    );
    setUser({ ...user, cart: nextCart });
    setUpdatingCart(true);

    try {
      await updateCartItemApi(productId, {
        userId: userId,
        productId: productId,
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

  const handleRemoveItem = async (productId) => {
    if (!user) return;
    const previous = user;
    const userId = user.id || user._id;
    logger.log("handleRemoveItem — productId:", productId);

    const nextCart = user.cart.filter((item) => item.productId !== productId);
    setUser({ ...user, cart: nextCart });
    setUpdatingCart(true);

    try {
      await deleteFromCartApi(productId, {
        userId: userId,
        productId: productId,
      });
      toast.success("Đã bỏ sản phẩm khỏi giỏ");
    } catch (err) {
      logger.error("Lỗi xóa sản phẩm:", err?.response || err);
      setUser(previous);
      toast.error("Lỗi khi xóa sản phẩm");
    } finally {
      setUpdatingCart(false);
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-b from-emerald-50 to-white px-4 py-8">
      <Toaster richColors position="top-right" />
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            My Profile
          </h1>
          <p className="text-sm text-slate-600">
            Quản lý thông tin cá nhân, địa chỉ giao hàng và giỏ hàng.
          </p>
        </div>

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
      </div>
    </main>
  );
}

export default withAuth(ProfilePage);
