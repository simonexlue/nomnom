import { Link } from "react-router-dom";
import CollectionCard from "../collections/CollectionsCard"

export default function CollectionsSection({
  loading = false,
  collections = [],
}) {
  const addBtn =
    "inline-flex items-center justify-center rounded-xl bg-yellow-400 px-3 py-1.5 text-sm font-medium text-black shadow-sm hover:bg-yellow-300 hover:shadow active:scale-[0.98] transition";

  const viewLink =
    "text-sm font-medium text-gray-600 underline underline-offset-4 transition hover:text-yellow-600";

  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight text-gray-900 pl-0.5">
          Collections
        </h2>

        <div className="flex items-center gap-2">
          <Link
            to="/collections"
            className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm
                      hover:bg-gray-50 hover:text-gray-900 transition"
          >
            View all
          </Link>

          <span className="h-4 w-px bg-gray-200" />

          <Link
            to="/collections/new"
            className="inline-flex items-center rounded-xl bg-yellow-400 px-3 py-1.5 text-sm font-medium text-black shadow-sm
                      hover:bg-yellow-300 hover:shadow transition"
          >
            + Add
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="mt-2">
          <div className="flex gap-3 overflow-x-auto pb-2 scroll-hover">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="
                  h-44 animate-pulse rounded-2xl bg-gray-100
                  shrink-0
                  w-full
                  sm:w-[calc((100%-0.75rem)/2)]
                  lg:w-[calc((100%-1.5rem)/3)]
                  xl:w-[calc((100%-3.75rem)/6)]
                "
              />
            ))}
          </div>
        </div>
      ) : collections.length === 0 ? (
        <div className="mt-4 rounded-2xl bg-gray-50 p-6 ring-1 ring-black/5">
          <p className="text-sm text-gray-600">
            No collections yet → Create a collection
          </p>

          <div className="mt-2">
            <Link to="/collections/new" className={addBtn}>
              + Add Collection
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-2 relative">
          {/* right fade so it feels capped after ~3 cards */}
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-[#f4efe4] to-transparent" />

          <div
            className="
      flex gap-3 overflow-x-auto scroll-hover snap-x snap-mandatory
      pl-0.5 pr-0.5 scroll-pl-2 scroll-pr-2 py-2
    "
          >
            {collections.slice(0, 6).map((c) => (
              <div
                key={c.id}
                className="
          shrink-0 snap-start
          w-[360px]
          sm:w-[420px]
        "
              >
                <CollectionCard collection={c} />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
