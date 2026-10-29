import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const bytes=await readFile('data/catalog.json');
const pin=(await readFile('data/catalog.sha256','utf8')).trim();
assert.equal(createHash('sha256').update(bytes).digest('hex'),pin,'catalog pin');
const catalog=JSON.parse(bytes),templates=catalog.templates;
assert.equal(catalog.schema,'nitrosend.catalog.v1');
assert.ok(templates.length > 0);
assert.ok(templates.some(t=>t.collection==='brand_studies'));
assert.ok(templates.some(t=>t.collection==='originals'));

assert.equal(new Set(templates.map(t=>t.id)).size,templates.length);
assert.equal(new Set(templates.map(t=>t.name)).size,templates.length,'Distinct design titles');
for(const template of templates){
 assert.match(template.revision,/^[a-f0-9]{64}$/);
 const url=new URL(template.editor_url);
 assert.equal(url.origin,'https://app.nitrosend.com');assert.equal(url.pathname,`/try/templates/${template.id}`);assert.equal(url.searchParams.get('revision'),template.revision);
 for(const kind of ['card','full']){const image=template.preview[kind];assert.ok(image.width>0&&image.height>0);assert.match(image.sha256,/^[a-f0-9]{64}$/);assert.equal(image.url,`https://nitrosend-marketplace-assets-306607894404-us-east-1.s3.us-east-1.amazonaws.com/public/media/sha256/${image.sha256}.webp`);}
}
assert.equal(templates.find(t=>t.id==='night_run').collection,'originals');
assert.equal(templates.find(t=>t.id==='night_run').study,undefined);
for(const path of ['app/page.tsx','components/TemplateCollection.tsx'])assert.ok(!(await readFile(path,'utf8')).includes('—'),'No em dashes in product copy');
console.log(`Verified ${templates.length} templates, ${new Set(templates.filter(t=>t.study).map(t=>t.study.brand)).size} brands, canonical previews and exact editor revisions.`);
