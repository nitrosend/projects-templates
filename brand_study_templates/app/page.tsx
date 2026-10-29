import TemplateShowcase from "../components/TemplateShowcase";
import { galleryTemplates } from "../components/catalog-utils.mjs";
import catalog from "../data/catalog.json";
import media from "../data/showcase.json";
export default function Home() {
  return <TemplateShowcase templates={galleryTemplates(catalog.templates, process.env.NEXT_PUBLIC_EDITOR_BASE)} artwork={media.artwork} />;
}
