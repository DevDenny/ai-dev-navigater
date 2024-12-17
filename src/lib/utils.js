import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// 用于合并 CSS 类名的工具函数
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// 生成 slug 的工具函数
export function generateSlug(title) {
  if (!title) return '';
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// 验证 slug 的工具函数
export function validateSlug(slug) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
} 