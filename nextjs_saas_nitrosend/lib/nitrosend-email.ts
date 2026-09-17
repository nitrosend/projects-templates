import {
  nitrosendApiKey,
  nitrosendApiUrl,
  nitrosendBrandSid,
  nitrosendEmailConfigured,
  nitrosendFromAddress,
  nitrosendFromName,
} from '@/lib/nitrosend-config';
import { databaseConfigured } from '@/lib/database-config';
import {
  claimSubscriptionWelcomeEmail,
  releaseSubscriptionWelcomeEmailClaim,
} from '@/lib/data';

export type LifecycleEmailKind =
  | 'welcome'
  | 'subscription_active'
  | 'trial_ending'
  | 'payment_failed';

type LifecycleEmailInput = {
  kind: LifecycleEmailKind;
  to: string | null | undefined;
  productName: string;
  // A stable key so a retried webhook or a raced page never sends twice.
  idempotencyKey: string;
  appUrl?: string;
};

type EmailContent = { subject: string; text: string; html: string };

function paragraphs(lines: string[]) {
  return lines
    .map((line) => `<p style="margin: 0 0 12px;">${line}</p>`)
    .join('');
}

function wrap(title: string, body: string, productName: string) {
  return [
    '<div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color: #0f172a; line-height: 1.6;">',
    `<h1 style="font-size: 22px; margin: 0 0 12px;">${title}</h1>`,
    body,
    `<p style="margin: 24px 0 0; color: #64748b;">The ${productName} team</p>`,
    '</div>',
  ].join('');
}

/**
 * The starter copy for each lifecycle moment. Rewrite these for your product;
 * the wiring (when each one goes out, and that it only goes once) stays.
 */
export function buildLifecycleEmailContent(
  kind: LifecycleEmailKind,
  productName: string,
  appUrl: string,
): EmailContent {
  switch (kind) {
    case 'welcome':
      return {
        subject: `Welcome to ${productName}`,
        text: [
          `Thanks for signing up for ${productName}.`,
          '',
          `Your workspace is ready at ${appUrl}.`,
          'Reply to this email if you have any questions.',
        ].join('\n'),
        html: wrap(
          `Welcome to ${productName}`,
          paragraphs([
            `Thanks for signing up. Your workspace is ready at <a href="${appUrl}">${appUrl}</a>.`,
            'Reply to this email if you have any questions.',
          ]),
          productName,
        ),
      };
    case 'subscription_active':
      return {
        subject: `Your ${productName} subscription is active`,
        text: [
          `Thanks for subscribing to ${productName}!`,
          '',
          'Your subscription is now active and your workspace is ready.',
          'Sign in any time to pick up where you left off.',
        ].join('\n'),
        html: wrap(
          `Your ${productName} subscription is active`,
          paragraphs([
            'Thanks for subscribing! Your subscription is now active and your workspace is ready.',
            'Sign in any time to pick up where you left off.',
          ]),
          productName,
        ),
      };
    case 'trial_ending':
      return {
        subject: `Your ${productName} trial ends in 3 days`,
        text: [
          `Your ${productName} trial ends in three days.`,
          '',
          'Your subscription starts automatically when the trial ends.',
          `Manage your plan any time from ${appUrl}/dashboard.`,
        ].join('\n'),
        html: wrap(
          `Your ${productName} trial ends in 3 days`,
          paragraphs([
            'Your subscription starts automatically when the trial ends.',
            `Manage your plan any time from <a href="${appUrl}/dashboard">your dashboard</a>.`,
          ]),
          productName,
        ),
      };
    case 'payment_failed':
      return {
        subject: `Action needed: your ${productName} payment did not go through`,
        text: [
          `We could not collect your latest ${productName} payment.`,
          '',
          `Update your payment method at ${appUrl}/dashboard to keep your subscription active.`,
          'Stripe will retry automatically over the next few days.',
        ].join('\n'),
        html: wrap(
          `Your ${productName} payment did not go through`,
          paragraphs([
            `Update your payment method from <a href="${appUrl}/dashboard">your dashboard</a> to keep your subscription active.`,
            'Stripe will retry automatically over the next few days.',
          ]),
          productName,
        ),
      };
  }
}

/**
 * Send one lifecycle email through the Nitrosend REST API using the credentials
 * Stripe Projects provisioned. Best-effort: a failure logs and returns false so
 * it never blocks auth, checkout or a webhook.
 */
export async function sendLifecycleEmail({
  kind,
  to,
  productName,
  idempotencyKey,
  appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
}: LifecycleEmailInput): Promise<boolean> {
  if (!nitrosendEmailConfigured) {
    console.warn(`Skipping ${kind} email: Nitrosend is not configured.`);
    return false;
  }

  if (!to) {
    console.warn(`Skipping ${kind} email: no recipient email address.`);
    return false;
  }

  try {
    const { subject, text, html } = buildLifecycleEmailContent(kind, productName, appUrl);
    const headers: Record<string, string> = {
      Authorization: `Bearer ${nitrosendApiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    };
    if (nitrosendBrandSid) {
      headers['X-Brand-SID'] = nitrosendBrandSid;
    }

    const response = await fetch(`${nitrosendApiUrl}/v1/my/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        channel: 'email',
        to,
        subject,
        body: text,
        html,
        // The hosted sender is the default; set NITROSEND_FROM_ADDRESS to send
        // from a domain you verified in Nitrosend instead.
        ...(nitrosendFromAddress ? { from: nitrosendFromAddress } : {}),
        ...(nitrosendFromName ? { from_name: nitrosendFromName } : {}),
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(
        `Nitrosend send failed with status ${response.status}. ${detail}`.trim(),
      );
    }

    return true;
  } catch (error) {
    console.error(`Failed to send ${kind} email via Nitrosend:`, error);
    return false;
  }
}

/**
 * Send the subscription-active email exactly once, even though both the Stripe
 * webhook and the success page call this for the same subscription (and may race).
 */
export async function sendWelcomeEmailForSubscriptionOnce({
  stripeSubscriptionId,
  to,
  productName,
}: {
  stripeSubscriptionId: string | null | undefined;
  to: string | null | undefined;
  productName: string;
}): Promise<boolean> {
  const send = () =>
    sendLifecycleEmail({
      kind: 'subscription_active',
      to,
      productName,
      idempotencyKey: `subscription-active:${stripeSubscriptionId ?? to ?? 'unknown'}`,
    });

  if (!nitrosendEmailConfigured || !to || !databaseConfigured || !stripeSubscriptionId) {
    return send();
  }

  let claimed = false;
  try {
    claimed = await claimSubscriptionWelcomeEmail(stripeSubscriptionId);
  } catch (error) {
    console.error('Failed to claim subscription welcome email; skipping send:', error);
    return false;
  }

  if (!claimed) {
    // Another caller already sent (or is sending) this email.
    return false;
  }

  const sent = await send();

  if (!sent) {
    try {
      await releaseSubscriptionWelcomeEmailClaim(stripeSubscriptionId);
    } catch (error) {
      console.error('Failed to release welcome email claim after send failure:', error);
    }
  }

  return sent;
}
