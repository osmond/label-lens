import { UserProfile } from "./types";

const STORAGE_KEY = "label-lens-profile";

export const COMMON_RESTRICTIONS = [
  "Vegan",
  "Vegetarian",
  "Gluten-free",
  "Halal",
  "Kosher",
  "Low-FODMAP",
  "Keto",
  "Dairy-free",
  "Nut-free",
  "Soy-free",
];

export function loadProfile(): UserProfile {
  if (typeof window === "undefined") return { restrictions: [], customAllergens: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { restrictions: [], customAllergens: [] };
    return JSON.parse(raw);
  } catch {
    return { restrictions: [], customAllergens: [] };
  }
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}
