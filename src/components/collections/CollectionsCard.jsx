import { Link } from "react-router-dom";

export function CollectionsCard({ collection }) {
  const dateLabel = collection.created_at
    ? new Date(collection.created_at).toLocaleDateString()
    : "";

  return (
    <Link
      to={`/collections/${collection.id}`}
      className="group block h-44 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition
             hover:shadow-md hover:ring-yellow-300"
    >
      <div className="flex h-full flex-col">
        {/* Top */}
        <div>
          <div className="flex items-start justify-between gap-3">
            <h3 className="line-clamp-2 font-medium text-gray-900">
              {collection.title || "Untitled colection"}
            </h3>
            <span className="text-gray-300 transition group-hover:text-gray-400">
              ›
            </span>
          </div>

          {collection.description ? (
            <p className="mt-2 line-clamp-2 text-sm text-gray-600">
              {collection.description}
            </p>
          ) : (
            <p className="mt-2 text-sm text-gray-400">No description yet</p>
          )}
        </div>

        {/* Bottom */}
        <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
          <span className="text-gray-500">Collection</span>
          {dateLabel ? <span className="shrink-0">{dateLabel}</span> : null}
        </div>
      </div>
    </Link>
  );
}
