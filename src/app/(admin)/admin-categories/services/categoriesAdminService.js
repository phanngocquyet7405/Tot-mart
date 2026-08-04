import {
  getAllCategoriesApi,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
} from "@/app/services/api/productServices";
import { parseApiResponse } from "../../utils/parseApiResponse";

export async function fetchAdminCategories() {
  const res = await getAllCategoriesApi();
  return parseApiResponse(res);
}

// Không có endpoint lấy category theo id riêng, nên lấy cả danh sách rồi tìm.
export async function fetchAdminCategoryById(id) {
  const categories = await fetchAdminCategories();
  return categories.find((c) => c._id === id) || null;
}

export async function deleteAdminCategory(id) {
  return deleteCategoryApi(id);
}

/**
 * Chuẩn hoá 1 mảng childrenIds có thể chứa cả string ID lẫn object đã populate
 * về thành mảng string ID sạch.
 */
export function normalizeChildrenIds(childrenIds) {
  return (childrenIds || [])
    .map((item) => {
      if (typeof item === "string") return item;
      return item?.categoryId || item?._id;
    })
    .filter(Boolean);
}

/**
 * Tính stats cho dashboard danh mục: tổng số, số đang active, số root
 * (root = category không nằm trong childrenIds của bất kỳ ai).
 */
export function getCategoryStats(categories) {
  const allChildIds = new Set(
    categories.flatMap((cat) => cat.childrenIds || []),
  );
  return {
    total: categories.length,
    active: categories.filter((c) => c.isActive).length,
    root: categories.filter((c) => !allChildIds.has(c._id)).length,
  };
}

/**
 * Lọc + dựng cây phân cấp category dựa trên childrenIds[], theo đúng logic
 * gốc: search ưu tiên trước, sau đó filter theo loại (active/root/all),
 * và chỉ dựng cây thật sự khi filterType === "all" và không search.
 */
export function buildCategoryView(categories, { searchQuery, filterType }) {
  if (!categories.length) return [];

  let filteredData = [...categories];

  if (searchQuery) {
    return filteredData.filter((cat) =>
      cat.name?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }

  const allChildIds = new Set(
    categories.flatMap((cat) => cat.childrenIds || []),
  );

  if (filterType === "active") {
    return filteredData.filter((c) => c.isActive);
  }
  if (filterType === "root") {
    return filteredData.filter((c) => !allChildIds.has(c._id));
  }

  // filterType === "all" -> dựng cây thật sự
  const map = {};
  categories.forEach((cat) => {
    map[cat._id] = { ...cat, children: [] };
  });

  const tree = [];
  categories.forEach((cat) => {
    if (cat.childrenIds && cat.childrenIds.length > 0) {
      cat.childrenIds.forEach((childId) => {
        if (map[childId]) map[cat._id].children.push(map[childId]);
      });
    }
    if (!allChildIds.has(cat._id)) {
      tree.push(map[cat._id]);
    }
  });
  return tree;
}

/**
 * Tạo category mới, sau đó nếu có parentId thì đồng bộ childrenIds của cha
 * (2 bước, đúng hành vi gốc: tạo trước rồi mới link vào cha).
 */
export async function createAdminCategory({ form, parentId, existingCategories }) {
  const createPayload = {
    name: form.name.trim(),
    description: form.description.trim(),
    isActive: form.isActive,
    childrenIds: [],
  };

  const createRes = await createCategoryApi(createPayload);
  const newCategory = createRes?.data?.data || createRes?.data;
  const newId = newCategory?._id;

  if (!newId) {
    throw new Error("Không lấy được ID của danh mục mới");
  }

  if (parentId) {
    const parentDoc = existingCategories.find((c) => c._id === parentId);
    if (parentDoc) {
      const currentChildrenIds = normalizeChildrenIds(parentDoc.childrenIds);
      const updatedChildren = Array.from(
        new Set([...currentChildrenIds, newId]),
      );
      await updateCategoryApi(parentId, { childrenIds: updatedChildren });
    }
  }

  return newId;
}

export async function updateAdminCategory(id, formData) {
  const payload = {
    name: formData.name.trim(),
    description: formData.description.trim(),
    isActive: formData.isActive,
    childrenIds: normalizeChildrenIds(formData.childrenIds),
  };
  return updateCategoryApi(id, payload);
}
