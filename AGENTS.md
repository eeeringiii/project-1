<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# OSHICOA 16 project instructions

## Product goal
OSHICOA 16 is a shareable Japanese fandom-personality diagnosis web app. The product should feel original, polished, mobile-first, and social-native rather than like a generic AI-generated quiz.

Core promise: analyze the user's underlying 推し方 / ヲタク生態 without judging spending amount or event attendance.

## Current product model
- 24-question lightweight diagnosis
- 4 binary axes: R/C, E/P, G/M, T/S
- 16 result types
- Secondary outputs: 業タグ, relationship phase, radar chart, compatibility, share image
- Results and answers are stored locally; do not send 推し名 or answers to a server unless explicitly requested

## Important source files
- `data/questions.ts`: 24 questions, scoring weights, radar adjustments, tag signals
- `data/types.ts`: 16 type definitions, copy, stats, compatibility
- `data/tags.ts`: 業タグ definitions
- `data/phases.ts`: relationship phases
- `lib/diagnosis/index.ts`: diagnosis/scoring logic and tie breaking
- `stores/diagnosis.ts`: client-side persisted diagnosis state
- `app/api/og/route.tsx`: dynamic share/OG image

Before changing diagnosis behavior, inspect these files and trace the full data flow. Do not patch only the visible UI if the source-of-truth lives in data or diagnosis logic.

## Implementation rules
1. Preserve the existing 4-axis diagnosis model unless the task explicitly changes it.
2. Never silently change scoring, weights, tie-break behavior, or type codes while doing a visual/copy task.
3. Keep result type codes stable because shared URLs and OG images may depend on them.
4. Prefer editing structured data over duplicating hard-coded copy in components.
5. Keep the experience mobile-first. Check narrow viewport behavior before considering a task complete.
6. Avoid generic SaaS/AI visual language. OSHICOA should feel like a distinctive Japanese entertainment/diagnosis brand.
7. Japanese copy should be natural, punchy, SNS-friendly, and not sound machine-translated or overly explanatory.
8. Maintain accessible contrast, readable type sizes, and obvious tap targets.
9. Avoid unnecessary dependencies. Use the existing Next.js/React/Tailwind stack unless a new dependency has a clear benefit.
10. Do not expose private environment variables or add server-side collection of personal diagnosis inputs without explicit approval.

## Design direction
- Cute but not childish
- Slightly editorial / collectible / fandom-culture feel
- Strong differentiation between all 16 types
- Result pages should be screenshot-worthy and share-worthy
- Prioritize hierarchy and personality over decorative clutter
- Avoid repetitive cards that all look structurally identical when stronger visual grouping is possible

## Result page priorities
When improving result pages, generally prioritize:
1. Type identity and immediate emotional hit
2. Shareable diagnosis-card visual
3. Relatable “あるある” / behavior copy
4. Radar/stat visualization
5. 業タグ and phase
6. Compatibility
7. CTA to retake/share/deeper paid content

## Quality gate
For any meaningful change:
- Run `npm run lint`
- Run `npm run build`
- Fix errors caused by the change
- Check that `/`, diagnosis flow, result pages, `/types`, and dynamic OG output still work when relevant
- Do not claim completion if build/lint is failing because of the change

## Response style
Default to 実務的・簡潔. Do not restate the request, do not narrate what you are about to do, and do not pad the report with前置き.

- Reply in Japanese unless the user writes in another language.
- Report format: やったこと / 触らなかったこと / 確認したこと. Keep it short.
- No emoji unless the user uses them first. Product copy is a separate matter — follow the Design direction section there.
- Show a diff or file path instead of pasting long code blocks into the reply.
- If lint/build fails, say so plainly with the error. Never report completion over a failing quality gate.

## Working style
When a task is broad, first inspect the current implementation and then make the full set of coherent changes rather than stopping after a superficial first edit.

Do not ask the user to manually edit code unless repository permissions or missing external credentials make direct implementation impossible.

When there are multiple reasonable implementation choices, favor the one that is easiest to maintain and easiest for a non-engineer owner to update later.
