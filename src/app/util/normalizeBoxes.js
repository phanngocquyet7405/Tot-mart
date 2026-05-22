export const normalizeBoxes = (res) => {
  const data = res?.data || res;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.boxes)) return data.boxes;

  return [];
};
