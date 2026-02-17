import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSignedImageUrl } from "../../lib/storage";

export default function CollectionsCard({ collection, variant = "tile" }) {
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadImage() {
      if (!collection?.image_path) {
        setImageUrl(null);
        return;
      }

      const url = await getSignedImageUrl(collection.image_path);
      if (!cancelled) setImageUrl(url);
    }

    loadImage();

    return () => { cancelled = true; };
  }, [collection?.image_path]);

  const title = collection?.name || "Untitled collection";
  const desc = collection?.description || "";

  // --- TILE (Home grid) ---
  if (variant === "tile") {
    return (
      <Link
        to={`/collections/${collection.id}`}
        className="group block rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5 transition
                   hover:shadow-md hover:ring-yellow-300"
      >
        <div className="flex flex-col gap-3">
          <div className="aspect-square w-full overflow-hidden rounded-2xl bg-gray-100 ring-1 ring-black/5">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={title}
                className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                loading="lazy"
              />
            ) : (
              <div className="grid h-full w-full place-items-center text-xs font-medium text-gray-600">
                No cover yet
              </div>
            )}
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 line-clamp-2">
              {title}
            </p>

            {desc ? (
              <p className="mt-1 text-sm text-gray-600 line-clamp-1">
                {desc}
              </p>
            ) : (
              <p className="mt-1 text-sm text-gray-400 line-clamp-1">
                No description yet
              </p>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // --- ROW (Collections list page) ---
  return (
    <Link
      to={`/collections/${collection.id}`}
      className="group block rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition
                 hover:shadow-md hover:ring-yellow-300"
    >
      <div className="flex gap-4">
        <div className="w-26 shrink-0">
          <div className="aspect-square overflow-hidden rounded-2xl bg-gray-100 ring-1 ring-black/5">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={title}
                className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                loading="lazy"
              />
            ) : (
              <div className="grid h-full w-full place-items-center text-xs font-medium text-gray-600">
                No cover yet
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-gray-900 line-clamp-2">
            {title}
          </p>

          {desc ? (
            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
              {desc}
            </p>
          ) : (
            <p className="mt-2 text-sm text-gray-400 line-clamp-2">
              Add a short description to remember what this collection is for.
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
