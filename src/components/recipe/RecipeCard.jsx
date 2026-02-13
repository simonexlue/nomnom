import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSignedImageUrl } from "../../lib/storage";

export function RecipeCard({ recipe }) {
  const [imageUrl, setImageUrl] = useState(null);

  const dateLabel = recipe.updated_at
    ? new Date(recipe.updated_at).toLocaleDateString()
    : "";

  useEffect(() => {
    let cancelled = false;
    async function loadImage() {
      if (!recipe?.image_path) {
        setImageUrl(null);
        return;
      }

      const url = await getSignedImageUrl(recipe.image_path);
      if (!cancelled) setImageUrl(url);
    }

    loadImage();

    return () => {
      cancelled = true;
    }

  }, [recipe?.image_path])

  return (
    <Link
      to={`/recipes/${recipe.slug}`}
      className="group block rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5 transition
                 hover:shadow-md hover:ring-yellow-300"
    >
      <div className="flex flex-col gap-3">
        {/* IMAGE */}
        <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-100 ring-1 ring-black/5">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={recipe.title || "Recipe image"}
              className="h-full w-full object-cover transition group-hover:scale-[1.02]"
              loading="lazy"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-sm font-medium text-gray-500">
              No image
            </div>
          )}
        </div>

        {/* TITLE */}
        <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">
          {recipe.title || "Untitled recipe"}
        </h3>

        {/* FOOTER */}
        <div className="flex items-center justify-between gap-2">
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
            ) : null}
          </div>

          {dateLabel ? (
            <span className="shrink-0 text-xs text-gray-500">
              {dateLabel}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
