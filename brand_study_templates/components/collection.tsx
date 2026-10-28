"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { brandOf, titleOf, typeOf, compareNames } from "./catalog-utils.mjs";

export type Template = {
  id: string; name: string; collection: string; category: string; tags: string[];
  description: string; subject: string; preheader: string; revision: string; editor_url: string;
  study?: { brand: string; adapted?: boolean; concept: boolean; source_url: string };
  preview: { renderer: string; card: Preview; full: Preview };
};
type Preview = { url: string; width: number; height: number; sha256: string };
const PAGE_SIZE = 24;
const FEATURED = ["Nike", "Notion", "The Ordinary", "Apple", "Figma", "Aesop", "Linear", "Spotify", "Wise", "Supabase", "Stripe", "Airbnb"];
function editorHref(template: Template) {
  const base = process.env.NEXT_PUBLIC_EDITOR_BASE;
  if (!base) return template.editor_url;
  const url = new URL(template.editor_url);
  return base.replace(/\/$/, "") + url.pathname + url.search;
}
function orderCollection(templates: Template[]) {
  // Round-robin brands gives the first screen the breadth of the collection.
  const brands = [...new Set(templates.map(brandOf))].sort((a, b) => {
    const rank = (name: string) => FEATURED.indexOf(name) < 0 ? 100 : FEATURED.indexOf(name);
    return rank(a) - rank(b) || compareNames(a, b);
  });
  const groups = brands.map(brand => templates.filter(template => brandOf(template) === brand).sort((a, b) => {
    const rank = (template: Template) => /welcome/i.test(titleOf(template)) ? 0 : /product launch/i.test(titleOf(template)) ? 1 : /newsletter/i.test(titleOf(template)) ? 2 : 3;
    return rank(a) - rank(b);
  }));
  const result: Template[] = [];
  for (let row = 0; groups.some(group => group[row]); row++) groups.forEach(group => { if (group[row]) result.push(group[row]); });
  return result;
}
function SearchIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.6" /><path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.6" /></svg>; }
export function Collection({ templates }: { templates: Template[] }) {
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("all");
  const [type, setType] = useState("all");
  const [cohort, setCohort] = useState("all");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState<Template | null>(null);
  const modal = useRef<HTMLDialogElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const firstNewIndex = useRef<number | null>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const ordered = useMemo(() => orderCollection(templates), [templates]);
  const brands = useMemo(() => [...new Set(templates.filter(t => t.study).map(brandOf))].sort(compareNames), [templates]);
  const types = useMemo(() => [...new Set(templates.map(typeOf))].sort(compareNames), [templates]);
  const filtered = useMemo(() => ordered.filter(template =>
    (cohort === "all" || template.collection === cohort) &&
    (brand === "all" || brandOf(template) === brand) &&
    (type === "all" || typeOf(template) === type) &&
    `${brandOf(template)} ${template.name} ${template.subject} ${template.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase().trim())
  ), [ordered, brand, type, cohort, query]);
  useEffect(() => { setVisible(PAGE_SIZE); }, [query, brand, type, cohort]);
  useEffect(() => {
    if (firstNewIndex.current === null) return;
    grid.current?.querySelectorAll<HTMLButtonElement>(".template-image")[firstNewIndex.current]?.focus();
    firstNewIndex.current = null;
  }, [visible]);
  useEffect(() => {
    const dialog = modal.current;
    if (!selected || !dialog) return;
    dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { dialog.close(); document.body.style.overflow = previousOverflow; trigger.current?.focus(); };
  }, [selected]);
  function preview(template: Template, target: HTMLElement) { trigger.current = target; setSelected(template); }
  function reset() { setQuery(""); setBrand("all"); setType("all"); setCohort("all"); search.current?.focus(); }
  const studyCount = templates.filter(t => t.study).length;
  return <section id="collection" className="collection" aria-labelledby="collection-title">
    <div className="collection-heading"><div><p className="eyebrow">THE COLLECTION</p><h2 id="collection-title">Find your next<br className="mobile-break" /> great email.</h2></div><p>{studyCount} brand studies. {brands.length} distinct points of view.<br />Plus {templates.length - studyCount} Nitrosend Originals, ready to make yours.</p></div>
    <div className="collection-tabs" role="group" aria-label="Template collection">
      {[["all", "All designs"], ["brand_studies", "Brand studies"], ["originals", "Nitrosend Originals"]].map(([value, label]) => <button key={value} type="button" aria-pressed={cohort === value} onClick={() => { setCohort(value); setBrand("all"); }}>{label}<span>{value === "all" ? templates.length : templates.filter(t => t.collection === value).length}</span></button>)}
    </div>
    <div className="filters">
      <label className="search"><SearchIcon /><span className="sr-only">Search templates</span><input ref={search} type="search" value={query} placeholder="Find a brand, a mood, a starting point…" onChange={event => setQuery(event.target.value)} /></label>
      <label className="select"><span className="sr-only">Filter by brand</span><select value={brand} onChange={event => { setBrand(event.target.value); if (cohort === "originals") setCohort("all"); search.current?.focus(); }}><option value="all">All {brands.length} brands</option>{brands.map(name => <option key={name}>{name}</option>)}</select></label>
      <label className="select"><span className="sr-only">Filter by email type</span><select value={type} onChange={event => setType(event.target.value)}><option value="all">Every email type</option>{types.map(name => <option key={name}>{name}</option>)}</select></label>
    </div>
    <div className="collection-status"><p role="status" aria-live="polite">{filtered.length} {filtered.length === 1 ? "design" : "designs"}{brand !== "all" ? ` for ${brand}` : " to make your own"}</p>{(query || brand !== "all" || type !== "all" || cohort !== "all") && <button type="button" onClick={reset}>Clear filters <span aria-hidden="true">×</span></button>}<span className="preview-note">Preview it. Open it. Make it yours.</span></div>
    {filtered.length ? <div ref={grid} className="template-grid">{filtered.slice(0, visible).map((template) => <article className="template" key={template.id}>
      <button className="template-image" type="button" onClick={event => preview(template, event.currentTarget)} aria-label={`Preview ${brandOf(template)} ${titleOf(template)}`}>
        <img src={template.preview.card.url} width={template.preview.card.width} height={template.preview.card.height} alt={`${brandOf(template)} ${titleOf(template)} email preview`} loading="lazy" />
        <span className="preview-hint">View full email <span aria-hidden="true">↗</span></span>
      </button>
      <div className="template-meta"><div><p className="template-brand">{brandOf(template)}</p><h3>{titleOf(template)}</h3></div><span className="template-type">{typeOf(template)}</span></div>
      <div className="template-action"><span>{template.study?.adapted ? "Adapted concept" : template.study ? "Concept study" : "Original design"}</span><a href={editorHref(template)} aria-label={`Open ${brandOf(template)} ${titleOf(template)} in editor`}>Open in editor <span aria-hidden="true">↗</span></a></div>
    </article>)}</div> : <div className="empty"><h3>No designs found.</h3><p>Try another brand or email type.</p><button className="button button-secondary" type="button" onClick={reset}>See all designs</button></div>}
    {visible < filtered.length && <div className="load-more"><p>Showing {Math.min(visible, filtered.length)} of {filtered.length}</p><button className="button button-secondary" type="button" onClick={() => { firstNewIndex.current = visible; setVisible(visible + PAGE_SIZE); }}>More inspiration <span aria-hidden="true">↓</span></button></div>}
    <dialog ref={modal} className="preview-dialog" aria-labelledby="preview-title" onCancel={() => setSelected(null)} onClick={event => { if (event.target === modal.current) setSelected(null); }}>
      {selected && <div className="preview-shell"><header><div><p className="eyebrow">{brandOf(selected)}</p><h2 id="preview-title">{titleOf(selected)}</h2></div><button className="close" type="button" onClick={() => setSelected(null)} aria-label="Close preview" autoFocus>×</button></header>
        <div className="preview-body"><img src={selected.preview.full.url} width={selected.preview.full.width} height={selected.preview.full.height} alt={`Full ${brandOf(selected)} ${titleOf(selected)} email`} /></div>
        <footer><div><strong>{selected.study?.adapted ? "An editable interpretation." : "Make this one yours."}</strong><p>{selected.study?.adapted ? "Adapted from the original concept for the email editor." : "Change the words, images and colours. No signup to start."}</p></div><a className="button button-primary" href={editorHref(selected)}>Open in editor <span aria-hidden="true">↗</span></a></footer>
      </div>}
    </dialog>
  </section>;
}
