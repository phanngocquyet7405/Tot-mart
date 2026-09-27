import {
  getAllBrandsApi,
  createBrandApi,
  updateBrandApi,
  deleteBrandApi,
} from "@/app/services/api/productServices";
import { parseApiResponse } from "../../utils/parseApiResponse";

/**
 * Backend Brand model chỉ có: name, description, cityAddress, logo (file), slug (tự sinh).
 * KHÔNG có field "website" — nếu thêm lại field này ở form thì payload sẽ bị Joi bỏ qua
 * (updateBrandSchema/brandSchema không khai báo "website" nên Joi sẽ strip nó).
 */
export async function fetchAdminBrands() {
  const res = await getAllBrandsApi();
  return parseApiResponse(res);
}

export async function fetchAdminBrandById(id) {
  const brands = await fetchAdminBrands();
  return brands.find((b) => b._id === id) || null;
}

/**
 * Dựng FormData cho create/update. `logoFile` là File object (từ <input type="file">),
 * chỉ được đính kèm khi người dùng thực sự chọn ảnh mới.
 */
function buildBrandFormData({ name, description, cityAddress, logoFile }) {
  const formData = new FormData();
  if (name != null) formData.append("name", name.trim());
  if (description) formData.append("description", description.trim());
  if (cityAddress) formData.append("cityAddress", cityAddress.trim());
  if (logoFile) formData.append("logo", logoFile);
  return formData;
}

export async function createAdminBrand(form) {
  const formData = buildBrandFormData(form);
  return createBrandApi(formData);
}

export async function updateAdminBrand(id, form) {
  const formData = buildBrandFormData(form);
  return updateBrandApi(id, formData);
}

export async function deleteAdminBrand(id) {
  return deleteBrandApi(id);
}
