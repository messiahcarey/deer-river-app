import Link from "next/link";

export default function FactionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <Link href="/" className="text-amber-600 hover:text-amber-800 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-amber-900 mb-4">
            🏛️ Factions of Deer River
          </h1>
          <p className="text-lg text-amber-700">
            Track alliances, rivalries, and political relationships between factions.
          </p>
        </header>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏛️</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Faction Management
            </h2>
            <p className="text-gray-600 mb-6">
              This page will show all the factions in Deer River, their alliances, 
              rivalries, and political relationships.
            </p>
            <div className="bg-amber-50 p-4 rounded-lg">
              <p className="text-sm text-amber-700">
                <strong>Coming Soon:</strong> Faction list, alliance mapping, political relationships, and faction details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
