# Phụ Lục Toàn Văn Git Diff (Phase F08d + F03c)

> Snapshot tham chiếu: fe/f-fix HEAD 3ddb8da vs Working Tree

`diff
diff --git a/next.config.mjs b/next.config.mjs
index 98f5466..e10a8d8 100644
--- a/next.config.mjs
+++ b/next.config.mjs
@@ -88,11 +88,89 @@ export default withNextIntl({
       });
     }
 
+    const publicCatalogRoutes = [
+      "/",
+      "/homepage",
+      "/products",
+      "/products/:path*",
+      "/brands",
+      "/brands/:path*",
+      "/categories",
+      "/categories/:path*",
+      "/box",
+      "/box/:path*",
+    ];
+
+    const privateRoutes = [
+      "/checkout",
+      "/checkout/:path*",
+      "/cart",
+      "/cart/:path*",
+      "/profile",
+      "/profile/:path*",
+    ];
+
+    const sessionCookieMissing = [
+      { type: "cookie", key: "token" },
+      { type: "cookie", key: "refreshToken" },
+    ];
+
     return [
       {
         source: "/:path*",
         headers: commonHeaders,
       },
+      ...publicCatalogRoutes.map((source) => ({
+        source,
+        missing: sessionCookieMissing,
+        headers: [
+          {
+            key: "Cache-Control",
+            value: "public, s-maxage=60, stale-while-revalidate=300",
+          },
+          {
+            key: "Vary",
+            value: "Accept-Encoding, Cookie",
+          },
+        ],
+      })),
+      ...publicCatalogRoutes.map((source) => ({
+        source,
+        has: [{ type: "cookie", key: "token" }],
+        headers: [
+          {
+            key: "Cache-Control",
+            value: "private, no-cache, no-store, max-age=0, must-revalidate",
+          },
+          {
+            key: "Vary",
+            value: "Accept-Encoding, Cookie",
+          },
+        ],
+      })),
+      ...publicCatalogRoutes.map((source) => ({
+        source,
+        has: [{ type: "cookie", key: "refreshToken" }],
+        headers: [
+          {
+            key: "Cache-Control",
+            value: "private, no-cache, no-store, max-age=0, must-revalidate",
+          },
+          {
+            key: "Vary",
+            value: "Accept-Encoding, Cookie",
+          },
+        ],
+      })),
+      ...privateRoutes.map((source) => ({
+        source,
+        headers: [
+          {
+            key: "Cache-Control",
+            value: "private, no-cache, no-store, max-age=0, must-revalidate",
+          },
+        ],
+      })),
     ];
   },
 });
diff --git a/package.json b/package.json
index f5cc3bc..4ed9599 100644
--- a/package.json
+++ b/package.json
@@ -13,7 +13,11 @@
     "test:e2e:ui": "node scripts/checkout-browser-e2e.cjs",
     "test:e2e:purchase": "node scripts/purchase-ui-regression.cjs",
     "test:browser:services": "node scripts/verify-checkout-attempts.cjs --gaps",
-    "test:fixtures": "node scripts/verify-checkout-attempts.cjs --serve"
+    "test:fixtures": "node scripts/verify-checkout-attempts.cjs --serve",
+    "test:e2e:bootstrap": "node scripts/bootstrap-e2e.cjs",
+    "test:smoke": "node scripts/run-f07-smoke.cjs",
+    "test:perf": "node scripts/measure-performance.cjs",
+    "run-f07-suite": "node scripts/run-f07-smoke.cjs"
   },
   "dependencies": {
     "@fontsource/playfair-display": "^5.3.0",
diff --git a/scripts/run-f02-suite.cjs b/scripts/run-f02-suite.cjs
index 32926fc..0954ef0 100644
--- a/scripts/run-f02-suite.cjs
+++ b/scripts/run-f02-suite.cjs
@@ -4,7 +4,7 @@ const { spawn, execSync } = require('node:child_process');
 const fs = require('node:fs');
 const path = require('node:path');
 
-const beRoot = process.env.TOTMART_BE_ROOT || process.argv[2] || 'C:/Users/84862/Desktop/totmart/TotMartAPI';
+const beRoot = process.env.TOTMART_BE_ROOT || process.argv[2] || 'C:/Users/84862/Desktop/totmart/be-pinned';
 const FE_PORT = 3217;
 const FE_ORIGIN = `http://localhost:${FE_PORT}`;
 
@@ -57,7 +57,7 @@ async function main() {
     fs.unlinkSync(runtimeFile);
   }
 
-  const FIXTURE_PORT = process.env.FE_TEST_API_PORT || '3101';
+  const FIXTURE_PORT = process.env.FE_TEST_API_PORT || '3102';
   console.log(`1. Starting BE fixture server (--serve) on port ${FIXTURE_PORT}...`);
   const fixtureProc = spawn('node', ['scripts/verify-checkout-attempts.cjs', beRoot, '--serve'], {
     stdio: ['pipe', 'pipe', 'inherit'],
diff --git a/src/app/(admin)/components/box/BoxFormDialog.jsx b/src/app/(admin)/components/box/BoxFormDialog.jsx
index 4ab394e..cdf0c05 100644
--- a/src/app/(admin)/components/box/BoxFormDialog.jsx
+++ b/src/app/(admin)/components/box/BoxFormDialog.jsx
@@ -310,11 +310,19 @@ export function BoxFormDialog({ open, onOpenChange, box, onSuccess }) {
       onSuccess?.();
       onOpenChange(false);
     } catch (err) {
-      const msg =
+      const status = err?.response?.status;
+      const requestId = err?.response?.data?.requestId || err?.requestId || err?.response?.headers?.["x-request-id"];
+      let msg =
         err?.response?.data?.errors?.map((e) => e.message).join(" | ") ||
         err?.response?.data?.message ||
         err?.message ||
         "Đã có lỗi xảy ra";
+      if (status >= 500) {
+        msg = "Lỗi hệ thống. Vui lòng thử lại.";
+      }
+      if (requestId) {
+        msg = `${msg} (Request ID: ${requestId})`;
+      }
       toast.error(msg);
     } finally {
       setIsSaving(false);
diff --git a/src/app/(client)/brands/[slug]/page.js b/src/app/(client)/brands/[slug]/page.js
index 1534bf7..658dc73 100644
--- a/src/app/(client)/brands/[slug]/page.js
+++ b/src/app/(client)/brands/[slug]/page.js
@@ -1,4 +1,4 @@
-import { notFound } from "next/navigation";
+import { notFound, permanentRedirect } from "next/navigation";
 import BrandDetailClient from "./BrandDetailClient";
 import {
   getServerBrandDetail,
@@ -7,21 +7,25 @@ import {
 
 export const revalidate = 60;
 
-export async function generateMetadata({ params: paramsPromise }) {
+export async function generateMetadata({ params: paramsPromise, searchParams: searchParamsPromise }) {
   const params = await paramsPromise;
+  const searchParams = searchParamsPromise ? await searchParamsPromise : {};
   const slug = params?.slug || "";
   const detail = await getServerBrandDetail(slug);
 
   if (!detail || !detail.brand) {
-    return {
-      title: "Không tìm thấy thương hiệu | TotMart",
-      description: "Gian hàng thương hiệu không tồn tại hoặc đã ngừng hoạt động.",
-    };
+    notFound();
   }
 
   const { brand } = detail;
+  const canonicalSlug = brand.slug || String(brand._id);
+  if (slug !== canonicalSlug) {
+    const qs = new URLSearchParams(searchParams).toString();
+    permanentRedirect(`/brands/${canonicalSlug}${qs ? `?${qs}` : ""}`);
+  }
+
   const siteUrl = getPublicSiteUrl();
-  const canonicalUrl = `${siteUrl}/brands/${brand.slug || brand._id}`;
+  const canonicalUrl = `${siteUrl}/brands/${canonicalSlug}`;
   const title = `${brand.name} | Thương hiệu TotMart`;
   const description =
     brand.description ||
@@ -44,8 +48,9 @@ export async function generateMetadata({ params: paramsPromise }) {
   };
 }
 
-export default async function Page({ params: paramsPromise }) {
+export default async function Page({ params: paramsPromise, searchParams: searchParamsPromise }) {
   const params = await paramsPromise;
+  const searchParams = searchParamsPromise ? await searchParamsPromise : {};
   const slug = params?.slug || "";
   const detail = await getServerBrandDetail(slug);
 
@@ -54,6 +59,11 @@ export default async function Page({ params: paramsPromise }) {
   }
 
   const { brand } = detail;
+  const canonicalSlug = brand.slug || String(brand._id);
+  if (slug !== canonicalSlug) {
+    const qs = new URLSearchParams(searchParams).toString();
+    permanentRedirect(`/brands/${canonicalSlug}${qs ? `?${qs}` : ""}`);
+  }
 
   return (
     <>
diff --git a/src/app/(client)/categories/[id]/page.js b/src/app/(client)/categories/[id]/page.js
index d33a913..a1ce1aa 100644
--- a/src/app/(client)/categories/[id]/page.js
+++ b/src/app/(client)/categories/[id]/page.js
@@ -1,4 +1,4 @@
-import { notFound } from "next/navigation";
+import { notFound, permanentRedirect } from "next/navigation";
 import CategoryDetailClient from "./CategoryDetailClient";
 import {
   getServerCategoryDetail,
@@ -7,21 +7,25 @@ import {
 
 export const revalidate = 60;
 
-export async function generateMetadata({ params: paramsPromise }) {
+export async function generateMetadata({ params: paramsPromise, searchParams: searchParamsPromise }) {
   const params = await paramsPromise;
+  const searchParams = searchParamsPromise ? await searchParamsPromise : {};
   const id = params?.id || "";
   const detail = await getServerCategoryDetail(id);
 
   if (!detail || !detail.category) {
-    return {
-      title: "Không tìm thấy danh mục | TotMart",
-      description: "Danh mục sản phẩm không tồn tại hoặc đã ngừng hoạt động.",
-    };
+    notFound();
   }
 
   const { category } = detail;
+  const canonicalId = category.slug || String(category._id);
+  if (id !== canonicalId) {
+    const qs = new URLSearchParams(searchParams).toString();
+    permanentRedirect(`/categories/${canonicalId}${qs ? `?${qs}` : ""}`);
+  }
+
   const siteUrl = getPublicSiteUrl();
-  const canonicalUrl = `${siteUrl}/categories/${category.slug || category._id}`;
+  const canonicalUrl = `${siteUrl}/categories/${canonicalId}`;
   const title = `${category.name} | Danh mục TotMart`;
   const description =
     category.description ||
@@ -44,8 +48,9 @@ export async function generateMetadata({ params: paramsPromise }) {
   };
 }
 
-export default async function Page({ params: paramsPromise }) {
+export default async function Page({ params: paramsPromise, searchParams: searchParamsPromise }) {
   const params = await paramsPromise;
+  const searchParams = searchParamsPromise ? await searchParamsPromise : {};
   const id = params?.id || "";
   const detail = await getServerCategoryDetail(id);
 
@@ -54,6 +59,11 @@ export default async function Page({ params: paramsPromise }) {
   }
 
   const { category } = detail;
+  const canonicalId = category.slug || String(category._id);
+  if (id !== canonicalId) {
+    const qs = new URLSearchParams(searchParams).toString();
+    permanentRedirect(`/categories/${canonicalId}${qs ? `?${qs}` : ""}`);
+  }
 
   return (
     <>
diff --git a/src/app/(client)/components/Checkout_component/OrderSuccessScreen.js b/src/app/(client)/components/Checkout_component/OrderSuccessScreen.js
index e58840b..de2833b 100644
--- a/src/app/(client)/components/Checkout_component/OrderSuccessScreen.js
+++ b/src/app/(client)/components/Checkout_component/OrderSuccessScreen.js
@@ -7,11 +7,12 @@
 
 
 import { useRouter } from "next/navigation";
-import { motion } from "framer-motion";
+import { motion, useReducedMotion } from "framer-motion";
 import { CheckCircle2, ShoppingBag, ArrowRight } from "lucide-react";
 
 export function OrderSuccessScreen({ onNew, submitting = false }) {
   const router = useRouter();
+  const shouldReduceMotion = useReducedMotion();
 
   return (
     <div className="min-h-screen bg-[#FFFAF8] flex items-center justify-center px-4">
@@ -22,16 +23,16 @@ export function OrderSuccessScreen({ onNew, submitting = false }) {
       </div>
 
       <motion.div
-        initial={{ opacity: 0, scale: 0.92 }}
+        initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.92 }}
         animate={{ opacity: 1, scale: 1 }}
-        transition={{ duration: 0.4, ease: "easeOut" }}
+        transition={{ duration: shouldReduceMotion ? 0 : 0.4, ease: "easeOut" }}
         className="relative text-center max-w-md w-full"
       >
         {/* Icon */}
         <motion.div
-          initial={{ scale: 0, rotate: -15 }}
+          initial={shouldReduceMotion ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -15 }}
           animate={{ scale: 1, rotate: 0 }}
-          transition={{ delay: 0.2, type: "spring", stiffness: 240, damping: 18 }}
+          transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.2, type: "spring", stiffness: 240, damping: 18 }}
           className="w-24 h-24 rounded-3xl bg-emerald-50 border-2 border-emerald-600/20 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-600/10"
         >
           <CheckCircle2 size={48} className="text-emerald-600" />
@@ -39,9 +40,9 @@ export function OrderSuccessScreen({ onNew, submitting = false }) {
 
         {/* Text */}
         <motion.div
-          initial={{ opacity: 0, y: 12 }}
+          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
           animate={{ opacity: 1, y: 0 }}
-          transition={{ delay: 0.35 }}
+          transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.35 }}
         >
           <h1 className="text-3xl font-black text-stone-900 mb-3 tracking-tight">
             Đặt hàng thành công!
@@ -54,9 +55,9 @@ export function OrderSuccessScreen({ onNew, submitting = false }) {
 
         {/* CTAs */}
         <motion.div
-          initial={{ opacity: 0, y: 12 }}
+          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
           animate={{ opacity: 1, y: 0 }}
-          transition={{ delay: 0.5 }}
+          transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.5 }}
           className="flex flex-col gap-3"
         >
           <button
@@ -87,9 +88,9 @@ export function OrderSuccessScreen({ onNew, submitting = false }) {
           {[0, 1, 2].map((i) => (
             <motion.div
               key={i}
-              initial={{ scale: 0 }}
+              initial={shouldReduceMotion ? { scale: 1 } : { scale: 0 }}
               animate={{ scale: 1 }}
-              transition={{ delay: 0.6 + i * 0.1, type: "spring" }}
+              transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.6 + i * 0.1, type: "spring" }}
               className={`rounded-full ${i === 1 ? "w-3 h-3 bg-[#C85C3C]" : "w-1.5 h-1.5 bg-stone-200"}`}
             />
           ))}
diff --git a/src/app/(client)/components/Checkout_component/PaymentStep.js b/src/app/(client)/components/Checkout_component/PaymentStep.js
index 727d853..54cb6b5 100644
--- a/src/app/(client)/components/Checkout_component/PaymentStep.js
+++ b/src/app/(client)/components/Checkout_component/PaymentStep.js
@@ -40,7 +40,7 @@ function PaymentMethodCard({ method, selected, onSelect }) {
   return (
     <label
       className={[
-        "flex items-center gap-4 p-4 rounded-xl border transition-colors duration-200",
+        "flex items-center gap-4 p-4 rounded-xl border transition-colors duration-200 motion-reduce:transition-none",
         "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#C85C3C]",
         disabled
           ? "border-[#F0DDD5] bg-stone-50 opacity-60 cursor-not-allowed"
@@ -77,7 +77,7 @@ function PaymentMethodCard({ method, selected, onSelect }) {
       ) : (
         <span
           className={[
-            "grid place-items-center w-5 h-5 rounded-full border-2 shrink-0 transition-colors duration-200",
+            "grid place-items-center w-5 h-5 rounded-full border-2 shrink-0 transition-colors duration-200 motion-reduce:transition-none",
             selected ? "border-[#C85C3C] bg-[#C85C3C]" : "border-stone-300 bg-white",
           ].join(" ")}
           aria-hidden="true"
@@ -186,7 +186,7 @@ function CopyRow({ label, value, display, strong }) {
         type="button"
         onClick={copy}
         aria-label={`Sao chép ${label.toLowerCase()}`}
-        className="inline-flex items-center gap-1.5 rounded-lg border border-[#F0DDD5] px-2.5 py-1.5 text-xs font-semibold text-[#B14B2D] hover:bg-[#FFF0EB] transition-colors duration-200 shrink-0"
+        className="inline-flex items-center gap-1.5 rounded-lg border border-[#F0DDD5] px-2.5 py-1.5 text-xs font-semibold text-[#B14B2D] hover:bg-[#FFF0EB] transition-colors duration-200 motion-reduce:transition-none shrink-0"
       >
         {copied ? <Check size={13} /> : <Copy size={13} />}
         {copied ? "Đã chép" : "Chép"}
@@ -196,10 +196,37 @@ function CopyRow({ label, value, display, strong }) {
 }
 
 function SepayQrPanel({ qrUrl, onlineAmount, paymentCode, paymentStatus, onRecheck }) {
-  const isTimeout = paymentStatus === "timeout";
   const parsed = useMemo(() => parseQr(qrUrl), [qrUrl]);
   const [failedUrl, setFailedUrl] = useState(null);
 
+  const isTimeout = paymentStatus === "timeout";
+  const isUnderpaid = paymentStatus === "underpaid";
+  const isNonPayable = paymentStatus === "cancelled" || paymentStatus === "expired" || paymentStatus === "on_hold";
+
+  if (isNonPayable) {
+    return (
+      <SectionCard title="Trạng thái đơn hàng" icon={<AlertTriangle size={16} />}>
+        <div role="alert" className="p-5 rounded-2xl border border-rose-200 bg-rose-50 text-rose-900 space-y-3">
+          <h3 className="font-bold text-base">
+            {paymentStatus === "on_hold"
+              ? "Đơn hàng đang tạm giữ"
+              : "Mã thanh toán không còn hiệu lực"}
+          </h3>
+          <p className="text-sm leading-relaxed text-rose-800">
+            {paymentStatus === "on_hold"
+              ? "Đơn hàng đang được tạm giữ để kiểm tra tồn kho. TotMart đã ghi nhận thanh toán và đang xử lý điều phối tồn kho."
+              : "Đơn hàng không còn hiệu lực nhận thanh toán. Nếu bạn đã chuyển khoản, khoản tiền sẽ vào quy trình đối soát hoàn tiền hoặc liên hệ hỗ trợ TotMart kèm mã thanh toán để được hỗ trợ."}
+          </p>
+          {paymentCode && (
+            <div className="pt-2 border-t border-rose-200 text-xs font-mono text-rose-700">
+              Mã thanh toán: <span className="font-bold">{paymentCode}</span>
+            </div>
+          )}
+        </div>
+      </SectionCard>
+    );
+  }
+
   // qrUrl thiếu/hỏng (vd. BE chưa cấu hình SEPAY_BANK_ACCOUNT / SEPAY_BANK_NAME
   // → acc=undefined&bank=undefined): không vẽ ảnh vỡ, báo rõ cho khách.
   const configBroken = !qrUrl || isBlank(parsed.acc) || isBlank(parsed.bank);
@@ -211,6 +238,13 @@ function SepayQrPanel({ qrUrl, onlineAmount, paymentCode, paymentStatus, onReche
 
   return (
     <SectionCard title="Quét mã để thanh toán" icon={<QrCode size={16} />}>
+      {isUnderpaid && (
+        <div role="status" className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900">
+          <p className="text-sm font-semibold">
+            Hệ thống đã nhận một phần tiền thanh toán. Vui lòng quét mã bên dưới hoặc chuyển tiếp số tiền còn lại ({formatCurrency(amount)}) để hoàn tất đơn hàng.
+          </p>
+        </div>
+      )}
       <div className="grid gap-6 md:grid-cols-[232px_1fr]">
         {/* QR */}
         <div className="mx-auto md:mx-0 w-full max-w-[232px]">
@@ -324,7 +358,12 @@ export function PaymentStep({
   // chuyển thẳng sang OrderSuccessScreen khi orderSuccess = true.
   const isAwaitingPayment =
     paymentMethod === "online" &&
-    (paymentStatus === "awaiting_payment" || paymentStatus === "timeout");
+    (paymentStatus === "awaiting_payment" ||
+     paymentStatus === "underpaid" ||
+     paymentStatus === "timeout" ||
+     paymentStatus === "cancelled" ||
+     paymentStatus === "expired" ||
+     paymentStatus === "on_hold");
 
   return (
     <motion.div
diff --git a/src/app/(client)/components/Product/GiftOptions.js b/src/app/(client)/components/Product/GiftOptions.js
index a01b6f0..2ce67c0 100644
--- a/src/app/(client)/components/Product/GiftOptions.js
+++ b/src/app/(client)/components/Product/GiftOptions.js
@@ -1,29 +1,57 @@
 "use client";
 
-import { useState } from "react";
+import { useState, useEffect } from "react";
 import { Gift } from "lucide-react";
 import { formatPrice } from "./productDetailService";
+import { axiosConfig } from "@/app/services/api/axiosConfig";
 
-const WRAP_OPTIONS = [
-  { id: "classic", label: "Gói giấy cổ điển kèm ruy băng", price: 15000 },
-  { id: "premium", label: "Hộp quà cao cấp", price: 35000 },
-  { id: "eco", label: "Gói giấy tái chế thân thiện môi trường", price: 15000 },
-];
+const WRAP_LABELS = {
+  classic: "Gói giấy cổ điển kèm ruy băng",
+  premium: "Hộp quà cao cấp",
+  eco: "Gói giấy tái chế thân thiện môi trường",
+};
 
 const MESSAGE_LIMIT = 150;
 
 /**
  * @param {(giftData: {enabled:boolean, option:object|null, message:string}) => void=} onChange
- *   Callback báo lại lựa chọn quà tặng cho page cha (ví dụ để cộng thêm phí
- *   gói quà vào tổng đơn ở bước checkout). Không truyền vẫn hoạt động, chỉ
- *   không có nơi nào nhận state này.
+ * @param {boolean} [ownerConfirmed=false] Chỉ bật khi owner/merchant đã xác nhận cho phép gói quà
+ * @param {object} [policy] Chính sách commerce-policy từ BE nếu có sẵn
  */
-export function GiftOptions({ onChange }) {
+export function GiftOptions({ onChange, ownerConfirmed = false, policy = null }) {
+  const [fetchedFees, setFetchedFees] = useState(null);
+  const wrappingFees = policy?.wrappingFees || fetchedFees;
   const [enabled, setEnabled] = useState(false);
   const [selectedId, setSelectedId] = useState(null);
   const [message, setMessage] = useState("");
 
-  const selectedOption = WRAP_OPTIONS.find((o) => o.id === selectedId) || null;
+  useEffect(() => {
+    if (!ownerConfirmed || policy?.wrappingFees) return;
+    let active = true;
+    axiosConfig
+      .get("/commerce-policy")
+      .then((res) => {
+        if (active && res.data?.data?.wrappingFees) {
+          setFetchedFees(res.data.data.wrappingFees);
+        }
+      })
+      .catch(() => {});
+    return () => {
+      active = false;
+    };
+  }, [ownerConfirmed, policy?.wrappingFees]);
+
+  if (!ownerConfirmed) {
+    return null;
+  }
+
+  const wrapOptions = [
+    { id: "classic", label: WRAP_LABELS.classic, price: wrappingFees?.classic ?? 0 },
+    { id: "premium", label: WRAP_LABELS.premium, price: wrappingFees?.premium ?? 0 },
+    { id: "eco", label: WRAP_LABELS.eco, price: wrappingFees?.eco ?? 0 },
+  ];
+
+  const selectedOption = wrapOptions.find((o) => o.id === selectedId) || null;
 
   const handleToggle = () => {
     const next = !enabled;
@@ -66,7 +94,7 @@ export function GiftOptions({ onChange }) {
       {enabled && (
         <div className="space-y-3 pt-1">
           <div className="space-y-2">
-            {WRAP_OPTIONS.map((option) => (
+            {wrapOptions.map((option) => (
               <label
                 key={option.id}
                 className={`flex items-center justify-between gap-3 p-3 bg-white rounded-xl border-2 cursor-pointer transition-all ${
diff --git a/src/app/(client)/components/Product/ProductGallery.js b/src/app/(client)/components/Product/ProductGallery.js
index ebb96a9..675c5f2 100644
--- a/src/app/(client)/components/Product/ProductGallery.js
+++ b/src/app/(client)/components/Product/ProductGallery.js
@@ -15,7 +15,7 @@ export function ProductGallery({ images = [], productName, selectedImage, onSele
     {gallery.length > 1 && <div className="tm-gallery__thumbnails" role="group" aria-label="Chọn ảnh sản phẩm">
       {gallery.map((image, index) => <button key={`${image.url}-${index}`} type="button"
         onClick={() => onSelectImage(image.url)} aria-label={`Xem ảnh ${index + 1} của ${productName || 'sản phẩm'}`}
-        aria-pressed={current === image.url} className="tm-gallery__thumbnail">
+        aria-pressed={current === image.url} className="tm-gallery__thumbnail transition-all motion-reduce:transition-none">
         <Image src={image.url} alt="" fill sizes="72px" className="object-contain p-1" />
       </button>)}
     </div>}
diff --git a/src/app/(client)/components/Product/ProductInfoTabs.js b/src/app/(client)/components/Product/ProductInfoTabs.js
index 68ae780..fa888ed 100644
--- a/src/app/(client)/components/Product/ProductInfoTabs.js
+++ b/src/app/(client)/components/Product/ProductInfoTabs.js
@@ -17,12 +17,16 @@ export function ProductInfoTabs({ product, activeTab, onTabChange }) {
   return (
     <div className="tm-section">
       {/* Header điều hướng tab */}
-      <div className="tm-tab-list" role="group" aria-label="Thông tin sản phẩm">
+      <div className="tm-tab-list" role="tablist" aria-label="Thông tin sản phẩm">
         {TABS.map((tab) => (
           <button
             key={tab.key}
+            id={`tab-${tab.key}`}
+            role="tab"
+            aria-selected={activeTab === tab.key}
+            aria-controls={`tabpanel-${tab.key}`}
             onClick={() => onTabChange(tab.key)}
-            aria-pressed={activeTab === tab.key} aria-controls="product-information"
+            className="transition-colors motion-reduce:transition-none"
           >
             {tab.label}
             {activeTab === tab.key && (
@@ -34,7 +38,7 @@ export function ProductInfoTabs({ product, activeTab, onTabChange }) {
 
       {/* Tab: Mô tả */}
       {activeTab === "details" && (
-        <div id="product-information" className="space-y-4">
+        <div id="tabpanel-details" role="tabpanel" aria-labelledby="tab-details" className="space-y-4">
           <div className="bg-stone-50 rounded-xl p-5 text-sm text-stone-700 leading-relaxed">
             {product.description ? (
               <div
@@ -52,7 +56,7 @@ export function ProductInfoTabs({ product, activeTab, onTabChange }) {
 
       {/* Tab: Đánh giá */}
       {activeTab === "reviews" && (
-        <div id="product-information" className="space-y-6">
+        <div id="tabpanel-reviews" role="tabpanel" aria-labelledby="tab-reviews" className="space-y-6">
           <div className="flex items-center justify-between">
             <div>
               <h3 className="text-sm font-black uppercase tracking-widest text-stone-800 mb-2">
@@ -94,7 +98,7 @@ export function ProductInfoTabs({ product, activeTab, onTabChange }) {
 
       {/* Tab: Thông số */}
       {activeTab === "specs" && (
-        <div id="product-information" className="space-y-1">
+        <div id="tabpanel-specs" role="tabpanel" aria-labelledby="tab-specs" className="space-y-1">
           {product.sku && (
             <div className="flex justify-between py-3 border-b border-stone-100 text-sm">
               <span className="text-stone-500">Mã sản phẩm (SKU)</span>
diff --git a/src/app/(client)/components/Product/ProductPurchasePanel.js b/src/app/(client)/components/Product/ProductPurchasePanel.js
index f5e91a2..135c9a3 100644
--- a/src/app/(client)/components/Product/ProductPurchasePanel.js
+++ b/src/app/(client)/components/Product/ProductPurchasePanel.js
@@ -1,6 +1,6 @@
 "use client";
 import { Minus, Plus, ShoppingCart, Heart, Share2, Truck, Loader2 } from "lucide-react";
-export function ProductPurchasePanel({ product, finalPrice, quantity, onIncrease, onDecrease, isAddingToCart, onAddToCart,
+export function ProductPurchasePanel({ product, finalPrice, quantity, onIncrease, onDecrease, isAddingToCart, onAddToCart, isReady = true,
   isBuyingNow, onBuyNow, isWishlisted, onWishlist, onShare, fmtPrice }) {
   const discount = product.salePercent || 0;
   const stock = product.stock ?? 0;
@@ -19,16 +19,16 @@ export function ProductPurchasePanel({ product, finalPrice, quantity, onIncrease
     <p className={stock > 0 ? 'text-sm font-semibold text-green-800' : 'text-sm font-semibold text-red-700'}>{stock > 0 ? `Còn ${stock} sản phẩm` : 'Tạm hết hàng'}</p>
     <div className="tm-quantity-row"><span id="product-quantity-label" className="font-medium">Số lượng</span>
       <div className="tm-quantity" role="group" aria-labelledby="product-quantity-label">
-        <button type="button" aria-label="Giảm số lượng" disabled={quantity <= 1 || busy || stock <= 0} onClick={onDecrease}><Minus size={18} /></button>
+        <button type="button" aria-label="Giảm số lượng" disabled={quantity <= 1 || busy || stock <= 0 || !isReady} onClick={onDecrease}><Minus size={18} /></button>
         <output aria-live="polite" aria-atomic="true">{quantity}</output>
-        <button type="button" aria-label="Tăng số lượng" disabled={stock <= 0 || quantity >= stock || busy} onClick={onIncrease}><Plus size={18} /></button>
+        <button type="button" aria-label="Tăng số lượng" disabled={stock <= 0 || quantity >= stock || busy || !isReady} onClick={onIncrease}><Plus size={18} /></button>
       </div>
     </div>
     <div className="space-y-3" aria-busy={Boolean(busy)}>
-      <button type="button" className="tm-button tm-button--primary w-full" disabled={busy || stock <= 0 || !hasPrice} onClick={onAddToCart}>
+      <button type="button" className="tm-button tm-button--primary w-full" disabled={busy || stock <= 0 || !hasPrice || !isReady} onClick={onAddToCart}>
         {isAddingToCart ? <Loader2 size={19} className="animate-spin" /> : <ShoppingCart size={19} />}{isAddingToCart ? 'Đang thêm…' : stock <= 0 ? 'Tạm hết hàng' : 'Thêm vào giỏ hàng'}
       </button>
-      <button type="button" className="tm-button tm-button--outline w-full" disabled={busy || stock <= 0 || !hasPrice} onClick={onBuyNow}>{isBuyingNow ? 'Đang chuyển đến thanh toán…' : 'Mua ngay'}</button>
+      <button type="button" className="tm-button tm-button--outline w-full" disabled={busy || stock <= 0 || !hasPrice || !isReady} onClick={onBuyNow}>{isBuyingNow ? 'Đang chuyển đến thanh toán…' : 'Mua ngay'}</button>
       <p className="text-sm text-stone-600">Mua ngay sẽ thanh toán cùng các sản phẩm đang có trong giỏ.</p>
     </div>
     <div className="flex flex-wrap gap-3">
diff --git a/src/app/(client)/components/layout/product/product_card.js b/src/app/(client)/components/layout/product/product_card.js
index cabb241..6ca8b05 100644
--- a/src/app/(client)/components/layout/product/product_card.js
+++ b/src/app/(client)/components/layout/product/product_card.js
@@ -15,7 +15,7 @@ export const ProductCard = ({
   const productHref = `/products/${productSlug}-${productId}`;
 
   const formatPrice = (price) => {
-    if (!price) return "Liên hệ";
+    if (!price || price <= 0) return "Liên hệ";
     return new Intl.NumberFormat("vi-VN", {
       style: "currency",
       currency: "VND",
@@ -31,29 +31,31 @@ export const ProductCard = ({
   };
 
   const discountPercent = product.salePercent || 0;
-  const salePrice = Math.round(product.price * (1 - discountPercent / 100));
-  const originalPrice = discountPercent > 0 ? product.price : product.originalPrice;
-  // product.stock có thể undefined với dữ liệu cũ/thiếu — coi như 0 (hết
-  // hàng) để nhất quán với cách trang chi tiết sản phẩm đang xử lý
-  // (ProductPurchasePanel.js: const stock = product.stock ?? 0).
+  const rawPrice = Number(product.price) || 0;
+  const salePrice = rawPrice > 0 ? Math.round(rawPrice * (1 - discountPercent / 100)) : 0;
+  const originalPrice = discountPercent > 0 ? rawPrice : product.originalPrice;
   const stock = product.stock ?? 0;
-  const outOfStock = stock <= 0;
+  const hasValidPrice = Number.isFinite(rawPrice) && rawPrice > 0;
+  const outOfStock = stock <= 0 || !hasValidPrice;
+
+  const rawImage = product.images && product.images[0]?.url ? product.images[0].url : "/assets/placeholder.png";
+  const [imgSrc, setImgSrc] = React.useState(rawImage);
+  React.useEffect(() => {
+    setImgSrc(product.images && product.images[0]?.url ? product.images[0].url : "/assets/placeholder.png");
+  }, [product.images]);
 
   return (
     <div className="flex flex-col group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-green-200">
       <Link href={productHref} className="block">
         <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
           <Image
-            src={
-              product.images && product.images[0]?.url
-                ? product.images[0].url
-                : "/assets/placeholder.png"
-            }
-            alt={product.name || "product"}
+            src={imgSrc}
+            alt={product.name || "Sản phẩm TotMart"}
             fill
             sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
-            className="object-cover transition-transform duration-500 group-hover:scale-110"
+            className="object-cover transition-transform duration-500 group-hover:scale-110 motion-reduce:transform-none motion-reduce:transition-none"
             priority={false}
+            onError={() => setImgSrc("/assets/placeholder.png")}
           />
 
           {/* Overlay Hết hàng — phủ mờ ảnh + nhãn ở giữa, dễ nhận biết ngay
@@ -83,12 +85,12 @@ export const ProductCard = ({
           {/* Wishlist Button */}
           <button
             onClick={(e) => handleAction(e, onToggleWishlist)}
-            className={`absolute bottom-3 right-3 p-2 bg-white rounded-full hover:bg-gray-100 shadow-md hover:shadow-lg transition-all duration-300 ${
+            className={`absolute bottom-3 right-3 p-2 bg-white rounded-full hover:bg-gray-100 shadow-md hover:shadow-lg transition-all duration-300 motion-reduce:transition-none ${
               isWishlisted
                 ? "text-red-500 opacity-100"
                 : "text-gray-700 hover:text-red-500 opacity-0 group-hover:opacity-100"
             }`}
-            aria-label="Add to wishlist"
+            aria-label={isWishlisted ? "Bỏ yêu thích sản phẩm" : "Thêm vào danh sách yêu thích"}
           >
             <Heart
               className={`w-5 h-5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`}
@@ -103,23 +105,28 @@ export const ProductCard = ({
           </h3>
 
           {/* Rating */}
-          {Number.isSafeInteger(product.reviewCount) && product.reviewCount > 0 && Number.isFinite(product.rating) && product.rating > 0 && product.rating <= 5 && <div className="flex items-center gap-2 mb-3">
-            <div className="flex gap-0.5">
-              {[...Array(5)].map((_, i) => (
-                <Star
-                  key={i}
-                  className={`w-3.5 h-3.5 ${
-                    i < (product.rating || 0)
-                      ? "text-yellow-400 fill-yellow-400"
-                      : "text-gray-300 fill-gray-200"
-                  }`}
-                />
-              ))}
+          {Number.isSafeInteger(product.reviewCount) && product.reviewCount > 0 && Number.isFinite(product.rating) && product.rating > 0 && product.rating <= 5 && (
+            <div
+              className="flex items-center gap-2 mb-3"
+              aria-label={`Đánh giá ${product.rating} trên 5 sao (${product.reviewCount} lượt đánh giá)`}
+            >
+              <div className="flex gap-0.5" aria-hidden="true">
+                {[...Array(5)].map((_, i) => (
+                  <Star
+                    key={i}
+                    className={`w-3.5 h-3.5 ${
+                      i < (product.rating || 0)
+                        ? "text-yellow-400 fill-yellow-400"
+                        : "text-gray-300 fill-gray-200"
+                    }`}
+                  />
+                ))}
+              </div>
+              <span className="text-xs text-gray-500" aria-hidden="true">
+                ({product.reviewCount})
+              </span>
             </div>
-            <span className="text-xs text-gray-500">
-              ({product.reviewCount})
-            </span>
-          </div>}
+          )}
 
           {/* Price */}
           <div className="flex items-baseline gap-2 mb-4">
diff --git a/src/app/(client)/components/layout/product/products_grid.js b/src/app/(client)/components/layout/product/products_grid.js
index 7e4b817..6a09e31 100644
--- a/src/app/(client)/components/layout/product/products_grid.js
+++ b/src/app/(client)/components/layout/product/products_grid.js
@@ -1,7 +1,7 @@
 "use client";
 import logger from "@/app/util/Logger";
 
-import { useState, useEffect } from "react";
+import { useState, useEffect, useRef } from "react";
 import { toast } from "sonner";
 import { ProductCard } from "./product_card";
 import {
@@ -10,22 +10,57 @@ import {
 import { useAddToCart } from "@/app/hook/useAddToCart";
 import { useWishlist } from "@/app/context/WishlistContext";
 
-export default function ProductsGrid({ categoryId, brandSlug, searchQuery = "" }) {
+export default function ProductsGrid({
+  categoryId,
+  brandSlug,
+  searchQuery = "",
+  initialProducts = null,
+  initialPagination = null,
+  initialPage = 1,
+  initialSort = "newest",
+  initialError = null,
+}) {
   const { addToCart } = useAddToCart();
   const { isInWishlist, toggleWishlist } = useWishlist();
-  const [products, setProducts] = useState([]);
-  const [loading, setLoading] = useState(true);
-  const [error, setError] = useState(null);
-  const [sortBy, setSortBy] = useState("newest");
+  const [products, setProducts] = useState(initialProducts || []);
+  const [loading, setLoading] = useState(!initialProducts && !initialError);
+  const [error, setError] = useState(initialError);
+  const [reloadToken, setReloadToken] = useState(0);
+  const [sortBy, setSortBy] = useState(initialSort || "newest");
   const [viewMode, setViewMode] = useState("grid");
-  const [currentPage, setCurrentPage] = useState(1);
+  const [currentPage, setCurrentPage] = useState(initialPage || 1);
   const pageSize = 12;
 
-  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });
+  const [pagination, setPagination] = useState(
+    initialPagination || {
+      total: initialProducts?.length || 0,
+      totalPages: Math.ceil((initialProducts?.length || 0) / pageSize) || 1,
+    }
+  );
   const totalPages = pagination.totalPages;
   const visibleProducts = products;
+  const isInitialMount = useRef(Boolean(initialProducts));
+
+  useEffect(() => {
+    if (initialProducts) {
+      setProducts(initialProducts);
+      setLoading(false);
+    }
+    if (initialPagination) {
+      setPagination(initialPagination);
+    }
+    if (initialPage) {
+      setCurrentPage(initialPage);
+    }
+    if (initialError !== undefined) {
+      setError(initialError);
+    }
+  }, [initialProducts, initialPagination, initialPage, initialError]);
 
   useEffect(() => {
+    if (isInitialMount.current) {
+      return;
+    }
     setCurrentPage(1);
   }, [categoryId, brandSlug, searchQuery, sortBy]);
 
@@ -34,35 +69,75 @@ export default function ProductsGrid({ categoryId, brandSlug, searchQuery = "" }
   }, [currentPage, totalPages]);
 
   useEffect(() => {
+    if (isInitialMount.current && reloadToken === 0 && !initialError) {
+      isInitialMount.current = false;
+      return;
+    }
+
     let active = true;
     const fetchProducts = async () => {
       try {
         setLoading(true);
         setError(null);
-        const res = await getAllProductsApi({ page: currentPage, limit: pageSize, keyword: searchQuery.trim() || undefined, category: categoryId || undefined, brandSlug: brandSlug || undefined, sort: sortBy === 'price-asc' ? 'price_asc' : sortBy === 'price-desc' ? 'price_desc' : undefined });
+        const res = await getAllProductsApi({
+          page: currentPage,
+          limit: pageSize,
+          keyword: searchQuery.trim() || undefined,
+          category: categoryId || undefined,
+          brandSlug: brandSlug || undefined,
+          sort: sortBy === "price-asc" ? "price_asc" : sortBy === "price-desc" ? "price_desc" : undefined,
+        });
         if (!active) return;
-        setProducts(res.data || []); setPagination(res.pagination);
+        setProducts(res.data || []);
+        setPagination(res.pagination || { total: res.data?.length || 0, totalPages: 1 });
       } catch (err) {
         if (!active) return;
         logger.error("Error fetching products:", err);
-        setError("Could not load products.");
+        const status = err?.response?.status;
+        const requestId = err?.response?.data?.requestId || err?.requestId || err?.response?.headers?.["x-request-id"];
+        const safeMessage = status >= 500 ? "Lỗi hệ thống. Vui lòng thử lại." : (err?.response?.data?.message || "Không thể tải danh sách sản phẩm.");
+        setError({ message: safeMessage, requestId });
       } finally {
         if (active) setLoading(false);
       }
     };
     fetchProducts();
-    return () => { active = false; };
-  }, [categoryId, brandSlug, searchQuery, sortBy, currentPage]);
+    return () => {
+      active = false;
+    };
+  }, [categoryId, brandSlug, searchQuery, sortBy, currentPage, reloadToken, initialError]);
 
   if (loading)
     return (
-      <div className="py-20 text-center text-gray-500 italic">
-        Loading products...
+      <div className="py-12" role="status" aria-label="Đang tải danh sách sản phẩm">
+        <span className="sr-only">Đang tải danh sách sản phẩm...</span>
+        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
+          {Array.from({ length: 8 }).map((_, i) => (
+            <div
+              key={i}
+              className="animate-pulse motion-reduce:animate-none bg-gray-100 rounded-lg aspect-square border border-gray-200"
+            />
+          ))}
+        </div>
       </div>
     );
   if (error)
     return (
-      <div className="py-20 text-center text-red-500 font-medium">{error}</div>
+      <div role="alert" className="py-20 text-center space-y-4">
+        <p className="text-red-600 font-semibold text-base">{error.message}</p>
+        {error.requestId && (
+          <p className="text-xs text-gray-500 font-mono">Mã yêu cầu (Request ID): {error.requestId}</p>
+        )}
+        <div>
+          <button
+            type="button"
+            onClick={() => setReloadToken((n) => n + 1)}
+            className="px-4 py-2 bg-green-700 text-white text-sm font-semibold rounded-md hover:bg-green-800 transition-colors"
+          >
+            Thử lại
+          </button>
+        </div>
+      </div>
     );
 
   return (
@@ -175,7 +250,7 @@ export default function ProductsGrid({ categoryId, brandSlug, searchQuery = "" }
           ))
         ) : (
           <div className="col-span-full text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500">
-            No products available in this category.
+            Không tìm thấy sản phẩm phù hợp.
           </div>
         )}
       </div>
@@ -186,7 +261,10 @@ export default function ProductsGrid({ categoryId, brandSlug, searchQuery = "" }
           <button
             type="button"
             disabled={currentPage === 1}
-            onClick={() => setCurrentPage((page) => page - 1)}
+            onClick={() => {
+              isInitialMount.current = false;
+              setCurrentPage((page) => page - 1);
+            }}
             className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
             aria-label="Previous page"
           >
@@ -197,7 +275,10 @@ export default function ProductsGrid({ categoryId, brandSlug, searchQuery = "" }
               key={page}
               type="button"
               aria-current={page === currentPage ? "page" : undefined}
-              onClick={() => setCurrentPage(page)}
+              onClick={() => {
+                isInitialMount.current = false;
+                setCurrentPage(page);
+              }}
               className={`min-w-10 px-3 py-2 rounded-md ${page === currentPage ? "bg-green-700 text-white" : "border border-gray-300 text-gray-700 hover:bg-gray-50"}`}
             >
               {page}
@@ -206,7 +287,10 @@ export default function ProductsGrid({ categoryId, brandSlug, searchQuery = "" }
           <button
             type="button"
             disabled={currentPage === totalPages}
-            onClick={() => setCurrentPage((page) => page + 1)}
+            onClick={() => {
+              isInitialMount.current = false;
+              setCurrentPage((page) => page + 1);
+            }}
             className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
             aria-label="Next page"
           >
diff --git a/src/app/(client)/components/ui/SideBar.js b/src/app/(client)/components/ui/SideBar.js
index 82fea53..8b76198 100644
--- a/src/app/(client)/components/ui/SideBar.js
+++ b/src/app/(client)/components/ui/SideBar.js
@@ -1,3 +1,4 @@
+"use client";
 import logger from "@/app/util/Logger";
 import { ChevronDown, X, ChevronUp } from "lucide-react";
 import React, { useEffect, useMemo, useState } from "react";
diff --git a/src/app/(client)/layout.jsx b/src/app/(client)/layout.jsx
index 349753e..479a8b5 100644
--- a/src/app/(client)/layout.jsx
+++ b/src/app/(client)/layout.jsx
@@ -1,11 +1,10 @@
-"use client";
-import { useContext, useEffect } from 'react';
-import { useRouter } from 'next/navigation';
-import { AppContext } from '@/app/context/AppContext';
+import MerchantRedirectGuard from "./MerchantRedirectGuard";
+
 export default function ClientLayout({ children }) {
-  const { user, isLoading } = useContext(AppContext);
-  const router = useRouter();
-  useEffect(() => { if (!isLoading && user?.role === 'merchant') router.replace('/manager'); }, [user, isLoading, router]);
-  if (isLoading || user?.role === 'merchant') return null;
-  return children;
+  return (
+    <>
+      <MerchantRedirectGuard />
+      {children}
+    </>
+  );
 }
diff --git a/src/app/(client)/products/[slug]/ProductDetailInteractive.jsx b/src/app/(client)/products/[slug]/ProductDetailInteractive.jsx
index c03361e..ec6be04 100644
--- a/src/app/(client)/products/[slug]/ProductDetailInteractive.jsx
+++ b/src/app/(client)/products/[slug]/ProductDetailInteractive.jsx
@@ -1,5 +1,6 @@
 "use client";
 
+import { useCart } from "@/app/context/CartContext";
 import { useProductDetail } from "@/app/hook/useProductDetail";
 import { ProductGallery } from "../../components/Product/ProductGallery";
 import { ProductPurchasePanel } from "../../components/Product/ProductPurchasePanel";
@@ -9,6 +10,7 @@ import { ProductLoadingState } from "../../components/Product/ProductLoadingStat
 import { ProductNotFoundState } from "../../components/Product/ProductNotFoundState";
 
 export default function ProductDetailInteractive({ initialProduct, slug }) {
+  const { isMounted: isCartMounted } = useCart();
   const {
     product,
     loading,
@@ -59,12 +61,13 @@ export default function ProductDetailInteractive({ initialProduct, slug }) {
           onAddToCart={handleAddToCart}
           onBuyNow={handleBuyNow}
           onShare={handleShare}
-          onToggleWishlist={handleWishlist}
+          onWishlist={handleWishlist}
           isWishlisted={isWishlisted}
           isAddingToCart={isAddingToCart}
           isBuyingNow={isBuyingNow}
           finalPrice={finalPrice}
           fmtPrice={fmtPrice}
+          isReady={Boolean(isCartMounted)}
         />
       </div>
 
diff --git a/src/app/(client)/products/[slug]/page.js b/src/app/(client)/products/[slug]/page.js
index 9db4580..114da76 100644
--- a/src/app/(client)/products/[slug]/page.js
+++ b/src/app/(client)/products/[slug]/page.js
@@ -1,4 +1,4 @@
-import { notFound } from "next/navigation";
+import { notFound, permanentRedirect } from "next/navigation";
 import Link from "next/link";
 import { ChevronRight } from "lucide-react";
 
@@ -16,20 +16,24 @@ import ProductDetailInteractive from "./ProductDetailInteractive";
 
 export const revalidate = 60;
 
-export async function generateMetadata({ params: paramsPromise }) {
+export async function generateMetadata({ params: paramsPromise, searchParams: searchParamsPromise }) {
   const params = await paramsPromise;
+  const searchParams = searchParamsPromise ? await searchParamsPromise : {};
   const slug = params?.slug || "";
   const product = await getServerProductDetail(slug);
 
   if (!product) {
-    return {
-      title: "Không tìm thấy sản phẩm | TotMart",
-      description: "Sản phẩm không tồn tại hoặc đã ngừng kinh doanh trên TotMart.",
-    };
+    notFound();
+  }
+
+  const canonicalSlug = `${product.slug || "san-pham"}-${product._id}`;
+  if (slug !== canonicalSlug) {
+    const qs = new URLSearchParams(searchParams).toString();
+    permanentRedirect(`/products/${canonicalSlug}${qs ? `?${qs}` : ""}`);
   }
 
   const siteUrl = getPublicSiteUrl();
-  const canonicalUrl = `${siteUrl}/products/${product.slug || "san-pham"}-${product._id}`;
+  const canonicalUrl = `${siteUrl}/products/${canonicalSlug}`;
   const title = `${product.name} | TotMart`;
   const description = (product.descriptions || product.name || "").slice(0, 160);
   const images = (product.images || [])
@@ -53,8 +57,9 @@ export async function generateMetadata({ params: paramsPromise }) {
   };
 }
 
-export default async function ProductDetailPage({ params: paramsPromise }) {
+export default async function ProductDetailPage({ params: paramsPromise, searchParams: searchParamsPromise }) {
   const params = await paramsPromise;
+  const searchParams = searchParamsPromise ? await searchParamsPromise : {};
   const slug = params?.slug || "";
   const product = await getServerProductDetail(slug);
 
@@ -62,8 +67,14 @@ export default async function ProductDetailPage({ params: paramsPromise }) {
     notFound();
   }
 
+  const canonicalSlug = `${product.slug || "san-pham"}-${product._id}`;
+  if (slug !== canonicalSlug) {
+    const qs = new URLSearchParams(searchParams).toString();
+    permanentRedirect(`/products/${canonicalSlug}${qs ? `?${qs}` : ""}`);
+  }
+
   const siteUrl = getPublicSiteUrl();
-  const canonicalUrl = `${siteUrl}/products/${product.slug || "san-pham"}-${product._id}`;
+  const canonicalUrl = `${siteUrl}/products/${canonicalSlug}`;
   const salePercent = product.salePercent || 0;
   const finalPrice =
     salePercent > 0
diff --git a/src/app/(client)/products/box/[id]/BoxDetailInteractive.jsx b/src/app/(client)/products/box/[id]/BoxDetailInteractive.jsx
index 3377f7b..61b9f7d 100644
--- a/src/app/(client)/products/box/[id]/BoxDetailInteractive.jsx
+++ b/src/app/(client)/products/box/[id]/BoxDetailInteractive.jsx
@@ -71,6 +71,7 @@ export default function BoxDetailInteractive({ initialBox, initialProducts = []
                 aria-label="Giảm số lượng hộp"
                 onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                 disabled={quantity <= 1 || stock <= 0}
+                className="transition-colors motion-reduce:transition-none"
               >
                 <Minus size={18} />
               </button>
@@ -80,6 +81,7 @@ export default function BoxDetailInteractive({ initialBox, initialProducts = []
                 aria-label="Tăng số lượng hộp"
                 onClick={() => setQuantity((q) => Math.min(Math.min(999, stock), q + 1))}
                 disabled={stock <= 0 || quantity >= Math.min(999, stock)}
+                className="transition-colors motion-reduce:transition-none"
               >
                 <Plus size={18} />
               </button>
@@ -106,7 +108,7 @@ export default function BoxDetailInteractive({ initialBox, initialProducts = []
           )}
           <button
             type="button"
-            className="tm-button tm-button--primary w-full"
+            className="tm-button tm-button--primary w-full transition-colors motion-reduce:transition-none"
             disabled={!canBuy}
             onClick={handleAddToCart}
           >
diff --git a/src/app/(client)/products/box/[id]/page.js b/src/app/(client)/products/box/[id]/page.js
index 948824d..5f60b6d 100644
--- a/src/app/(client)/products/box/[id]/page.js
+++ b/src/app/(client)/products/box/[id]/page.js
@@ -1,4 +1,4 @@
-import { notFound } from "next/navigation";
+import { notFound, permanentRedirect } from "next/navigation";
 import Link from "next/link";
 import { ChevronRight } from "lucide-react";
 import NavMenu from "@/app/(client)/components/ui/nav_menu";
@@ -11,19 +11,23 @@ import BoxDetailInteractive from "./BoxDetailInteractive";
 
 export const revalidate = 60;
 
-export async function generateMetadata({ params: paramsPromise }) {
+export async function generateMetadata({ params: paramsPromise, searchParams: searchParamsPromise }) {
   const params = await paramsPromise;
+  const searchParams = searchParamsPromise ? await searchParamsPromise : {};
   const id = params?.id || "";
   const detail = await getServerBoxDetail(id);
 
   if (!detail || !detail.box) {
-    return {
-      title: "Không tìm thấy hộp sản phẩm | TotMart",
-      description: "Hộp sản phẩm không tồn tại hoặc đã ngừng kinh doanh trên TotMart.",
-    };
+    notFound();
   }
 
   const { box } = detail;
+  const canonicalId = String(box._id);
+  if (id !== canonicalId) {
+    const qs = new URLSearchParams(searchParams).toString();
+    permanentRedirect(`/products/box/${canonicalId}${qs ? `?${qs}` : ""}`);
+  }
+
   const siteUrl = getPublicSiteUrl();
   const canonicalUrl = `${siteUrl}/products/box/${box._id}`;
   const title = `${box.name} | TotMart`;
@@ -49,8 +53,9 @@ export async function generateMetadata({ params: paramsPromise }) {
   };
 }
 
-export default async function BoxDetailPage({ params: paramsPromise }) {
+export default async function BoxDetailPage({ params: paramsPromise, searchParams: searchParamsPromise }) {
   const params = await paramsPromise;
+  const searchParams = searchParamsPromise ? await searchParamsPromise : {};
   const id = params?.id || "";
   const detail = await getServerBoxDetail(id);
 
@@ -59,6 +64,11 @@ export default async function BoxDetailPage({ params: paramsPromise }) {
   }
 
   const { box, boxProducts } = detail;
+  const canonicalId = String(box._id);
+  if (id !== canonicalId) {
+    const qs = new URLSearchParams(searchParams).toString();
+    permanentRedirect(`/products/box/${canonicalId}${qs ? `?${qs}` : ""}`);
+  }
   const siteUrl = getPublicSiteUrl();
   const canonicalUrl = `${siteUrl}/products/box/${box._id}`;
   const salePrice = boxSalePrice(box);
diff --git a/src/app/(client)/products/page.js b/src/app/(client)/products/page.js
index 5a87258..07ceb30 100644
--- a/src/app/(client)/products/page.js
+++ b/src/app/(client)/products/page.js
@@ -1,28 +1,103 @@
-"use client";
-
-import React, { useState } from "react";
+import Link from "next/link";
 import AnnouncementBar from "../components/ui/AnnouncementBar";
 import MainHeader from "../components/ui/main_header";
 import NavMenu from "../components/ui/nav_menu";
 import TotMartSupport from "../components/layout/totmart_suppport";
 import SideBar from "../components/ui/SideBar";
-import ProductsGrid from "../components/layout/product/products_grid";
 import Footer from "../components/ui/footer";
+import ProductsGrid from "../components/layout/product/products_grid";
+import {
+  getServerProductsCatalog,
+  getPublicSiteUrl,
+} from "@/app/services/server/serverCatalog";
+
+export const revalidate = 60;
+
+export async function generateMetadata({ searchParams: searchParamsPromise }) {
+  const searchParams = await searchParamsPromise;
+  const page = Math.max(1, parseInt(searchParams?.page || "1", 10) || 1);
+  const search = (searchParams?.search || searchParams?.keyword || "").trim();
+  const category = (searchParams?.category || "").trim();
+  const brandSlug = (searchParams?.brand || searchParams?.brandSlug || "").trim();
 
-export default function ProductPage() {
-  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
+  const siteUrl = getPublicSiteUrl();
+  const queryParts = [];
+  if (page > 1) queryParts.push(`page=${page}`);
+  if (search) queryParts.push(`search=${encodeURIComponent(search)}`);
+  if (category) queryParts.push(`category=${encodeURIComponent(category)}`);
+  if (brandSlug) queryParts.push(`brand=${encodeURIComponent(brandSlug)}`);
+  const qs = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
+  const canonicalUrl = `${siteUrl}/products${qs}`;
+
+  let title = "Sản phẩm hữu cơ chọn lọc | TotMart";
+  if (search) {
+    title = `Tìm kiếm: "${search}" | TotMart`;
+  } else if (page > 1) {
+    title = `Sản phẩm hữu cơ - Trang ${page} | TotMart`;
+  }
+
+  const description =
+    "Khám phá danh mục các sản phẩm hữu cơ, nông sản sạch tự nhiên và các mặt hàng dinh dưỡng chọn lọc tại TotMart.";
+
+  return {
+    title,
+    description,
+    alternates: {
+      canonical: canonicalUrl,
+    },
+    openGraph: {
+      title,
+      description,
+      url: canonicalUrl,
+      siteName: "TotMart",
+      type: "website",
+    },
+  };
+}
+
+export default async function ProductsPage({ searchParams: searchParamsPromise }) {
+  const searchParams = await searchParamsPromise;
+  const page = Math.max(1, parseInt(searchParams?.page || "1", 10) || 1);
+  const limit = 12;
+  const searchQuery = (searchParams?.search || searchParams?.keyword || "").trim();
+  const categoryId = (searchParams?.category || "").trim();
+  const brandSlug = (searchParams?.brand || searchParams?.brandSlug || "").trim();
+  const sortBy = (searchParams?.sort || "newest").trim();
+
+  // Data access server-only with absolute URL & 60s cache
+  const catalog = await getServerProductsCatalog({
+    page,
+    limit,
+    keyword: searchQuery,
+    category: categoryId,
+    brandSlug,
+    sort: sortBy,
+  });
+
+  const products = catalog.products || [];
+  const initialError = catalog.error || null;
+  const pagination = catalog.pagination || {
+    total: products.length,
+    totalPages: Math.ceil(products.length / limit) || 1,
+    page,
+    limit,
+  };
+
+  const formatPrice = (price) => {
+    if (!price || price <= 0) return "Liên hệ";
+    return new Intl.NumberFormat("vi-VN", {
+      style: "currency",
+      currency: "VND",
+    })
+      .format(price)
+      .replace("₫", "đ");
+  };
 
   return (
     <div className="page-canvas min-h-screen">
       <div className="sticky top-0 bg-white shadow-sm z-1000">
         <AnnouncementBar />
-
-        <MainHeader
-          onMenuClick={() => setIsSidebarOpen(true)}
-          cartItemCount={0}
-          cartTotal={0}
-        />
-
+        <MainHeader cartItemCount={0} cartTotal={0} />
         <div className="border-b border-gray-100">
           <NavMenu />
         </div>
@@ -36,31 +111,39 @@ export default function ProductPage() {
         </div>
         <div className="container mx-auto px-4 relative z-10">
           <p className="text-sm font-semibold uppercase tracking-wider mb-3 text-green-200">
-            Premium Organic Curations
+            {searchQuery ? "Kết quả tìm kiếm" : "Premium Organic Curations"}
           </p>
           <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
-            Premium Organic Snacks
+            {searchQuery ? `"${searchQuery}"` : "Premium Organic Snacks"}
           </h1>
           <p className="text-lg text-green-100 max-w-2xl">
-            Discover our curated selection of hand-picked organic snacks that
-            nourish the soul and respect the planet.
+            {searchQuery
+              ? "Đây là các sản phẩm phù hợp với từ khoá bạn tìm."
+              : "Discover our curated selection of hand-picked organic snacks that nourish the soul and respect the planet."}
           </p>
         </div>
       </div>
 
+      {/* Main Products with Client Island */}
       <div className="container mx-auto px-4 py-12">
         <div className="flex flex-col lg:flex-row gap-8">
           {/* Sidebar Filter */}
           <div className="w-full lg:w-64 shrink-0">
-            <SideBar
-              isOpen={isSidebarOpen}
-              onClose={() => setIsSidebarOpen(false)}
-            />
+            <SideBar />
           </div>
 
-          {/* Main Products */}
+          {/* Main Products Grid with Initial Server Data */}
           <main className="flex-1 min-w-0">
-            <ProductsGrid />
+            <ProductsGrid
+              categoryId={categoryId}
+              brandSlug={brandSlug}
+              searchQuery={searchQuery}
+              initialProducts={products}
+              initialPagination={pagination}
+              initialPage={page}
+              initialSort={sortBy}
+              initialError={initialError}
+            />
           </main>
         </div>
       </div>
diff --git a/src/app/hook/checkout/useCheckout.js b/src/app/hook/checkout/useCheckout.js
index c7fa07c..beaa4a2 100644
--- a/src/app/hook/checkout/useCheckout.js
+++ b/src/app/hook/checkout/useCheckout.js
@@ -184,16 +184,12 @@ export function useCheckout() {
   }, []);
 
   const handleCancelled = useCallback(() => {
-    activeCodeRef.current = null;
-    setPaymentStatus("idle");
-    setPaymentCode(null);
+    setPaymentStatus("cancelled");
     setQrUrl("");
-    setOnlineAmount(0);
     toast.error(
-      "Đơn đã bị huỷ hoặc hết hạn thanh toán. Vui lòng không chuyển khoản cho mã này.",
+      "Mã thanh toán không còn hiệu lực nhận thanh toán. Nếu bạn đã chuyển khoản, khoản tiền sẽ vào quy trình đối soát hoàn tiền hoặc liên hệ hỗ trợ TotMart kèm mã thanh toán.",
     );
-    router.replace("/");
-  }, [router]);
+  }, []);
 
   // ── Khôi phục đơn sau refresh: /checkout?code=<paymentCode> ──
   useEffect(() => {
@@ -214,13 +210,35 @@ export function useCheckout() {
           finishPaid();
           return;
         }
-        if (info.cancelled) {
-          handleCancelled();
+        if (info.cancelled || info.status === "cancelled") {
+          activeCodeRef.current = resumeCode;
+          setPaymentMethod("online");
+          setPaymentCode(resumeCode);
+          setQrUrl("");
+          setOnlineAmount(info.remainingAmount ?? info.totalAmount);
+          setPaymentStatus("cancelled");
+          setStep("payment");
+          toast.error(
+            "Mã thanh toán không còn hiệu lực nhận thanh toán. Nếu bạn đã chuyển khoản, khoản tiền sẽ vào quy trình đối soát hoàn tiền hoặc liên hệ hỗ trợ TotMart kèm mã thanh toán.",
+          );
           return;
         }
-        if (!info.qrUrl) {
-          // Đơn không phải online-pending (vd. COD) → không có gì để quét
-          toast.error("Đơn này không có mã QR để thanh toán.");
+        if (info.onHold || info.status === "on_hold") {
+          activeCodeRef.current = resumeCode;
+          setPaymentMethod("online");
+          setPaymentCode(resumeCode);
+          setQrUrl("");
+          setOnlineAmount(info.remainingAmount ?? info.totalAmount);
+          setPaymentStatus("on_hold");
+          setStep("payment");
+          toast.error(
+            "Đơn hàng đang tạm giữ để kiểm tra tồn kho. Vui lòng kiểm tra mục Đơn hàng của tôi hoặc liên hệ hỗ trợ TotMart.",
+          );
+          return;
+        }
+        if (!info.payable || !info.qrUrl) {
+          // Đơn không phải online-pending hoặc không payable (vd. COD) → không có gì để quét
+          toast.error("Đơn này không thể thanh toán trực tuyến hoặc không có mã QR.");
           router.replace("/profile/orders");
           return;
         }
@@ -229,8 +247,9 @@ export function useCheckout() {
         setPaymentCode(resumeCode);
         setQrUrl(info.qrUrl);
         setOnlineAmount(info.remainingAmount ?? info.totalAmount);
-        setPaymentStatus("awaiting_payment");
+        setPaymentStatus(info.status === "underpaid" ? "underpaid" : "awaiting_payment");
         setStep("payment");
+        return;
       })
       .finally(() => {
         if (active) setResuming(false);
@@ -266,14 +285,28 @@ export function useCheckout() {
 
   // ── Polling trạng thái thanh toán khi đang hiện QR ──
   useEffect(() => {
-    if (!paymentCode || paymentStatus !== "awaiting_payment") return;
+    if (!paymentCode || !["awaiting_payment", "underpaid"].includes(paymentStatus)) return;
     return pollPaymentStatus(paymentCode, {
       onStatusChange: (info) => {
         const { status } = info;
         if (status === "paid") finishPaid();
-        else if (status === "cancelled") handleCancelled();
+        else if (status === "cancelled" || info.cancelled) handleCancelled();
+        else if (status === "on_hold" || info.onHold) {
+          setPaymentStatus("on_hold");
+          setQrUrl("");
+          toast.error("Đơn hàng đang tạm giữ để kiểm tra tồn kho. Vui lòng kiểm tra mục Đơn hàng của tôi hoặc liên hệ hỗ trợ TotMart.");
+        }
         else if (status === "timeout") setPaymentStatus("timeout");
-        else if (status === 'pending') { setQrUrl(info.qrUrl || ''); setOnlineAmount(info.remainingAmount ?? info.totalAmount); }
+        else if (status === "underpaid") {
+          setPaymentStatus("underpaid");
+          setQrUrl(info.qrUrl || "");
+          setOnlineAmount(info.remainingAmount);
+        }
+        else if (status === 'pending') {
+          setPaymentStatus("awaiting_payment");
+          setQrUrl(info.qrUrl || '');
+          setOnlineAmount(info.remainingAmount ?? info.totalAmount);
+        }
       },
     });
   }, [paymentCode, paymentStatus, pollAttempt, finishPaid, handleCancelled]);
@@ -299,6 +332,7 @@ export function useCheckout() {
       }
       submittingRef.current = true;
       setSubmitting(true);
+      let info = null;
       try {
         if (String(user?._id || user?.id) !== String(getTokenUserId())) throw new Error('Tài khoản đã thay đổi. Tải lại thông tin trước khi thanh toán.');
         const result = await placeOrder({
@@ -345,7 +379,7 @@ export function useCheckout() {
         // Persist the recoverable URL before the next network operation.
         router.replace(`/checkout?code=${encodeURIComponent(code)}`);
         if (result.consumeCart) clearCart(cartItems);
-        const info = await checkPaymentNow(code);
+        info = await checkPaymentNow(code);
         if (!mounted.current) return;
         if (info.status === "error") {
           // Đơn đã tạo; vẫn vào màn QR — nút "kiểm tra lại" sẽ lấy lại qrUrl
@@ -356,10 +390,22 @@ export function useCheckout() {
         setPaymentCode(code);
         setQrUrl(info.qrUrl ?? "");
         setOnlineAmount(info.remainingAmount ?? result.totalAmount ?? info.totalAmount ?? 0);
-        setPaymentStatus(info.status === "paid" ? "paid" : "awaiting_payment");
+        if (info.status === "paid") {
+          finishPaid();
+        } else if (info.status === "on_hold" || info.onHold) {
+          setPaymentStatus("on_hold");
+          setQrUrl("");
+          toast.error(
+            "Đơn hàng đang tạm giữ để kiểm tra tồn kho. Vui lòng kiểm tra mục Đơn hàng của tôi hoặc liên hệ hỗ trợ TotMart.",
+          );
+        } else if (info.status === "cancelled" || info.cancelled) {
+          setPaymentStatus("cancelled");
+          setQrUrl("");
+        } else {
+          setPaymentStatus(info.status === "underpaid" ? "underpaid" : "awaiting_payment");
+        }
         // Giỏ đã được tiêu thụ ở BE; giữ paymentCode trên URL để khôi phục sau refresh
         router.replace(`/checkout?code=${encodeURIComponent(code)}`);
-        if (info.status === "paid") setOrderSuccess(true);
       } catch (error) {
         if (mounted.current) toast.error(error.message);
       } finally {
@@ -380,6 +426,7 @@ export function useCheckout() {
       clearCart,
       user,
       router,
+      finishPaid,
     ],
   );
 
@@ -427,10 +474,18 @@ export function useCheckout() {
         finishPaid();
         return;
       }
-      if (info.cancelled) {
+      if (info.cancelled || info.status === "cancelled") {
         handleCancelled();
         return;
       }
+      if (info.onHold || info.status === "on_hold") {
+        setPaymentStatus("on_hold");
+        setQrUrl("");
+        toast.error(
+          "Đơn hàng đang tạm giữ để kiểm tra tồn kho. Vui lòng kiểm tra mục Đơn hàng của tôi hoặc liên hệ hỗ trợ TotMart.",
+        );
+        return;
+      }
       setQrUrl(info.qrUrl || "");
       setOnlineAmount(info.remainingAmount ?? info.totalAmount);
       setPaymentStatus("awaiting_payment");
@@ -494,6 +549,7 @@ export function useCheckout() {
       if (submittingRef.current) return;
       submittingRef.current = true;
       setSubmitting(true);
+      let info = null;
       try {
         const key = contextKey.current || activeAttempt?.key || getPendingCheckout()?.key;
         await startNewCheckout(key);
diff --git a/src/app/hook/useProductDetail.js b/src/app/hook/useProductDetail.js
index 726213d..a680bb9 100644
--- a/src/app/hook/useProductDetail.js
+++ b/src/app/hook/useProductDetail.js
@@ -93,9 +93,16 @@ export function useProductDetail(slug, initialProduct = null) {
       } catch (err) {
         if (!cancelled) {
           setProduct(null);
-          setError(err.response?.status === 404 ? null : "Không tải được thông tin sản phẩm. Hãy kiểm tra kết nối và thử lại.");
+          const status = err.response?.status;
+          const requestId = err.response?.data?.requestId || err.requestId || err.response?.headers?.['x-request-id'];
+          let errorMsg = null;
+          if (status !== 404) {
+            const safeBase = status >= 500 ? "Lỗi hệ thống. Vui lòng thử lại." : (err.response?.data?.message || "Không tải được thông tin sản phẩm. Hãy kiểm tra kết nối và thử lại.");
+            errorMsg = requestId ? `${safeBase} (Mã yêu cầu: ${requestId})` : safeBase;
+          }
+          setError(errorMsg);
           logger.error("Lỗi tải sản phẩm:", err);
-          toast.error("Có lỗi xảy ra khi tải sản phẩm");
+          toast.error(errorMsg || "Có lỗi xảy ra khi tải sản phẩm");
         }
       } finally {
         if (!cancelled) setLoading(false);
diff --git a/src/app/manager/lib/productModel.mjs b/src/app/manager/lib/productModel.mjs
index db64a4b..f639500 100644
--- a/src/app/manager/lib/productModel.mjs
+++ b/src/app/manager/lib/productModel.mjs
@@ -32,7 +32,11 @@ export function validStockAdjustment(delta, stock, reason) {
 }
 
 export function managerError(error, fallback = 'Không thể tải dữ liệu. Vui lòng thử lại.') {
-  return error.response?.data?.errors?.map(item => item.message).filter(Boolean).join('; ') || error.response?.data?.message || (error.isAxiosError ? fallback : error.message) || fallback;
+  const status = error.response?.status;
+  const requestId = error.response?.data?.requestId || error.requestId || error.response?.headers?.['x-request-id'];
+  const baseMsg = error.response?.data?.errors?.map(item => item.message).filter(Boolean).join('; ') || error.response?.data?.message || (error.isAxiosError ? fallback : error.message) || fallback;
+  const safeMsg = (status >= 500) ? 'Lỗi hệ thống. Vui lòng thử lại.' : baseMsg;
+  return requestId ? `${safeMsg} (Request ID: ${requestId})` : safeMsg;
 }
 
 export const money = value => value === null || value === undefined || value === '' || !Number.isFinite(Number(value)) ? 'Chưa có giá' : `${Number(value).toLocaleString('vi-VN')} ₫`;
diff --git a/src/app/services/api/Checkoutpageservice.js b/src/app/services/api/Checkoutpageservice.js
index de9b034..0a5c5fd 100644
--- a/src/app/services/api/Checkoutpageservice.js
+++ b/src/app/services/api/Checkoutpageservice.js
@@ -183,12 +183,35 @@ export async function saveCheckoutAddress(/** @type {any} */ user, /** @type {an
 export function readOrderStatus(/** @type {any} */ response) {
   const data = response.data || {};
   const totalAmount = data.totalAmount ?? data.orders?.reduce((/** @type {number} */ sum, /** @type {any} */ order) => sum + order.totalAmount, 0) ?? 0;
-  const remainingAmount = data.remainingAmount ?? (data.paymentStatus === 'paid' ? 0 : totalAmount);
-  return { status: data.paymentStatus === 'paid' ? 'paid' : data.paymentStatus === 'cancelled' ? 'cancelled' : 'pending',
-    cancelled: data.paymentStatus === 'cancelled' || (data.orders?.some((/** @type {any} */ order) => order.status === 'cancelled') ?? false),
-    payable: Boolean(data.payable), qrUrl: data.payable && remainingAmount > 0 ? data.qrUrl : undefined,
-    totalAmount, receivedAmount: data.receivedAmount ?? 0, remainingAmount, kind: data.kind, expiresAt: data.expiresAt };
-
+  const receivedAmount = data.receivedAmount ?? 0;
+  const remainingAmount = data.remainingAmount ?? (data.paymentStatus === 'paid' ? 0 : Math.max(0, totalAmount - receivedAmount));
+  const isPaid = data.paymentStatus === 'paid';
+  const isCancelled = data.paymentStatus === 'cancelled' || (data.orders?.some((/** @type {any} */ order) => order.status === 'cancelled') ?? false);
+  const isOnHold = Boolean(data.orders?.some((/** @type {any} */ order) => order.status === 'on_hold'));
+  const isUnderpaid = !isPaid && !isCancelled && !isOnHold && receivedAmount > 0 && remainingAmount > 0;
+  const payable = Boolean(data.payable) && !isPaid && !isCancelled && !isOnHold && remainingAmount > 0;
+
+  let derivedStatus = 'pending';
+  if (isOnHold) derivedStatus = 'on_hold';
+  else if (isPaid) derivedStatus = 'paid';
+  else if (isCancelled) derivedStatus = 'cancelled';
+  else if (isUnderpaid) derivedStatus = 'underpaid';
+
+  return {
+    status: derivedStatus,
+    rawStatus: data.paymentStatus,
+    cancelled: isCancelled,
+    onHold: isOnHold,
+    underpaid: isUnderpaid,
+    payable,
+    qrUrl: payable ? data.qrUrl : undefined,
+    totalAmount,
+    receivedAmount,
+    remainingAmount,
+    kind: data.kind,
+    expiresAt: data.expiresAt,
+    orders: data.orders,
+  };
 }
 
 /**
@@ -203,7 +226,17 @@ export function pollPaymentStatus(paymentCode, { intervalMs = 4000, timeoutMs =
   const stop = () => { stopped = true; clearTimeout(timer); clearTimeout(deadline); controller.abort(); };
   const deadline = setTimeout(() => { if (!stopped) { stop(); onStatusChange?.({ status: 'timeout' }); } }, timeoutMs);
   const tick = async () => {
-    try { const response = await paymentGatewayService.getOrderStatus(paymentCode, controller.signal); if (stopped) return; const info = readOrderStatus(response); if (info.status === 'paid' || info.cancelled) { stop(); onStatusChange?.({ ...info, status: info.cancelled ? 'cancelled' : 'paid' }); return; } onStatusChange?.(info); }
+    try {
+      const response = await paymentGatewayService.getOrderStatus(paymentCode, controller.signal);
+      if (stopped) return;
+      const info = readOrderStatus(response);
+      if (info.status === 'paid' || info.cancelled || info.onHold) {
+        stop();
+        onStatusChange?.(info);
+        return;
+      }
+      onStatusChange?.(info);
+    }
     catch { if (stopped) return; } // A transient network error is retried until the wall-clock deadline.
     if (!stopped) timer = setTimeout(tick, intervalMs);
   };
diff --git a/src/app/services/server/serverCatalog.js b/src/app/services/server/serverCatalog.js
index 381870b..ea64c86 100644
--- a/src/app/services/server/serverCatalog.js
+++ b/src/app/services/server/serverCatalog.js
@@ -82,7 +82,7 @@ export async function fetchServerJson(endpointPath, options = {}) {
           ...(options.headers || {}),
         },
         signal: controller.signal,
-        next: options.next,
+        next: options.next || (isGet && !options.cache ? { revalidate: 60 } : undefined),
         cache: options.cache,
       });
 
@@ -100,7 +100,8 @@ export async function fetchServerJson(endpointPath, options = {}) {
           errJson?.message || `Server request failed with status ${res.status}`,
         );
         error.status = res.status;
-        error.requestId = errJson?.requestId;
+        error.requestId =
+          errJson?.requestId || res.headers?.get?.("x-request-id") || undefined;
 
         // User policy: KHÔNG retry 4xx; ném lỗi ngay
         if (res.status >= 400 && res.status < 500) {
@@ -177,6 +178,71 @@ export async function fetchPaginatedServer(endpointPath, queryParams = {}) {
   return items;
 }
 
+export async function getServerProductsCatalog({
+  page = 1,
+  limit = 12,
+  keyword,
+  category,
+  brandSlug,
+  sort,
+} = {}) {
+  const safePage = Math.max(1, parseInt(page, 10) || 1);
+  const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 12));
+  const query = new URLSearchParams({
+    page: String(safePage),
+    limit: String(safeLimit),
+  });
+
+  if (keyword && String(keyword).trim()) {
+    query.set("keyword", String(keyword).trim());
+  }
+  if (category && String(category).trim()) {
+    query.set("category", String(category).trim());
+  }
+  if (brandSlug && String(brandSlug).trim()) {
+    query.set("brandSlug", String(brandSlug).trim());
+  }
+  if (sort) {
+    const s = String(sort).trim();
+    if (s === "price-asc") query.set("sort", "price_asc");
+    else if (s === "price-desc") query.set("sort", "price_desc");
+    else if (s) query.set("sort", s);
+  }
+
+  try {
+    const res = await fetchServerJson(`/products/get-all-products?${query.toString()}`, {
+      cache: "no-store",
+    });
+    if (!res.ok || !res.data) {
+      return {
+        products: [],
+        pagination: { total: 0, totalPages: 1, page: safePage, limit: safeLimit },
+      };
+    }
+    const rawList = Array.isArray(res.data) ? res.data : [];
+    const products = rawList.filter((p) => p && p.isActive !== false && !p.archivedAt);
+    const pagination = res.pagination || {
+      total: products.length,
+      totalPages: Math.max(1, Math.ceil(products.length / safeLimit)),
+      page: safePage,
+      limit: safeLimit,
+    };
+    return { products, pagination };
+  } catch (err) {
+    const status = err?.status;
+    const requestId = err?.requestId;
+    const safeMessage =
+      status >= 500
+        ? "Lỗi hệ thống. Vui lòng thử lại."
+        : err?.message || "Không thể tải danh sách sản phẩm.";
+    return {
+      products: [],
+      pagination: { total: 0, totalPages: 1, page: safePage, limit: safeLimit },
+      error: { message: safeMessage, requestId, status },
+    };
+  }
+}
+
 export async function getServerProducts() {
   const items = await fetchPaginatedServer("/products/get-all-products");
   return items.filter((p) => p && p.isActive !== false && !p.archivedAt);
@@ -215,7 +281,7 @@ export async function getServerBoxDetail(id) {
   if (!id) return null;
   try {
     const [detailRes, contentsRes] = await Promise.allSettled([
-      fetchServerJson(`/boxes/get-box-by-id/${id}`),
+      fetchServerJson(`/boxes/public/${id}`).then((r) => (r.ok ? r : fetchServerJson(`/boxes/get-box-by-id/${id}`))),
       fetchServerJson(`/boxes/get-products-in-box/${id}`),
     ]);
     const box = detailRes.status === "fulfilled" && detailRes.value.ok ? detailRes.value.data : null;
diff --git a/src/app/util/cartLine.mjs b/src/app/util/cartLine.mjs
index 37033b0..e59f68a 100644
--- a/src/app/util/cartLine.mjs
+++ b/src/app/util/cartLine.mjs
@@ -8,7 +8,9 @@ export function giftOptions(value = {}) {
 function itemIdentity(item) {
   const type = item.itemType ?? item.type ?? (item.boxId ? 'box' : 'product');
   if (!['box', 'product'].includes(type)) throw new Error('Cart item type invalid');
-  const value = (type === 'box' ? item.boxId : item.productId) ?? item.id ?? item._id;
+  const rawProduct = (item.productId && typeof item.productId === 'object') ? item.productId._id : item.productId;
+  const productVal = (typeof rawProduct === 'string' && /^[a-f\d]{24}$/i.test(rawProduct)) ? rawProduct : (item._id ?? item.id ?? rawProduct);
+  const value = (type === 'box' ? item.boxId : productVal) ?? item.id ?? item._id;
   const id = typeof value === 'object' && value ? value._id : value;
   if (typeof id !== 'string' || !/^[a-f\d]{24}$/i.test(id)) throw new Error('Cart item ID invalid');
   return { type, id };
diff --git a/tests/f03SeoRendering.test.cjs b/tests/f03SeoRendering.test.cjs
index 2c5eb10..3b4daeb 100644
--- a/tests/f03SeoRendering.test.cjs
+++ b/tests/f03SeoRendering.test.cjs
@@ -10,6 +10,7 @@ const babel = require('next/dist/compiled/babel/core');
 
 const root = path.resolve(__dirname, '../src');
 const modules = new Map();
+let activeRouter = { push() {}, replace() {} };
 
 function load(filename) {
   const resolved = ['', '.js', '.jsx', '.mjs'].map(ext => filename + ext).find(file => fs.existsSync(file));
@@ -48,8 +49,22 @@ function load(filename) {
           err.digest = 'NEXT_NOT_FOUND';
           throw err;
         },
+        redirect(url) {
+          const err = new Error(`NEXT_REDIRECT: ${url}`);
+          err.digest = `NEXT_REDIRECT;replace;${url};307;;`;
+          err.url = url;
+          err.statusCode = 307;
+          throw err;
+        },
+        permanentRedirect(url) {
+          const err = new Error(`NEXT_REDIRECT: ${url}`);
+          err.digest = `NEXT_REDIRECT;replace;${url};308;;`;
+          err.url = url;
+          err.statusCode = 308;
+          throw err;
+        },
         useParams: () => ({ id: 'cat-1', slug: 'brand-1' }),
-        useRouter: () => ({ push() {}, replace() {} }),
+        useRouter: () => activeRouter,
         usePathname: () => '/products',
         useSearchParams: () => new URLSearchParams(),
       };
@@ -74,6 +89,7 @@ function load(filename) {
 const ServerCatalog = load(path.join(root, 'app/services/server/serverCatalog.js'));
 const SitemapModule = load(path.join(root, 'app/sitemap.js'));
 const ProductPageModule = load(path.join(root, 'app/(client)/products/[slug]/page.js'));
+const ProductsCatalogPageModule = load(path.join(root, 'app/(client)/products/page.js'));
 const BoxPageModule = load(path.join(root, 'app/(client)/products/box/[id]/page.js'));
 const CategoryPageModule = load(path.join(root, 'app/(client)/categories/[id]/page.js'));
 const BrandPageModule = load(path.join(root, 'app/(client)/brands/[slug]/page.js'));
@@ -672,3 +688,392 @@ test('ServerCatalog: fetchServerJson retry policy enforces GET-only, 5xx/timeout
   );
   assert.equal(networkAttempts, 3, 'Network error must retry exactly 2 times (3 total attempts)');
 });
+
+test('F03b: /products Server Component renders product names and prices in HTML without JS', async () => {
+  const originalFetch = global.fetch;
+  try {
+    global.fetch = async (url) => {
+      const u = String(url);
+      if (u.includes('/products/get-all-products')) {
+        return {
+          ok: true,
+          status: 200,
+          json: async () => ({
+            success: true,
+            data: [
+              {
+                _id: 'p_catalog_1',
+                name: 'Hạt Sen Sấy Giòn F03b',
+                slug: 'hat-sen-say-gion-f03b',
+                price: 95000,
+                salePercent: 0,
+                stock: 10,
+                images: [{ url: '/assets/lotus.jpg' }],
+                brand: { name: 'Đồng Tháp Organic' },
+              },
+              {
+                _id: 'p_catalog_2',
+                name: 'Trà Cổ Thụ Tà Xùa',
+                slug: 'tra-co-thu-ta-xua',
+                price: 180000,
+                salePercent: 10,
+                stock: 15,
+                images: [{ url: '/assets/tea.jpg' }],
+                brand: { name: 'Tây Bắc Tea' },
+              },
+            ],
+            pagination: { page: 1, limit: 12, total: 26, totalPages: 3 },
+          }),
+        };
+      }
+      return { ok: true, status: 200, json: async () => ({ success: true, data: [] }) };
+    };
+
+    const ProductsPage = ProductsCatalogPageModule.default;
+    const jsx = await ProductsPage({ searchParams: Promise.resolve({ page: '1' }) });
+    const html = ReactDOMServer.renderToString(wrapWithProviders(jsx));
+
+    // Verify product name and price rendered directly into server HTML
+    assert.match(html, /Hạt Sen Sấy Giòn F03b/);
+    assert.match(html, /95\.000/);
+    assert.match(html, /Trà Cổ Thụ Tà Xùa/);
+    assert.match(html, /162\.000/); // 180000 * 0.9 = 162000
+    // Verify semantic product card contains links directly in server HTML
+    assert.match(html, /href="\/products\/hat-sen-say-gion-f03b-p_catalog_1"/);
+  } finally {
+    global.fetch = originalFetch;
+  }
+});
+
+test('F03b: /products generateMetadata produces canonical URL and title with pagination', async () => {
+  // Page 1: default canonical without ?page=1
+  const meta1 = await ProductsCatalogPageModule.generateMetadata({
+    searchParams: Promise.resolve({ page: '1' }),
+  });
+  assert.equal(meta1.title, 'Sản phẩm hữu cơ chọn lọc | TotMart');
+  assert.equal(meta1.alternates.canonical, 'https://totmart.vn/products');
+
+  // Page 2: canonical with ?page=2
+  const meta2 = await ProductsCatalogPageModule.generateMetadata({
+    searchParams: Promise.resolve({ page: '2' }),
+  });
+  assert.equal(meta2.title, 'Sản phẩm hữu cơ - Trang 2 | TotMart');
+  assert.equal(meta2.alternates.canonical, 'https://totmart.vn/products?page=2');
+
+  // Page 3 with search query
+  const meta3 = await ProductsCatalogPageModule.generateMetadata({
+    searchParams: Promise.resolve({ page: '3', search: 'hạt điều' }),
+  });
+  assert.match(meta3.title, /hạt điều/);
+  assert.match(meta3.alternates.canonical, /page=3/);
+  assert.match(meta3.alternates.canonical, /search=/);
+});
+
+test('F03b: multi-page pagination >= 3 pages in getServerProductsCatalog', async () => {
+  const originalFetch = global.fetch;
+  try {
+    global.fetch = async (url) => {
+      const u = new URL(String(url));
+      const page = Number(u.searchParams.get('page') || '1');
+      return {
+        ok: true,
+        status: 200,
+        json: async () => ({
+          success: true,
+          data: [
+            { _id: `prod_p${page}_1`, name: `Product Page ${page} Item 1`, price: 100000 },
+            { _id: `prod_p${page}_2`, name: `Product Page ${page} Item 2`, price: 200000 },
+          ],
+          pagination: { page, limit: 12, total: 30, totalPages: 3 },
+        }),
+      };
+    };
+
+    const p1 = await ServerCatalog.getServerProductsCatalog({ page: 1, limit: 12 });
+    assert.equal(p1.pagination.totalPages, 3);
+    assert.equal(p1.products[0]._id, 'prod_p1_1');
+
+    const p2 = await ServerCatalog.getServerProductsCatalog({ page: 2, limit: 12 });
+    assert.equal(p2.pagination.page, 2);
+    assert.equal(p2.products[0]._id, 'prod_p2_1');
+
+    const p3 = await ServerCatalog.getServerProductsCatalog({ page: 3, limit: 12 });
+    assert.equal(p3.pagination.page, 3);
+    assert.equal(p3.products[0]._id, 'prod_p3_1');
+  } finally {
+    global.fetch = originalFetch;
+  }
+});
+
+test('F03b: canonical slug redirect when accessed via wrong slug or raw ID', async () => {
+  const originalFetch = global.fetch;
+  try {
+    global.fetch = async (url) => {
+      const u = String(url);
+      if (u.includes('/products/get-products-by-id/p_canon_1')) {
+        return {
+          ok: true,
+          status: 200,
+          json: async () => ({
+            success: true,
+            data: {
+              _id: 'p_canon_1',
+              name: 'Hạt Macca Sấy',
+              slug: 'hat-macca-say',
+              price: 150000,
+              stock: 10,
+            },
+          }),
+        };
+      }
+      return { ok: false, status: 404, json: async () => ({}) };
+    };
+
+    // 1. Accessed with wrong slug: wrong-name-p_canon_1 -> redirects 308 to hat-macca-say-p_canon_1 preserving query string
+    await assert.rejects(
+      async () => {
+        await ProductPageModule.default({
+          params: Promise.resolve({ slug: 'wrong-name-p_canon_1' }),
+          searchParams: Promise.resolve({ utm_source: 'fb' }),
+        });
+      },
+      (err) => err.url === '/products/hat-macca-say-p_canon_1?utm_source=fb' && err.statusCode === 308,
+      'Should permanentRedirect 308 to canonical slug in Page'
+    );
+
+    // 2. generateMetadata also redirects 308 when slug is non-canonical
+    await assert.rejects(
+      async () => {
+        await ProductPageModule.generateMetadata({
+          params: Promise.resolve({ slug: 'p_canon_1' }),
+          searchParams: Promise.resolve({ utm_source: 'fb' }),
+        });
+      },
+      (err) => err.url === '/products/hat-macca-say-p_canon_1?utm_source=fb' && err.statusCode === 308,
+      'Should permanentRedirect 308 to canonical slug in generateMetadata'
+    );
+  } finally {
+    global.fetch = originalFetch;
+  }
+});
+
+test('F03b: missing resource calls notFound() in generateMetadata preventing 200 stream', async () => {
+  const originalFetch = global.fetch;
+  try {
+    global.fetch = async () => ({
+      ok: false,
+      status: 404,
+      json: async () => ({ success: false, message: 'Not found' }),
+    });
+
+    // Product metadata: missing product must call notFound()
+    await assert.rejects(
+      async () => {
+        await ProductPageModule.generateMetadata({
+          params: Promise.resolve({ slug: '1' }),
+        });
+      },
+      (err) => err.digest === 'NEXT_NOT_FOUND',
+      'Product generateMetadata must call notFound() when product does not exist'
+    );
+
+    // Box metadata: missing box must call notFound()
+    await assert.rejects(
+      async () => {
+        await BoxPageModule.generateMetadata({
+          params: Promise.resolve({ id: 'nonexistent-box' }),
+        });
+      },
+      (err) => err.digest === 'NEXT_NOT_FOUND',
+      'Box generateMetadata must call notFound() when box does not exist'
+    );
+
+    // Brand metadata: missing brand must call notFound()
+    await assert.rejects(
+      async () => {
+        await BrandPageModule.generateMetadata({
+          params: Promise.resolve({ slug: 'nonexistent-brand' }),
+        });
+      },
+      (err) => err.digest === 'NEXT_NOT_FOUND',
+      'Brand generateMetadata must call notFound() when brand does not exist'
+    );
+
+    // Category metadata: missing category must call notFound()
+    await assert.rejects(
+      async () => {
+        await CategoryPageModule.generateMetadata({
+          params: Promise.resolve({ id: 'nonexistent-cat' }),
+        });
+      },
+      (err) => err.digest === 'NEXT_NOT_FOUND',
+      'Category generateMetadata must call notFound() when category does not exist'
+    );
+  } finally {
+    global.fetch = originalFetch;
+  }
+});
+
+test('F03c / D2: next.config.mjs configures cookie-aware caching with Vary and private authenticated rules', async () => {
+  const nextConfigModule = await import('../next.config.mjs');
+  const nextConfig = nextConfigModule.default;
+  const headersList = await nextConfig.headers();
+
+  // Anonymous public catalog: requires missing token and refreshToken cookies, sets public s-maxage and Vary
+  const publicProductRules = headersList.filter((h) => h.source === '/products');
+  assert.ok(publicProductRules.length >= 3, 'Must have rules for anonymous, token, and refreshToken');
+
+  const anonRule = publicProductRules.find((h) => h.missing && h.missing.some((m) => m.key === 'token'));
+  assert.ok(anonRule, 'Rule for anonymous /products must exist');
+  assert.deepEqual(anonRule.missing, [
+    { type: 'cookie', key: 'token' },
+    { type: 'cookie', key: 'refreshToken' },
+  ]);
+  const anonCache = anonRule.headers.find((h) => h.key === 'Cache-Control');
+  assert.equal(anonCache.value, 'public, s-maxage=60, stale-while-revalidate=300');
+  const anonVary = anonRule.headers.find((h) => h.key === 'Vary');
+  assert.equal(anonVary.value, 'Accept-Encoding, Cookie');
+
+  // Authenticated catalog: token cookie present -> private no-cache no-store
+  const tokenRule = publicProductRules.find((h) => h.has && h.has.some((m) => m.key === 'token'));
+  assert.ok(tokenRule, 'Rule for token cookie must exist');
+  const tokenCache = tokenRule.headers.find((h) => h.key === 'Cache-Control');
+  assert.equal(tokenCache.value, 'private, no-cache, no-store, max-age=0, must-revalidate');
+
+  // Authenticated catalog: refreshToken cookie present -> private no-cache no-store
+  const refreshRule = publicProductRules.find((h) => h.has && h.has.some((m) => m.key === 'refreshToken'));
+  assert.ok(refreshRule, 'Rule for refreshToken cookie must exist');
+  const refreshCache = refreshRule.headers.find((h) => h.key === 'Cache-Control');
+  assert.equal(refreshCache.value, 'private, no-cache, no-store, max-age=0, must-revalidate');
+
+  // Checkout route: always private
+  const checkoutRule = headersList.find((h) => h.source === '/checkout');
+  assert.ok(checkoutRule, 'Rule for /checkout must exist');
+  const checkoutCacheHeader = checkoutRule.headers.find((h) => h.key === 'Cache-Control');
+  assert.equal(checkoutCacheHeader.value, 'private, no-cache, no-store, max-age=0, must-revalidate');
+});
+
+test('F03c / D5: MerchantRedirectGuard redirects merchant to /manager; anonymous and admin unaffected', () => {
+  const MerchantRedirectGuardModule = load(path.join(root, 'app/(client)/MerchantRedirectGuard.jsx'));
+  const MerchantRedirectGuard = MerchantRedirectGuardModule.default;
+
+  let currentContext = { user: null, isLoading: false };
+  let replacedUrl = null;
+
+  const mockRouter = {
+    replace(url) {
+      replacedUrl = url;
+    },
+  };
+
+  const origUseContext = React.useContext;
+  const origUseEffect = React.useEffect;
+
+  const origRouter = activeRouter;
+  try {
+    activeRouter = mockRouter;
+    React.useContext = (ctx) => {
+      if (ctx === AppContext) return currentContext;
+      return origUseContext(ctx);
+    };
+    // Execute effect synchronously during test run
+    React.useEffect = (effect) => {
+      effect();
+    };
+
+    // Case 1: Merchant role -> redirects to /manager
+    currentContext = { user: { role: 'merchant', name: 'Seller 1' }, isLoading: false };
+    replacedUrl = null;
+    MerchantRedirectGuard();
+    assert.equal(replacedUrl, '/manager', 'Merchant role must be redirected to /manager');
+
+    // Case 2: Anonymous user -> no redirect
+    currentContext = { user: null, isLoading: false };
+    replacedUrl = null;
+    MerchantRedirectGuard();
+    assert.equal(replacedUrl, null, 'Anonymous user must NOT be redirected');
+
+    // Case 3: Admin role -> no redirect
+    currentContext = { user: { role: 'admin', name: 'Administrator' }, isLoading: false };
+    replacedUrl = null;
+    MerchantRedirectGuard();
+    assert.equal(replacedUrl, null, 'Admin user must NOT be redirected');
+
+    // Case 4: Customer role -> no redirect
+    currentContext = { user: { role: 'customer', name: 'Shopper' }, isLoading: false };
+    replacedUrl = null;
+    MerchantRedirectGuard();
+    assert.equal(replacedUrl, null, 'Customer role must NOT be redirected');
+
+    // Case 5: Merchant still loading -> no redirect until loaded
+    currentContext = { user: { role: 'merchant', name: 'Seller 1' }, isLoading: true };
+    replacedUrl = null;
+    MerchantRedirectGuard();
+    assert.equal(replacedUrl, null, 'Merchant while isLoading=true must NOT trigger premature redirect');
+  } finally {
+    activeRouter = origRouter;
+    React.useContext = origUseContext;
+    React.useEffect = origUseEffect;
+  }
+});
+
+test('F03c / D6: blocked localStorage falls back to in-memory cart and keep Add to Cart functional', () => {
+  const { read, store, cartReducer } = CartModule;
+  const ProductPurchasePanelModule = load(path.join(root, 'app/(client)/components/Product/ProductPurchasePanel.js'));
+  const { ProductPurchasePanel } = ProductPurchasePanelModule;
+
+  const originalLocalStorage = global.localStorage;
+  try {
+    // Simulate completely blocked localStorage (SecurityError)
+    Object.defineProperty(global, 'localStorage', {
+      get() {
+        throw new Error('SecurityError: The operation is insecure.');
+      },
+      configurable: true,
+    });
+
+    // 1. read() safely returns empty defaults without throwing
+    assert.doesNotThrow(() => {
+      const result = read('totmart_cart_guest');
+      assert.deepEqual(result, { items: [], version: 0, present: false });
+    }, 'read() must not throw when localStorage is blocked');
+
+    // 2. store() safely no-ops without throwing
+    assert.doesNotThrow(() => {
+      store('totmart_cart_guest', JSON.stringify({ items: [], version: 0 }));
+    }, 'store() must not throw when localStorage is blocked');
+
+    // 3. In-memory reducer handles cart operations
+    const initialState = { items: [], version: 0 };
+    const nextState = cartReducer(initialState, {
+      type: 'ADD_ITEM',
+      normalized: { _id: 'prod_sec_1', name: 'Organic Tea', price: 50000, itemType: 'product' },
+      quantity: 2,
+    });
+    assert.equal(nextState.items.length, 1);
+    assert.equal(nextState.items[0]._id, 'prod_sec_1');
+    assert.equal(nextState.items[0].quantity, 2);
+
+    // 4. ProductPurchasePanel with isReady=true renders active (not disabled) Add to Cart button
+    const rendered = ReactDOMServer.renderToString(
+      React.createElement(ProductPurchasePanel, {
+        product: { name: 'Organic Tea', price: 50000, stock: 10 },
+        finalPrice: 50000,
+        quantity: 1,
+        isReady: true,
+        isAddingToCart: false,
+        onAddToCart: () => {},
+        fmtPrice: (n) => `${n} đ`,
+      })
+    );
+    assert.match(rendered, /Thêm vào giỏ hàng/);
+    assert.doesNotMatch(rendered, /disabled="" class="[^"]*tm-button--primary/);
+  } finally {
+    Object.defineProperty(global, 'localStorage', {
+      value: originalLocalStorage,
+      configurable: true,
+      writable: true,
+    });
+  }
+});
+
diff --git a/tests/helpers/attemptHarness.cjs b/tests/helpers/attemptHarness.cjs
index b3c1c32..4d187a6 100644
--- a/tests/helpers/attemptHarness.cjs
+++ b/tests/helpers/attemptHarness.cjs
@@ -3,7 +3,7 @@ module.exports = function setup({storageFails=false, storage=new Map(), loseFirs
   const calls=[], saved=[], sync=[], http=[];
   const storageApi={getItem:k=>{if(storageFails)throw Error('denied');return storage.get(k)||null;},setItem:(k,v)=>{if(storageFails)throw Error('denied');storage.set(k,v);},removeItem:k=>storage.delete(k)};
   const context=vm.createContext({crypto:require('node:crypto').webcrypto,localStorage:storageApi,sessionStorage:storageApi,
-    setTimeout:globalThis.setTimeout,clearTimeout:globalThis.clearTimeout,
+    AbortController:globalThis.AbortController,setTimeout:globalThis.setTimeout,clearTimeout:globalThis.clearTimeout,
     navigator:{locks:{request:async(_scope,fn)=>fn()}},getTokenUserId:()=>userId,
     syncCartApi:async(items,version)=>{sync.push({items,version});return {version:3};},
     checkoutService:{createOrder:async(payload,key)=>{calls.push({payload,key});if(loseFirstCreate && calls.length===1)throw Error('lost response');return {success:true,data:{orderCode:'original',orderId:'id',totalAmount:12345}};}},
diff --git a/tests/qrPayment.test.cjs b/tests/qrPayment.test.cjs
index 44196ad..702aac2 100644
--- a/tests/qrPayment.test.cjs
+++ b/tests/qrPayment.test.cjs
@@ -178,3 +178,124 @@ test("checkout success consumes the actual unwrapped response shape", async () =
   assert.equal(result.orderCode, "original");
   assert.equal(result.totalAmount, 12345);
 });
+
+
+test("readOrderStatus derives paid, cancelled, on_hold, underpaid and payable flags without client clock drift", () => {
+  const { context: c } = require("./helpers/attemptHarness.cjs")();
+
+  // Paid
+  const paid = c.readOrderStatus({ data: { paymentStatus: "paid", totalAmount: 100000, payable: true } });
+  assert.equal(paid.status, "paid");
+  assert.equal(paid.payable, false);
+  assert.equal(paid.remainingAmount, 0);
+
+  // Cancelled via paymentStatus
+  const cancelled1 = c.readOrderStatus({ data: { paymentStatus: "cancelled", totalAmount: 100000, payable: true } });
+  assert.equal(cancelled1.status, "cancelled");
+  assert.equal(cancelled1.cancelled, true);
+  assert.equal(cancelled1.payable, false);
+
+  // Cancelled via order status
+  const cancelled2 = c.readOrderStatus({ data: { paymentStatus: "pending", totalAmount: 100000, payable: true, orders: [{ status: "cancelled" }] } });
+  assert.equal(cancelled2.status, "cancelled");
+  assert.equal(cancelled2.cancelled, true);
+  assert.equal(cancelled2.payable, false);
+
+  // Clock drift: BE says pending + payable=true, client clock should NOT force expired
+  const past = new Date(Date.now() - 60000).toISOString();
+  const clientClockDrift = c.readOrderStatus({ data: { paymentStatus: "pending", totalAmount: 100000, payable: true, expiresAt: past } });
+  assert.equal(clientClockDrift.status, "pending");
+  assert.equal(clientClockDrift.payable, true);
+  assert.equal(clientClockDrift.cancelled, false);
+
+  // On-hold: in BE reality, on_hold occurs after payment is settled (paymentStatus === 'paid')
+  const onHold = c.readOrderStatus({
+    data: {
+      paymentStatus: "paid",
+      totalAmount: 100000,
+      payable: false,
+      orders: [{ orderId: "ORD-HOLD", status: "on_hold", paymentStatus: "paid" }],
+    },
+  });
+  assert.equal(onHold.status, "on_hold");
+  assert.equal(onHold.onHold, true);
+  assert.equal(onHold.payable, false);
+
+  // Underpaid (partially paid, still active)
+  const future = new Date(Date.now() + 600000).toISOString();
+  const underpaid = c.readOrderStatus({ data: { paymentStatus: "pending", totalAmount: 100000, receivedAmount: 40000, payable: true, expiresAt: future, qrUrl: "https://qr" } });
+  assert.equal(underpaid.status, "underpaid");
+  assert.equal(underpaid.underpaid, true);
+  assert.equal(underpaid.remainingAmount, 60000);
+  assert.equal(underpaid.payable, true);
+  assert.equal(underpaid.qrUrl, "https://qr");
+
+  // Normal pending
+  const pending = c.readOrderStatus({ data: { paymentStatus: "pending", totalAmount: 100000, payable: true, expiresAt: future, qrUrl: "https://qr" } });
+  assert.equal(pending.status, "pending");
+  assert.equal(pending.payable, true);
+});
+
+for (const terminalStatus of ["paid", "cancelled", "on_hold"]) {
+  test(`pollPaymentStatus stops immediately when status is ${terminalStatus}`, async () => {
+    const { context: c } = require("./helpers/attemptHarness.cjs")();
+    let pollCalls = 0;
+    const history = [];
+
+    const mockResponse = {
+      paid: { data: { paymentStatus: "paid" } },
+      cancelled: { data: { paymentStatus: "cancelled" } },
+      on_hold: { data: { paymentStatus: "paid", orders: [{ status: "on_hold", paymentStatus: "paid" }] } },
+    }[terminalStatus];
+
+    c.paymentGatewayService = {
+      getOrderStatus: async () => {
+        pollCalls++;
+        return mockResponse;
+      },
+    };
+
+    const stop = c.pollPaymentStatus("CODE123", {
+      intervalMs: 20,
+      timeoutMs: 500,
+      onStatusChange: (info) => history.push(info),
+    });
+
+    await new Promise((r) => setTimeout(r, 80));
+    stop();
+
+    assert.equal(pollCalls, 1, `Polling must stop after 1 call on ${terminalStatus}`);
+    assert.equal(history.length, 1);
+    assert.equal(history[0].status, terminalStatus);
+  });
+}
+
+test("pollPaymentStatus continues polling on underpaid and pending until stopped", async () => {
+  const { context: c } = require("./helpers/attemptHarness.cjs")();
+  let pollCalls = 0;
+  const history = [];
+
+  const future = new Date(Date.now() + 600000).toISOString();
+  c.paymentGatewayService = {
+    getOrderStatus: async () => {
+      pollCalls++;
+      if (pollCalls === 1) {
+        return { data: { paymentStatus: "pending", totalAmount: 100000, expiresAt: future } };
+      }
+      return { data: { paymentStatus: "pending", totalAmount: 100000, receivedAmount: 30000, expiresAt: future } };
+    },
+  };
+
+  const stop = c.pollPaymentStatus("CODE123", {
+    intervalMs: 25,
+    timeoutMs: 500,
+    onStatusChange: (info) => history.push(info),
+  });
+
+  await new Promise((r) => setTimeout(r, 90));
+  stop();
+
+  assert.ok(pollCalls >= 3, `Expected at least 3 polls, got ${pollCalls}`);
+  assert.equal(history[0].status, "pending");
+  assert.equal(history[1].status, "underpaid");
+});

`
