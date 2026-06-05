import { AnalysisResult } from "./types";

export const MOCK_RESULT: AnalysisResult = {
  productName: "Kraft Classic Caesar Dressing",
  summary:
    "This appears to be a classic Caesar salad dressing — a creamy, tangy condiment made with anchovies, egg, parmesan, lemon, and garlic. It is not suitable for vegans, vegetarians, or people with fish, egg, dairy, or gluten allergies.",
  verdict: "warning",
  flagged: [
    {
      ingredient: "Anchovy paste",
      reason:
        "Direct fish allergen — not suitable for pescatarians avoiding fish, vegetarians, or vegans. Also affects halal/kosher diets unless certified.",
      type: "confirmed",
      safeAlternative: "Capers or miso paste for a similar umami depth",
    },
    {
      ingredient: "Worcestershire sauce",
      reason:
        "Hidden fish source — Worcestershire sauce typically contains anchovies, making it a secondary fish allergen many people overlook.",
      type: "hidden",
      safeAlternative: "Vegan Worcestershire sauce (e.g. Lea & Perrins Vegan)",
    },
    {
      ingredient: "Parmesan cheese",
      reason:
        "Contains dairy and uses animal rennet, making it unsuitable for vegans and those who are dairy-free. Traditional Parmesan is not vegetarian due to rennet.",
      type: "confirmed",
      safeAlternative: "Nutritional yeast or vegan Parmesan for a similar savory flavour",
    },
    {
      ingredient: "Egg yolk",
      reason: "Animal product — not suitable for vegans or those with egg allergies.",
      type: "confirmed",
      safeAlternative: "Aquafaba or silken tofu as an emulsifier",
    },
  ],
  ingredients: [
    {
      name: "Vegetable oil (soybean, canola)",
      plain: "A blend of plant-based oils that form the base of the dressing.",
      purpose: "Carrier / base",
      safety: "safe",
    },
    {
      name: "Water",
      plain: "Plain water used to adjust consistency.",
      purpose: "Diluent",
      safety: "neutral",
    },
    {
      name: "Parmesan cheese (milk, cheese cultures, salt, enzymes)",
      plain: "Aged Italian hard cheese made from cow's milk.",
      purpose: "Flavoring / umami",
      safety: "caution",
    },
    {
      name: "Anchovy paste",
      plain: "Concentrated paste made from salted, fermented anchovies (small fish).",
      purpose: "Flavoring / umami",
      safety: "avoid",
    },
    {
      name: "Egg yolk",
      plain: "The yellow part of a chicken egg, used to emulsify the dressing.",
      purpose: "Emulsifier",
      safety: "caution",
    },
    {
      name: "Lemon juice concentrate",
      plain: "Concentrated lemon juice that adds acidity and brightness.",
      purpose: "Acidulant / flavoring",
      safety: "safe",
    },
    {
      name: "Garlic",
      plain: "Minced or powdered garlic for savory flavor.",
      purpose: "Flavoring",
      safety: "safe",
    },
    {
      name: "Worcestershire sauce",
      plain: "A fermented condiment — contains anchovies, tamarind, vinegar, and spices.",
      purpose: "Flavoring / depth",
      safety: "avoid",
    },
    {
      name: "Dijon mustard",
      plain: "A smooth French mustard made from mustard seeds, vinegar, and white wine.",
      purpose: "Emulsifier / flavoring",
      safety: "caution",
    },
    {
      name: "Salt",
      plain: "Common table salt.",
      purpose: "Seasoning / preservative",
      safety: "neutral",
    },
    {
      name: "Black pepper",
      plain: "Ground black peppercorns.",
      purpose: "Flavoring / spice",
      safety: "safe",
    },
    {
      name: "Xanthan gum",
      plain: "A natural thickener produced by fermentation — helps keep the dressing from separating.",
      purpose: "Stabilizer / thickener",
      safety: "safe",
    },
    {
      name: "Calcium disodium EDTA",
      plain: "A preservative that prevents the dressing from discoloring.",
      purpose: "Preservative / chelating agent",
      safety: "neutral",
    },
  ],
};
