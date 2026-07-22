import { getAllProductsApi } from "@/app/services/api/productServices";
import { getAllCategoriesApi } from "@/app/services/api/productServices";
import { getAllBrandsApi } from "@/app/services/api/productServices";
import { getAllBoxesApi } from "@/app/services/api/boxService";
import { userService } from "@/app/services/api/userService";
import { getAllTemplatesApi } from "@/app/services/api/subscribePlanService";
import { parseApiResponse } from "../../utils/parseApiResponse";

export async function fetchDashboardStats() {
  const [
    productsRes,
    categoriesRes,
    brandsRes,
    boxesRes,
    usersRes,
    plansRes,
  ] = await Promise.allSettled([
    getAllProductsApi(),
    getAllCategoriesApi(),
    getAllBrandsApi(),
    getAllBoxesApi(),
    userService.getAllUsers(1, 1000),
    getAllTemplatesApi(),
  ]);

  const products =
    productsRes.status === "fulfilled"
      ? parseApiResponse(productsRes.value)
      : [];
  const categories =
    categoriesRes.status === "fulfilled"
      ? parseApiResponse(categoriesRes.value)
      : [];
  const brands =
    brandsRes.status === "fulfilled"
      ? parseApiResponse(brandsRes.value)
      : [];
  const boxes =
    boxesRes.status === "fulfilled"
      ? parseApiResponse(boxesRes.value)
      : [];
  const users =
    usersRes.status === "fulfilled"
      ? parseApiResponse(usersRes.value)
      : [];
  const plans =
    plansRes.status === "fulfilled"
      ? parseApiResponse(plansRes.value)
      : [];

  const lowStockProducts = products.filter(
    (p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 10,
  ).length;
  const outOfStockProducts = products.filter(
    (p) => (p.stock ?? 0) <= 0,
  ).length;

  return {
    products: products.length,
    categories: categories.length,
    brands: brands.length,
    boxes: boxes.length,
    users: users.length,
    subscribePlans: plans.length,
    lowStockProducts,
    outOfStockProducts,
  };
}
