import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {typeOf,brandOf,titleOf,compareNames} from '../../components/catalog-utils.mjs';
const templates=JSON.parse(await readFile('data/catalog.json','utf8')).templates;
const named=name=>templates.find(t=>t.name===name);
test('Originals use their author category and cart purpose',()=>{
 for(const [name,type] of [['The Gentle Nudge','Cart & recovery'],['The Miss-You','Retention & feedback'],['The Collage Note','Welcome & onboarding'],['The Ritual Edit','Newsletters'],['Night Run','Offers & seasonal']])assert.equal(typeOf(named(name)),type);
});
test('brand-story vocabulary does not imply invoices or onboarding',()=>{
 for(const template of templates.filter(t=>t.study && ['Billing','Founder receipts','New customer'].includes(t.tags.at(-1))))assert.equal(typeOf(template),'Brand stories',template.name);
 assert.equal(typeOf(templates.find(t=>t.id==='study_notion_welcome_01')),'Welcome & onboarding');
});
test('every card and editor link has a distinct meaningful label',()=>{
 const names=templates.map(t=>`${brandOf(t)} ${titleOf(t)}`);assert.equal(new Set(names).size,names.length);
});
test('brand ordering is case-insensitive and locale-stable',()=>{
 assert.deepEqual(['Wise','lululemon','SKIMS','Sephora'].sort(compareNames),['lululemon','Sephora','SKIMS','Wise']);
});
