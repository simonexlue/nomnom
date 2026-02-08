import { Link } from "react-router-dom";

export function RecipeCard({ recipe }) {
  const dateLabel = recipe.updated_at
    ? new Date(recipe.updated_at).toLocaleDateString()
    : "";

  return (
    <Link
      to={`/recipes/${recipe.id}`}
      className="group block h-44 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition
             hover:shadow-md hover:ring-yellow-300"
    >
      <div className="flex h-full flex-col">
        {/* Top */}
        <div>
          <div className="flex items-start justify-between gap-3">
            <h3 className="line-clamp-2 font-medium text-gray-900">
              {recipe.title || "Untitled recipe"}
            </h3>
            <span className="text-gray-300 transition group-hover:text-gray-400">
              ›
            </span>
          </div>

          {recipe.notes ? (
            <p className="mt-2 line-clamp-2 text-sm text-gray-600">
              {recipe.notes}
            </p>
          ) : (
            <p className="mt-2 text-sm text-gray-400">No notes yet</p>
          )}
        </div>

        {/* Bottom (always aligned) */}
        <div className="mt-auto flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {recipe.tags?.length ? (
              recipe.tags.slice(0, 2).map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-gray-900"
                >
                  {t}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-500">No tags</span>
            )}
          </div>

          {dateLabel ? (
            <span className="shrink-0 text-xs text-gray-500">{dateLabel}</span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
