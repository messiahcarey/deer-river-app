import Link from "next/link";

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <Link href="/" className="text-amber-600 hover:text-amber-800 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-amber-900 mb-4">
            📝 Events of Deer River
          </h1>
          <p className="text-lg text-amber-700">
            View the audit log of all activities and changes in Deer River.
          </p>
        </header>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Event Log
            </h2>
            <p className="text-gray-600 mb-6">
              This page will show the complete audit log of all activities, 
              changes, and events that have occurred in Deer River.
            </p>
            <div className="bg-amber-50 p-4 rounded-lg">
              <p className="text-sm text-amber-700">
                <strong>Coming Soon:</strong> Event timeline, activity log, change tracking, and historical records.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
