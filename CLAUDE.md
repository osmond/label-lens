# Label Lens — Project Architecture

## Overview
Label Lens is a Next.js 14 App Router web app that decodes food ingredient lists using Claude AI. Users set a dietary profile (restrictions + custom allergens) and scan product labels (photo or text). The AI returns a structured JSON analysis with a personal safety verdict and per-ingredient cards.

## Stack
- **Framework**: Next.js 14 App Router (TypeScript)
- **Styling**: Tailwind CSS
- **AI**: Anthropic Claude (`claude-sonnet-4-20250514`) via `@anthropic-ai/sdk`
- **Persistence**: `localStorage` for user profile (no backend DB)

## Key Files

| Path | Purpose |
|------|---------|
| `app/page.tsx` | Scan page — image upload / text input, calls `/api/analyze`, renders results |
| `app/profile/page.tsx` | Profile setup — dietary restrictions + custom allergens, saved to localStorage |
| `app/api/analyze/route.ts` | Server-side API route — receives image or text + profile, calls Claude, returns JSON |
| `lib/types.ts` | Shared TypeScript types (`UserProfile`, `AnalysisResult`, `IngredientCard`, etc.) |
| `lib/profile.ts` | localStorage helpers + `COMMON_RESTRICTIONS` list |
| `components/Nav.tsx` | Sticky nav with active-state highlighting |
| `components/VerdictBanner.tsx` | Top-level safety verdict (safe/warning/danger) with flagged items |
| `components/IngredientGrid.tsx` | Grid of ingredient cards with safety color-coding |

## AI Analysis Flow

1. Client converts image to base64 (if photo mode)
2. POST `/api/analyze` with `{ profile, imageBase64?, imageMimeType?, text? }`
3. Server builds a system prompt embedding the user's full dietary profile
4. Claude is asked to reason about **hidden allergen sources** (e.g. malt vinegar → gluten, natural flavors → animal derivatives)
5. Claude returns structured JSON: `{ summary, verdict, flagged[], ingredients[] }`
6. Client renders `VerdictBanner` + `IngredientGrid`

## Safety Verdict Levels
- `safe` — nothing conflicts with profile
- `warning` — possible/hidden sources of concern (caution items)
- `danger` — confirmed conflict with profile

## Ingredient Safety Ratings
- `avoid` — directly conflicts with user profile
- `caution` — possible hidden source or cross-contamination risk
- `safe` — confirmed safe
- `neutral` — not relevant to this profile

## Environment Variables
- `ANTHROPIC_API_KEY` — required, server-side only, never exposed to browser

## Development Notes
- The API key is only accessed in `app/api/analyze/route.ts` (server component)
- No `"use client"` in the API route — it runs server-side only
- Images are converted to base64 client-side in `fileToBase64()` before POSTing
