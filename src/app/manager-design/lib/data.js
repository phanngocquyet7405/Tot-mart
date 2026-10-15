import { products as seedProducts, combos, orders, fetchProducts, fetchCombos, fetchOrders, statusLabels, paymentStatusLabels, statusTone } from "@/app/manager/lib/mock"
export { seedProducts, combos, orders, fetchProducts, fetchCombos, fetchOrders, statusLabels, paymentStatusLabels, statusTone }
export const money = (value) => `${Number(value || 0).toLocaleString("vi-VN")} ₫`
export const productImage = (product) => product.images?.[0]?.url || product.image || ""
export const stockTone = (stock) => stock === 0 ? "destructive" : stock <= 10 ? "warning" : "success"
export const productCategories = [...new Set(seedProducts.map((product) => product.category?.name).filter(Boolean))]
export const productBrands = [...new Set(seedProducts.map((product) => product.brand?.name).filter(Boolean))]
export const orderStatuses = Object.entries(statusLabels)
export const paymentMethods = [["cod", "COD"], ["online", "Online"]]
export const paymentStatuses = Object.entries(paymentStatusLabels)

export function getOrderTimeline(order) {
  const steps = ["pending", "processing", "shipped", "delivered"]
  const index = steps.indexOf(order.status)
  return steps.map((step, stepIndex) => ({ step, done: index >= stepIndex, current: step === order.status }))
}
export function formatDate(value) { return new Date(value).toLocaleDateString("vi-VN") }
export function statusText(status) { return statusLabels[status] || status }
export function stockText(stock) { return stock === 0 ? "Hết hàng" : `${stock} sản phẩm` }
export function cloneProduct(product) { return product ? { ...product, brand: { ...product.brand }, category: { ...product.category }, images: [...(product.images || [])] } : { name: "", description: "", price: "", stock: 0, brand: { name: "" }, category: { name: "" }, images: [] } }
export const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))
