import { Link } from "react-router-dom";
import { CollectionsCard } from "../collections/CollectionsCard";

export default function CollectionsSection({
  loading = false,
  collections = [],
}) {
  const primaryBtn =
    "inline-flex items-center rounded-xl bg-yellow-400 px-4 py-2 text-sm font-medium text-black shadow-sm hover:bg-yellow-300 hover:shadow active:scale-[0.98] transition";

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-gray-900">
          Collections
        </h2>

        <Link
          to="/collections"
          className="text-sm font-medium text-gray-600 underline underline-offset-4
             transition hover:text-yellow-600"
        >
          View all
        </Link>
      </div>

      {loading ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-2xl bg-gray-100"
            />
          ))}
        </div>
      ) : collections.length === 0 ? (
        <div className="mt-4 rounded-2xl bg-gray-100 p-6 ring-1 ring-black/5">
          <p className="text-sm text-gray-600">
            No collections yet → Add your first collection
          </p>

          <div className="mt-4">
            <Link to="/collections/new" className={primaryBtn}>
              + Add Collection
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c) => (
            <CollectionsCard key={c.id} collection={c} />
          ))}
        </div>
      )}
    </section>
  );
}
