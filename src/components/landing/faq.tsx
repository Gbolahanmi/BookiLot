import { ChevronDown } from "lucide-react";

const FAQ_ITEMS = [
  {
    question: "Do I need technical skills to set this up?",
    answer:
      "No. Sign up, add your services, share your link. Done. The whole process takes less than 5 minutes.",
  },
  {
    question: "What happens if the AI can't answer a question?",
    answer:
      "It transfers the call to you or takes a message and sends it to your dashboard. You never miss an important call.",
  },
  {
    question: "Can I keep my existing phone number?",
    answer:
      "Yes. We forward calls from your existing number — no changes needed for your customers.",
  },
  {
    question: "Is there a contract or commitment?",
    answer:
      "No. Cancel anytime. The free plan has no commitment at all. Paid plans are month-to-month.",
  },
  {
    question: "How does the free trial work?",
    answer:
      "Full access for 14 days, no card required. Automatically downgrades to Free after. No surprises.",
  },
  {
    question: "Can I accept payments through Bookilot?",
    answer:
      "Yes. Collect deposits and full payments via Paystack integration. Perfect for securing bookings.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="bg-white py-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Everything you need to know about Bookilot.
          </p>
        </div>

        <div className="mt-12 space-y-0 divide-y divide-gray-200 border-t border-gray-200">
          {FAQ_ITEMS.map((item) => (
            <details
              key={item.question}
              className="group py-6"
            >
              <summary className="flex cursor-pointer items-center justify-between text-left text-base font-semibold text-gray-900 transition-colors hover:text-indigo-600 [&::-webkit-details-marker]:hidden">
                {item.question}
                <span className="ml-6 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 transition-transform group-open:rotate-180">
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </span>
              </summary>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
