import Link from "next/link";
import { Check } from "lucide-react";

const TIERS = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Perfect for trying out Bookilot",
    features: [
      "Up to 50 bookings/month",
      "Web booking widget",
      "1 staff member",
      "5 services",
      "Email confirmations",
    ],
    cta: "Get Started Free",
    href: "/register",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For growing businesses ready to reduce no-shows",
    features: [
      "Unlimited bookings",
      "Web + SMS channels",
      "Up to 10 staff members",
      "50 services",
      "SMS reminders & confirmations",
      "Waitlist management",
      "Business insights",
      "Priority support",
    ],
    cta: "Start Pro Trial",
    href: "/register",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For multi-location businesses and franchises",
    features: [
      "Everything in Pro",
      "Voice AI booking agent",
      "Unlimited staff & services",
      "Multi-location support",
      "API access",
      "Dedicated support",
      "Custom integrations",
    ],
    cta: "Contact Sales",
    href: "mailto:sales@bookilot.app",
    highlight: false,
  },
];

export function Pricing() {
  return (
    <>
      <section id="pricing" className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Start free, upgrade when you&apos;re ready. No hidden fees.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-2xl border p-8 transition-all ${
                  tier.highlight
                    ? "border-indigo-600 shadow-xl ring-1 ring-indigo-600"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                }`}
              >
                {tier.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-indigo-600 px-4 py-1 text-xs font-semibold text-white">
                      Most Popular
                    </span>
                  </div>
                )}

                <h3 className="text-lg font-semibold text-gray-900">
                  {tier.name}
                </h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="text-gray-500">{tier.period}</span>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-500">{tier.description}</p>

                <ul className="mt-8 space-y-3">
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 text-sm text-gray-700"
                    >
                      <Check className="h-5 w-5 flex-shrink-0 text-indigo-600" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href={tier.href}
                  className={`mt-8 block w-full rounded-lg py-3 text-center text-sm font-semibold transition-colors ${
                    tier.highlight
                      ? "bg-indigo-600 text-white hover:bg-indigo-500"
                      : "bg-white text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-indigo-600 py-16">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to fill your calendar?
          </h2>
          <p className="mt-4 text-lg text-indigo-100">
            Join 2,500+ businesses using Bookilot to accept bookings, reduce
            no-shows, and grow their revenue.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-indigo-600 shadow-sm transition-all hover:bg-indigo-50 hover:shadow-md active:scale-95"
            >
              Start free trial
            </Link>
          </div>
          <p className="mt-4 text-sm text-indigo-200">
            Free for up to 50 bookings/month. No card required.
          </p>
        </div>
      </section>
    </>
  );
}
