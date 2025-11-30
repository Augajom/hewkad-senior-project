const API_BASE = "https://hewkad.com/api";

export function resolveImg(src) {
  if (!src) return ""; // คืนค่าว่างถ้า src เป็น null/undefined
  if (src.startsWith("data:") || src.startsWith("http")) return src;
  const path = src.startsWith("/") ? src : `/${src}`;
  return `${API_BASE}${path}`;
}