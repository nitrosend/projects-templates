import { appConfig } from '@/lib/app-config';

function firstNonEmpty(...values: Array<string | null | undefined>) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim() !== '') {
      return value.trim();
    }
  }

  return '';
}

// Stripe Projects writes these when it provisions `nitrosend/email`. The key
// is scoped to one brand; the from address is the hosted sender that is
// reserved at provisioning and activated on the first send.
export const nitrosendApiKey = firstNonEmpty(process.env.NITROSEND_API_KEY);
export const nitrosendApiUrl = firstNonEmpty(
  process.env.NITROSEND_API_URL,
  'https://api.nitrosend.com',
).replace(/\/$/, '');
export const nitrosendMcpUrl = firstNonEmpty(
  process.env.NITROSEND_MCP_URL,
  'https://api.nitrosend.com/mcp',
);
export const nitrosendBrandSid = firstNonEmpty(process.env.NITROSEND_BRAND_SID);
export const nitrosendFromAddress = firstNonEmpty(process.env.NITROSEND_FROM_ADDRESS);
export const nitrosendFromName = firstNonEmpty(process.env.NITROSEND_FROM_NAME, appConfig.name);

export const nitrosendEmailConfigured = Boolean(nitrosendApiKey);
