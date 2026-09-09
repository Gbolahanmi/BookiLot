import { Link2, MessageSquare, Bot, Calendar, BarChart3, Zap } from "lucide-react";

const FEATURES = [
  {
    icon: <Link2 className="h-6 w-6" />,
    title: "Multi-channel",
    description: "Web, SMS, and voice — one calendar, no double-bookings.",
  },
  {
    icon: <MessageSquare className="h-6 w-6" />,
    title: "SMS reminders",
    description: "Automatic confirmations and reminders reduce no-shows.",
  },
  {
    icon: <Bot className="h-6 w-6" />,
    title: "AI receptionist",
    description: "Answers calls, books appointments, handles FAQs for you.",
  },
  {
    icon: <Calendar className="h-6 w-6" />,
    title: "No double-bookings",
    description: "Real-time calendar sync across all channels.",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Business insights",
    description: "See your numbers at a glance — bookings, revenue, trends.",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Live in 10 minutes",
    description: "No technical skills needed. Start taking bookings now.",
  },
];

export function Features() {
  return (
    <section id="features" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to fill your calendar
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            One platform to accept bookings, reduce no-shows, and grow.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-gray-200 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                {feature.icon}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-gray-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
