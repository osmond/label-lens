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
  type: "confirmed" | "hidden" | "cross-contamination";
  safeAlternative?: string;
}

export interface AnalysisResult {
  productName?: string;
  summary: string;
  verdict: "safe" | "warning" | "danger";
  qualityScore?: number;
  personalWarnings?: string[];
  flagged: FlaggedItem[];
  ingredients: IngredientCard[];
}

export interface HistoryScan {
  id: string;
  timestamp: number;
  productName: string;
  verdict: "safe" | "warning" | "danger";
  result: AnalysisResult;
  inputType: "image" | "text";
}
