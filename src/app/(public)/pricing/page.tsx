import Link from "next/link";

const tiers = [
  {
    name: "Free",
    price: "₦0",
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
    href: "/login",
    highlight: false,
  },
  {
    name: "Pro",
    price: "₦15,000",
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
    href: "/login",
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

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-6 text-lg text-gray-600">
            Start free, upgrade when you&apos;re ready. No hidden fees.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl border p-8 ${
                tier.highlight
                  ? "border-indigo-600 shadow-xl ring-1 ring-indigo-600"
                  : "border-gray-200"
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
                    <svg
                      className="h-5 w-5 flex-shrink-0 text-indigo-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
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
    </div>
  );
}
