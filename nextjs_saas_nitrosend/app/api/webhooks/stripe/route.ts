import type Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { getStripeClient } from '@/lib/stripe';
import { syncSubscriptionFromCheckoutSession } from '@/lib/subscription-sync';
import { sendLifecycleEmail, sendWelcomeEmailForSubscriptionOnce } from '@/lib/nitrosend-email';
import { appConfig } from '@/lib/app-config';

async function customerEmail(
  stripe: ReturnType<typeof getStripeClient>,
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null,
) {
  if (!customer) return null;
  if (typeof customer !== 'string') {
    return 'deleted' in customer && customer.deleted ? null : customer.email ?? null;
  }
  const record = await stripe.customers.retrieve(customer);
  return 'deleted' in record && record.deleted ? null : record.email ?? null;
}

export async function POST(request: Request) {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error(
        'Missing STRIPE_WEBHOOK_SECRET. Add a Stripe webhook signing secret to your environment before using the Stripe webhook route.',
      );
    }

    const signature = request.headers.get('stripe-signature');
    if (!signature) {
      return NextResponse.json({ error: 'Missing Stripe-Signature header.' }, { status: 400 });
    }

    const stripe = getStripeClient();
    const payload = await request.text();

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to verify the Stripe webhook signature.';
      return NextResponse.json({ error: message }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
      const result = await syncSubscriptionFromCheckoutSession(
        event.data.object as Stripe.Checkout.Session,
      );

      if (
        (result?.status === 'active' || result?.status === 'trialing') &&
        result.email
      ) {
        await sendWelcomeEmailForSubscriptionOnce({
          stripeSubscriptionId: result.stripeSubscriptionId,
          to: result.email,
          productName: appConfig.name,
        });
      }
    }

    if (event.type === 'customer.subscription.trial_will_end') {
      const subscription = event.data.object as Stripe.Subscription;
      await sendLifecycleEmail({
        kind: 'trial_ending',
        to: await customerEmail(stripe, subscription.customer),
        productName: appConfig.name,
        idempotencyKey: `trial-ending:${subscription.id}:${subscription.trial_end ?? event.id}`,
      });
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object as Stripe.Invoice;
      await sendLifecycleEmail({
        kind: 'payment_failed',
        to: invoice.customer_email ?? (await customerEmail(stripe, invoice.customer)),
        productName: appConfig.name,
        idempotencyKey: `payment-failed:${invoice.id}:${invoice.attempt_count ?? event.id}`,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to process the Stripe webhook.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
