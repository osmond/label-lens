# Label Lens

AI-powered ingredient decoder focused on dietary restrictions and hidden allergens. Upload a product label photo or paste ingredient text and get a plain-English breakdown with a personalized safety verdict.

## Features

- **Photo or text input** — snap a label or paste ingredients
- **Personal dietary profile** — select from common restrictions (vegan, gluten-free, halal, keto, etc.) and add custom allergens (mustard, sesame, lupin, celery, molluscs, pine nuts, etc.)
- **Hidden allergen detection** — the AI reasons about derivative sources (malt vinegar → gluten, natural flavors → animal derivatives, carmine → insects, etc.)
- **Per-ingredient cards** — plain-English name, functional role, and safety rating
- **Personal safety verdict** — ✓ Safe / ⚠ Check these / ✕ Avoid
- **Profile persistence** — saved to localStorage between sessions

## Setup

### 1. Clone and install

```bash
git clone <repo>
cd label-lens
npm install
```

### 2. Add your API key

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your [Anthropic API key](https://console.anthropic.com/):

```
ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

1. Go to **My Profile** and select your dietary restrictions and custom allergens
2. Return to **Scan** and either upload a label photo or paste the ingredient list
3. Click **Analyze Ingredients**

## Deployment

### Vercel (recommended)

```bash
npm i -g vercel
vercel
```

Set `ANTHROPIC_API_KEY` in the Vercel project's environment variables dashboard.

### Other platforms

Any platform that supports Next.js server-side rendering works. Set `ANTHROPIC_API_KEY` as a server-side environment variable (not exposed to the client).

## Tech Stack

- Next.js 14 (App Router)
- Tailwind CSS
- Anthropic Claude (`claude-sonnet-4-20250514`)
- localStorage for profile persistence

## Project Structure

```
app/
  page.tsx              # Scan page (home)
  profile/page.tsx      # Profile setup
  api/analyze/route.ts  # Server-side Claude API route
  layout.tsx
components/
  Nav.tsx
  VerdictBanner.tsx
  IngredientGrid.tsx
lib/
  types.ts
  profile.ts
```

## Security

- The `ANTHROPIC_API_KEY` is only accessed server-side in the API route — it is never sent to the browser
- Images are converted to base64 client-side and sent to the server via a POST body
