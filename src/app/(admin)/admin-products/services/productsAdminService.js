import {
  getAllProductsApi,
  getAllCategoriesApi,
  getAllBrandsApi,
  deleteProductApi,
} from "@/app/services/api/productServices";
import { parseApiResponse } from "../../utils/parseApiResponse";

export async function fetchAdminProductsPage(params) { const res = await getAllProductsApi(params); return { products: parseApiResponse(res), pagination: res.pagination }; }

export async function fetchAdminProducts() {
  const res = await getAllProductsApi();
  return parseApiResponse(res);
}

export async function fetchAdminCategories() {
  const res = await getAllCategoriesApi();
  return parseApiResponse(res);
}

export async function fetchAdminBrands() {
  const res = await getAllBrandsApi();
  return parseApiResponse(res);
}

export async function fetchAdminProductFilters() {
  const [categories, brands] = await Promise.all([
    fetchAdminCategories(),
    fetchAdminBrands(),
  ]);
  return { categories, brands };
}

export async function deleteAdminProduct(id) {
  return deleteProductApi(id);
}

export async function deleteAdminProducts(ids) {
  await Promise.all(ids.map((id) => deleteProductApi(id)));
}

export function formatProductPrice(price) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price ?? 0);
}

export function getProductStockStatus(stock) {
  const qty = stock ?? 0;
  if (qty <= 0) return { label: "Hết hàng", variant: "destructive" };
  if (qty <= 10) return { label: `Sắp hết (${qty})`, variant: "warning" };
  return { label: `Còn hàng (${qty})`, variant: "success" };
}
