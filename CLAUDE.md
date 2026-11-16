# Smile App

Vue 3 + Vite app using PrimeVue, Tailwind CSS v4, Pinia, and Vue Router.

## Commands

- `npm run dev` – start the dev server
- `npm run build` – production build
- `npm run lint` – run oxlint + eslint (auto-fixes)

## Rules

- Use `<script setup>` in Vue components
- Style with Tailwind classes; use PrimeVue components for UI
- Run `npm run lint` before committing
- Always ask for approval

## Testing

- Always run tests live, so the developer can watch what is being tested:
  - Drive a visible (not headless) Chrome window through the real app, with an on-screen banner naming the current step.
  - Post a short update in chat as each step passes or fails, not only a summary at the end.
  - When a step needs a person (e.g. "Authorize Test Payment" on PayMongo), stop and say clearly that it is the developer's turn.
- Report every result honestly: pass, fail, or manual. Show the failing output, and say when a test ran against the wrong server or was skipped.
- Use PayMongo test keys only. Payments only complete on the deployed site (https://smile-link-mu.vercel.app), because the PayMongo webhook points there, not to localhost.
- For email tests, send to the Resend account's own address; the test sender can't deliver anywhere else.

## Process Flow (SmileLink prototype)

### Customer ordering

Landing page (Create button)
→ 1 Celebration (pick occasion)
→ 2 Template (pick a look)
→ 3 Package (card or website)
→ 4 Recipient (name, email, date)
→ 5 Content (message, photos)
→ 6 Review & pay (opens PayMongo)

### System (automatic)

PayMongo checkout (gcash payment)
→ Webhook: paid? (server verifies signature)

- No → Payment failed (not charged, back to step 6)
- Yes → 7 Processing (waits for webhook)
  → Link created (use order id as slug, email queued)
  → 8 Order complete (link, QR, share)

### Recipient

Email arrives (at scheduled time)
→ Opens the link (phone, table or desktop)
→ Password lock (only if turned on)
→ Surprise page (message, photos, music)

### Behavior rules

- Only mark an order paid from the verified PayMongo webhook, never from the client redirect.
