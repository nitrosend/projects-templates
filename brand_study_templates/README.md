# Nitrosend template collection

A forkable Next.js landing page for the complete Nitrosend collection: 306 brand studies across 36 brands, plus 25 Nitrosend Originals. Explore by brand, email type or search; preview the full email; open the exact design in Nitrosend's existing guest editor. Signup happens when saving there.

```sh
npm install
npm run dev
npm run build
```

No credentials or environment variables are required. For local editor QA only, set `NEXT_PUBLIC_EDITOR_BASE=http://127.0.0.1:5197` before starting/building. Production links use `https://app.nitrosend.com`.

## Content ownership

`data/catalog.json` is an immutable import from the API YAML catalog, pinned by `data/catalog.sha256`. Do not hand-edit it or infer template IDs from screenshots. The build verifies the imported collection, distinct titles, exact revision links and content-addressed canonical previews. Counts are derived from the import, so new published studies do not require hardcoded count changes. To update, run the product-root publication workflow in `TEMPLATE_PUBLISHING.md`, then import the resulting catalog and pin here using the website's `scripts/import-catalog.mjs` with this destination.

The approved campaign composition is promotional hero artwork. Collection cards and full previews are generated from the actual designs opened in the editor. The genuine Nitrosend PNG icon and wordmark remain image assets; do not replace the wordmark with typed text. Night Run is an Original, not Nike. Brand studies are independent concepts and do not imply customer relationships.

This project owns the landing and collection only. Nitrosend owns editing, personal drafts and signup. There is no duplicate email editor, source editor or account flow here.

## Review

Check the hero at desktop and mobile widths, search and all filters, empty results, more designs, keyboard preview/open/close, full email scrolling and exact editor entry. Final publication to v0 and production remains subject to Kam's product sign-off.

## Shared website presentation

The production collection lives at `https://nitrosend.com/templates`. This forkable project is exported from the website presentation. In Nitrosend's maintained repository, change the owning web sources rather than the generated `components/TemplateCollection.tsx`, `components/TemplateShowcase.tsx`, `components/catalog-utils.mjs` or `app/showcase.css`. Then run `node scripts/export-v0.mjs /absolute/path/to/brand_study_templates` from the website repository. The same command with `--check` detects drift. The route and metadata adapters remain here. Official logo assets are copied unchanged; promotional artwork and template previews use the verified immutable publication.

## Customize your fork

Once you fork this project, edit the gallery components, CSS, copy and metadata directly in your own copy. You do not need the Nitrosend website repository. Keep a Nitrosend editor link paired with its original catalog ID and revision so it opens the matching design. The gallery needs no API keys; email editing, account drafts and delivery remain in Nitrosend.
