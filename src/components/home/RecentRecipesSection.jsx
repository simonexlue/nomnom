import { Link } from "react-router-dom";
import { RecipeCard } from "../recipe/RecipeCard";

export default function RecentRecipesSection({
  loading = false,
  recipes = [],
}) {

  return (
    <section >
      <div className="flex items-center justify-between ">
        <h2 className="text-lg font-semibold tracking-tight text-gray-900 pl-0.5">
          Recipes
        </h2>

        <div className="flex items-center gap-2">
          <Link
            to="/recipes"
            className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm
                    hover:bg-gray-50 hover:text-gray-900 transition"
          >
            View all
          </Link>

          <span className="h-4 w-px bg-gray-200" />

          <Link
            to="/recipes/new"
            className="inline-flex items-center rounded-xl bg-yellow-400 px-3 py-1.5 text-sm font-medium text-black shadow-sm
                    hover:bg-yellow-300 hover:shadow transition"
          >
            + Add
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-44 shrink-0 w-[calc((100%-1.5rem)/3)] animate-pulse rounded-2xl bg-gray-100"
            />
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <div className="mt-4 rounded-2xl bg-gray-100 p-6 ring-1 ring-black/5">
          <p className="text-sm text-gray-600">
            No recipes yet → Add your first recipe
          </p>
        </div>
      ) : (
        <div className="mt-0">
          <div
            className="
    flex gap-3 overflow-x-auto scroll-hover snap-x snap-mandatory
    pl-0.5 pr-0.5 scroll-pl-2 scroll-pr-2 py-2
    xl:grid xl:grid-cols-6 xl:gap-3 xl:overflow-visible xl:snap-none
  "
          >
            {recipes.slice(0, 6).map((r) => (
              <div
                key={r.id}
                className="
        shrink-0 snap-start
        w-full
        sm:w-[calc((100%-0.75rem)/2)]
        lg:w-[calc((100%-1.5rem)/3)]
        xl:w-auto xl:shrink xl:snap-none
      "
              >
                <RecipeCard recipe={r} />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
