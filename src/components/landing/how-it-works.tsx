const STEPS = [
  {
    number: "1",
    title: "Create your account",
    description: "Sign up with email or Google. No credit card needed.",
  },
  {
    number: "2",
    title: "Add your services",
    description: "Set prices, hours, and staff. Takes less than 5 minutes.",
  },
  {
    number: "3",
    title: "Share your link",
    description: "Customers book directly from your page. That's it.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-gray-50 py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Up and running in 3 minutes
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            No technical skills required. Just sign up and start taking bookings.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.number} className="relative text-center">
              {/* Connector line (desktop only) */}
              {i < STEPS.length - 1 && (
                <div className="absolute left-1/2 top-8 hidden h-0.5 w-full bg-indigo-200 md:block" />
              )}

              {/* Step number */}
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-600">
                {step.number}
              </div>

              <h3 className="mt-6 text-lg font-semibold text-gray-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-gray-500">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
