export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-4">
          Bookilot
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Smart booking for local businesses. Accept bookings through web, SMS,
          and voice — all in one place.
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/login"
            className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
          >
            Get Started
          </a>
          <a
            href="/pricing"
            className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
          >
            View Pricing
          </a>
        </div>
      </div>
    </main>
  );
}
