import {
  getAllBrandsApi,
  deleteBrandApi,
} from "@/app/services/api/productServices";
import { parseApiResponse } from "../../utils/parseApiResponse";

export async function fetchAdminBrands() {
  const res = await getAllBrandsApi();
  return parseApiResponse(res);
}

export async function deleteAdminBrand(id) {
  return deleteBrandApi(id);
}
