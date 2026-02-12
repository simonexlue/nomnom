import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getRecipe } from "../../lib/recipes";
import { useAuth } from "../../app/AuthProvider";

export default function RecipeDetails() {
    const { slug } = useParams();
    const { user } = useAuth();

    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadRecipe() {
            try {
                setLoading(true);

                const data = await getRecipe({
                    slug,
                    userId: user.id,
                });

                setRecipe(data);
            } catch (error) {
                console.log(error.message);
                setRecipe(null);
            } finally {
                setLoading(false);
            }
        }

        if (user?.id && slug) loadRecipe();
    }, [user?.id, slug]);

    if (loading) return null;
    if (!recipe) return <div>Recipe not found.</div>;

    const ingredients = recipe.ingredients ?? [];
    const steps = recipe.steps ?? [];
    const tags = recipe.tags ?? [];

    const pillClass =
        "inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-gray-900";

    const toolBtn =
        "rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-900 hover:bg-gray-200 active:scale-[0.98] transition";

    const timeLabel = (() => {
        if (!recipe?.created_at) return "";
        const date = new Date(recipe.created_at);
        if (Number.isNaN(date.getTime())) return recipe.created_at;
        return date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "2-digit",
        });
    })();

    return (
        <div className="space-y-6">
            {/* HEADER (non-scrollable) */}
            <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                            {recipe.title}
                        </h1>
                        <div className="mt-2 h-1 w-10 rounded-full bg-yellow-400" />

                        {tags.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {tags.map((tag, idx) => (
                                    <span key={`${tag}-${idx}`} className={pillClass}>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="shrink-0">
                        <button
                            type="button"
                            className="rounded-xl bg-yellow-300 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-yellow-400 active:scale-[0.98] transition"
                        >
                            Edit
                        </button>
                    </div>
                </div>
            </div>

            {/* SCROLLABLE CONTENT */}
            <div className="space-y-6 overflow-y-auto pr-1 max-h-[calc(100vh-220px)]">
                {/* PREP / COOK / SERVES SECTION */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-xl bg-gray-100 p-4 text-center">
                            <p className="text-xs font-medium text-gray-500">Prep</p>
                            <p className="mt-1 text-sm font-semibold text-gray-900">—</p>
                        </div>

                        <div className="rounded-xl bg-gray-100 p-4 text-center">
                            <p className="text-xs font-medium text-gray-500">Cook</p>
                            <p className="mt-1 text-sm font-semibold text-gray-900">—</p>
                        </div>

                        <div className="rounded-xl bg-gray-100 p-4 text-center">
                            <p className="text-xs font-medium text-gray-500">Serves</p>
                            <p className="mt-1 text-sm font-semibold text-gray-900">—</p>
                        </div>
                    </div>
                </div>

                {/* MAIN GRID */}
                {/* < 1280px (roughly your “<1200” intent): single column. >=1280px: 2 columns */}
                <div className="grid gap-6 xl:grid-cols-[2fr_3fr]">
                    {/* LEFT SIDE */}
                    <div className="space-y-6">
                        {/* PHOTO */}
                        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-b from-gray-50 to-gray-100 shadow-sm">
                            <div className="aspect-[4/3] p-6">
                                <div className="grid h-full w-full place-items-center rounded-2xl border-2 border-dashed border-gray-200 bg-white/60">
                                    <div className="text-center">
                                        <p className="text-sm font-semibold text-gray-800">
                                            Add a photo
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500">
                                            Visualizing photo
                                        </p>
                                        {/* Upload button will be put in edit later */}
                                        <button
                                            type="button"
                                            className="mt-4 rounded-xl bg-yellow-300 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-yellow-400 active:scale-[0.98] transition"
                                        >
                                            Upload
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* NOTES */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="text-base font-semibold tracking-tight text-gray-900">
                                Notes
                            </h2>

                            {recipe.notes ? (
                                <p className="mt-3 text-sm leading-relaxed text-gray-800">
                                    {recipe.notes}
                                </p>
                            ) : (
                                <p className="mt-3 text-sm text-gray-500">No notes added yet.</p>
                            )}
                        </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        {/* INGREDIENTS */}
                        <div>
                            <div className="flex items-baseline justify-between">
                                <h3 className="text-base font-semibold text-gray-900">
                                    Ingredients
                                </h3>
                                <p className="text-xs text-gray-500">
                                    {ingredients.length} item{ingredients.length === 1 ? "" : "s"}
                                </p>
                            </div>

                            {ingredients.length === 0 ? (
                                <p className="mt-3 text-sm text-gray-500">
                                    No ingredients added yet.
                                </p>
                            ) : (
                                <ul className="mt-3 space-y-2">
                                    {ingredients.map((ingredient, idx) => (
                                        <li
                                            key={`${ingredient}-${idx}`}
                                            className="rounded-xl bg-gray-100 px-3 py-2 text-sm text-gray-900"
                                        >
                                            {ingredient}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="my-6 h-px w-full bg-gray-200" />

                        {/* STEPS */}
                        <div>
                            <div className="flex items-baseline justify-between">
                                <h3 className="text-base font-semibold text-gray-900">Steps</h3>
                                <p className="text-xs text-gray-500">
                                    {steps.length} step{steps.length === 1 ? "" : "s"}
                                </p>
                            </div>

                            {steps.length === 0 ? (
                                <p className="mt-3 text-sm text-gray-500">No steps added yet.</p>
                            ) : (
                                <ol className="mt-3 space-y-2">
                                    {steps.map((step, idx) => (
                                        <li
                                            key={`${step}-${idx}`}
                                            className="flex gap-3 rounded-xl bg-gray-100 px-3 py-2 text-sm text-gray-900"
                                        >
                                            <span className="min-w-[1.25rem] font-semibold text-gray-700">
                                                {idx + 1}.
                                            </span>
                                            <span className="leading-relaxed">{step}</span>
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
