# Next.js SaaS + Nitrosend Lifecycle Email

A `stripe projects build` template: subscription SaaS with Clerk auth, Neon
Postgres and Stripe Billing, with lifecycle email sent through Nitrosend and
a Nitrosend MCP server your coding agent can use to write campaigns, flows
and segments. Ported from Stripe's `nextjs_saas` starter (MIT), with
Nitrosend in place of the email provider.

## What this starter gives you

- Next.js App Router app
- Stripe Checkout subscription flow for $10.00 / month, scripted product and
  price setup with `npm run setup:stripe`
- Clerk auth wiring with checkout protection
- Neon Postgres wiring with starter `users` and `subscriptions` tables
- Vercel hosting metadata and `npm run deploy`
- Nitrosend lifecycle email from a hosted sender that can send the moment
  the project is provisioned: welcome on signup, subscription active,
  trial ending, payment failed (`lib/nitrosend-email.ts`)

## What Stripe Projects writes to your environment

`stripe projects add nitrosend/email` provisions a Nitrosend account, one
sending brand, an API key and a hosted sender, and writes:

| Variable | What it is |
| --- | --- |
| `NITROSEND_API_KEY` | Bearer token for the REST API and the MCP bridge, scoped to your brand |
| `NITROSEND_API_URL` | REST base, `https://api.nitrosend.com` |
| `NITROSEND_MCP_URL` | Streamable HTTP MCP endpoint, `https://api.nitrosend.com/mcp` |
| `NITROSEND_BRAND_SID` | The brand the key belongs to |
| `NITROSEND_FROM_ADDRESS` | Your hosted sender, `hello@<company>.nitrosend.net`; set once a company name is configured |

Read them with `stripe projects env`; never print the key. Set
`NITROSEND_FROM_NAME` if you want a display name other than the app name.
To send from your own domain, verify it in Nitrosend and point
`NITROSEND_FROM_ADDRESS` at it.

## Lifecycle email

| Moment | Where it fires | Email |
| --- | --- | --- |
| First sign-in | `app/auth/sync/route.ts` (new `users` row) | `welcome` |
| Subscription starts | `app/api/webhooks/stripe/route.ts` and `app/success/page.tsx`, deduped by a database claim | `subscription_active` |
| Trial ends in 3 days | `customer.subscription.trial_will_end` webhook | `trial_ending` |
| Payment fails | `invoice.payment_failed` webhook | `payment_failed` |

Every send carries an `Idempotency-Key`, so a retried webhook never sends
twice. Sends are best-effort: a failure logs and never blocks auth,
checkout or the webhook. The copy lives in
`buildLifecycleEmailContent` in `lib/nitrosend-email.ts`; rewrite it for
your product.

## Nitrosend MCP server

Connect the MCP server to write campaigns, flows and segments for the
product instead of hand-coding them:

- Claude Code: `claude mcp add --transport http nitrosend "$NITROSEND_MCP_URL"`
- Codex: `codex mcp add nitrosend --url "$NITROSEND_MCP_URL"`
- Cursor, Windsurf, VS Code, Zed: the same URL

Call `nitro_get_status` first; it reports the brand, the hosted sender
state, capacity and the next recommended action. The agent guide is at
https://nitrosend.com/agents/provision.md.

## Verify the starter

Open the landing page and use it as the setup summary for the generated app.

- `Subscribe` opens the starter subscription flow
- `View Database` shows the starter Neon Postgres connection state plus row counts for `users` and `subscriptions`
- `View sign in` verifies the generated Clerk entry points, then sends signed-in users to `/dashboard`
- The Nitrosend card shows whether `NITROSEND_API_KEY` is present
- `npm run deploy` uses the pulled Vercel credentials to publish the app

## Local development

1. Install dependencies: `npm install`
1. Create the starter Stripe product and price: `npm run setup:stripe`
1. Verify that `STRIPE_PRODUCT_ID`, `STRIPE_PRICE_ID` and `STRIPE_SECRET_KEY` are present in `.env.local`.
1. When Neon Postgres is configured, the starter creates its `users` and `subscriptions` tables the first time a database-backed route runs.
1. When Clerk is enabled, sign-ins and sign-ups flow through `/auth/sync`; a first sign-in sends the welcome email.
1. To enable Stripe webhook syncing after the app has a public URL, create a Stripe webhook endpoint for `https://your-app.example.com/api/webhooks/stripe` listening to `checkout.session.completed`, `customer.subscription.trial_will_end` and `invoice.payment_failed`, and add its signing secret to `STRIPE_WEBHOOK_SECRET`.
1. `npm run deploy` publishes to Vercel when these pulled env vars are available: `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, `VERCEL_TEAM_ID`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_URL`, `VERCEL_URL`.
1. If the generator did not finish provisioning your add-ons, run:
   - `stripe plugin install projects`
   - `stripe projects init`
   - `stripe projects add vercel/project`
   - `stripe projects add neon/postgres`
   - `stripe projects add clerk/auth`
   - `stripe projects add nitrosend/email`
   - `stripe projects env --pull`
1. Start the app: `npm run dev`

## Routes

- `/` landing page
- `/dashboard` signed-in starter workspace
- `/checkout` starter subscription checkout flow
- `/success` checkout success return page
- `/cancel` checkout cancel return page
- `/api/health` runtime configuration summary (includes `nitrosendEmailConfigured`)
- `/auth/sync` best-effort Clerk-to-database sync route (sends the welcome email once)
- `/api/billing-portal` creates Stripe customer portal sessions for signed-in subscribed users
- `/api/db` database summary route with starter table counts when Neon Postgres is provisioned
- `/api/webhooks/stripe` Stripe webhook endpoint for subscription linking and lifecycle email once `STRIPE_WEBHOOK_SECRET` is configured

## Customize with AI

Use one of these commands from the repo root:

- `claude "Help me turn this into a real product. Follow prompts/starter-to-product.md."`
- `codex "Help me turn this into a real product. Follow prompts/starter-to-product.md."`

If you are using another AI coding tool, open `prompts/starter-to-product.md` and paste it into the assistant.

The prompt tells the agent to read `AGENTS.md`, inspect the starter, ask one discovery question at a time when the brief is still fuzzy, confirm the product name with the user, work in phases with the landing page first, remove starter status UI from the product experience, and only then implement without breaking the existing Stripe, auth, database, email and deployment wiring.
