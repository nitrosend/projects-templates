/** @param {import('./TemplateCollection').Template} template */
export const brandOf = template => template.study?.brand || 'Nitrosend Originals';
/** @param {string} a @param {string} b */
export const compareNames = (a,b) => a.localeCompare(b,'en',{sensitivity:'base'});
/** @param {import('./TemplateCollection').Template} template */
export const titleOf = template => {
  const title=template.name.includes('·')?template.name.split('·').slice(1).join('·').trim():template.name;
  return title.charAt(0).toUpperCase()+title.slice(1);
};
/** Email purpose comes from author metadata, not incidental subject words.
 * @param {import('./TemplateCollection').Template} template */
export function typeOf(template) {
  if(!template.study) {
    const categories={promotion:'Offers & seasonal',announcement:'Product launches',newsletter:'Newsletters',welcome:'Welcome & onboarding',event:'Events & community',engagement:'Retention & feedback',transactional:'Transactional'};
    if(template.category==='ecommerce') {
      if(template.tags.includes('cart'))return 'Cart & recovery';
      if(template.tags.includes('restock'))return 'Offers & seasonal';
      return 'Brand stories';
    }
    return categories[template.category] || 'Brand stories';
  }
  const purpose=template.tags.at(-1)?.toLowerCase() || '';
  if(['welcome','member benefits','set preferences','run club intro'].includes(purpose))return 'Welcome & onboarding';
  if(['invoice','order confirmation'].includes(purpose))return 'Transactional';
  if(['abandoned cart','browse abandonment','cart nudge'].includes(purpose))return 'Cart & recovery';
  if(['newsletter','digest'].includes(purpose))return 'Newsletters';
  if(['re-engagement','reminder','review request','survey','app habit','app nudge','habit streak','birthday capture'].includes(purpose))return 'Retention & feedback';
  if(['black friday','cyber monday','christmas','product offer','low stock','restock waitlist'].includes(purpose))return 'Offers & seasonal';
  if(['event invite','event details','save the date','community run','casting call','finale and invite'].includes(purpose))return 'Events & community';
  if(/^(?:launch\b|pre-order\b|teaser$|.*\btease(?:r)?$|.*\breveal$|.*\bfeature$|feature:|product launch$|countdown$|second product$|third product$|snkrs drop$)/.test(purpose))return 'Product launches';
  return 'Brand stories';
}

/** Only UI/search fields cross the island boundary. Origins belong to route adapters. */
export function galleryTemplates(templates, base) {
 return templates.map(template => {
  const url = new URL(template.editor_url);
  const image = ({url,width,height}) => ({url,width,height});
  return {id:template.id,name:template.name,collection:template.collection,category:template.category,tags:template.tags,subject:template.subject,
   editor_url:base ? base.replace(/\/$/, '') + url.pathname + url.search : template.editor_url,
   ...(template.study ? {study:{brand:template.study.brand,adapted:template.study.adapted}} : {}),
   preview:{card:image(template.preview.card),full:image(template.preview.full)}};
 });
}
