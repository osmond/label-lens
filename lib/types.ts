export interface UserProfile {
  restrictions: string[];
  customAllergens: string[];
}

export interface IngredientCard {
  name: string;
  plain: string;
  purpose: string;
  safety: "safe" | "caution" | "avoid" | "neutral";
}

export interface FlaggedItem {
  ingredient: string;
  reason: string;
}

export interface AnalysisResult {
  summary: string;
  verdict: "safe" | "warning" | "danger";
  flagged: FlaggedItem[];
  ingredients: IngredientCard[];
}
