import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { UserProfile, AnalysisResult } from "@/lib/types";
import { MOCK_RESULT } from "@/lib/mockData";

const isMock = process.env.MOCK_MODE === "true";
const client = isMock ? null : new Anthropic();

function buildSystemPrompt(profile: UserProfile): string {
  const restrictionsList = profile.restrictions.length
    ? profile.restrictions.join(", ")
    : "none specified";
  const allergensList = profile.customAllergens.length
    ? profile.customAllergens.join(", ")
    : "none specified";

  return `You are a food safety expert and ingredient analyst. Your job is to decode food ingredient lists for people with specific dietary needs.

The user has the following dietary profile:
- Dietary restrictions: ${restrictionsList}
- Custom allergens/ingredients to avoid: ${allergensList}

CRITICAL INSTRUCTIONS:
1. Reason carefully about HIDDEN sources of allergens. Examples:
   - "Malt vinegar" contains gluten (barley)
   - "Caesar dressing" often contains anchovies (fish)
   - "E471" is mono- and diglycerides which may be animal-derived (not vegan)
   - "Natural flavors" may contain animal products, gluten, or other allergens
   - "Worcestershire sauce" contains anchovies
   - "Lactic acid" is usually vegan but can be dairy-derived
   - "Carmine/E120" is a red dye from insects (not vegan/halal/kosher)
   - "Lupin flour" is a legume allergen related to peanuts
   - "Spices" blends may contain celery, mustard, or other allergens
   - "Modified starch" may be wheat-derived
   - Shared equipment warnings count as caution, not necessarily avoid

2. For EACH ingredient, give a plain-English name, its functional role in the product, and a safety rating:
   - "avoid" = directly conflicts with user's profile
   - "caution" = may conflict, hidden source, or cross-contamination risk
   - "safe" = confirmed safe for this user's profile
   - "neutral" = no relevance to profile (use when profile doesn't apply)

3. If no profile is set (no restrictions or allergens), rate all ingredients as neutral unless they're generally concerning (known major allergens).

4. Your verdict should be:
   - "safe" = nothing conflicts with the user's profile
   - "warning" = possible hidden sources or caution items, but no confirmed conflicts
   - "danger" = one or more ingredients definitely conflict with the profile

Respond ONLY with a valid JSON object matching this exact schema:
{
  "summary": "string — one paragraph describing what the product is",
  "verdict": "safe" | "warning" | "danger",
  "flagged": [
    { "ingredient": "string", "reason": "string — why it conflicts or warrants caution" }
  ],
  "ingredients": [
    {
      "name": "string — original ingredient name from the label",
      "plain": "string — plain English explanation",
      "purpose": "string — functional role (e.g. preservative, emulsifier, sweetener)",
      "safety": "safe" | "caution" | "avoid" | "neutral"
    }
  ]
}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, imageBase64, imageMimeType, profile } = body as {
      text?: string;
      imageBase64?: string;
      imageMimeType?: string;
      profile: UserProfile;
    };

    if (!text && !imageBase64) {
      return NextResponse.json({ error: "Provide ingredient text or an image" }, { status: 400 });
    }

    if (isMock) {
      await new Promise((r) => setTimeout(r, 1200));
      return NextResponse.json(MOCK_RESULT);
    }

    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "placeholder") {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is not configured. Set it in your environment variables." },
        { status: 500 }
      );
    }

    const userContent: Anthropic.MessageParam["content"] = [];

    if (imageBase64 && imageMimeType) {
      userContent.push({
        type: "image",
        source: {
          type: "base64",
          media_type: imageMimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
          data: imageBase64,
        },
      });
      userContent.push({
        type: "text",
        text: "Please analyze the ingredient list shown in this product label image.",
      });
    } else {
      userContent.push({
        type: "text",
        text: `Please analyze these ingredients:\n\n${text}`,
      });
    }

    const message = await client!.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: buildSystemPrompt(profile),
      messages: [{ role: "user", content: userContent }],
    });

    const raw = (message.content[0] as Anthropic.TextBlock).text;

    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, raw];
    const result: AnalysisResult = JSON.parse(jsonMatch[1].trim());

    return NextResponse.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
