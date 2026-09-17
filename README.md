# Nitrosend templates for Stripe Projects

Starter apps that `stripe projects build` can materialize, each with
Nitrosend provisioned as the email service. The registry manifests live in
`stripe/projects-template-registry`; this repository holds the app code the
CLI copies.

| Directory | Template | Stack |
| --- | --- | --- |
| `nextjs_saas_nitrosend` | `nitrosend/nextjs-saas` (`first-light`) | Next.js, Clerk, Neon, Stripe Billing, Nitrosend lifecycle email, Vercel |

`nextjs_saas_nitrosend` is a port of Stripe's MIT-licensed `nextjs_saas`
starter with Nitrosend in place of the email provider. See its README for
the environment Stripe Projects writes and the lifecycle emails it sends.
