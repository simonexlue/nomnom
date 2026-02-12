import { useEffect, useState, useMemo } from "react"
import { useParams } from "react-router-dom"
import { getRecipe } from "../../lib/recipes";
import { useAuth } from "../../app/AuthProvider"

export default function RecipeDetails() {
    const { slug } = useParams();
    const { user } = useAuth();

    const [recipe, setRecipe] = useState(null)
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
                console.log(error.message)
                setRecipe(null)
            } finally {
                setLoading(false);
            }
        }
        if (user?.id && slug) loadRecipe();
    }, [user?.id, slug])

    // These could be empty
    const ingredients = recipe?.ingredients ?? [];
    const steps = recipe?.steps ?? [];

    const timeLabel = (() => {
        if (!recipe?.created_at) return "";

        const date = new Date(recipe.created_at)
        if (Number.isNaN(date.getTime())) return recipe.created_at;
        return date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "2-digit"
        });

    })();

    if (loading) return null;
    if (!recipe) return <div>Recipe not found.</div>;
    console.log(recipe)

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                    {recipe.title}
                </h1>

                <div className="mt-3 h-1 w-12 rounded-full bg-yellow-400" />

                {timeLabel && (
                    <p className="mt-3 text-xs font-medium text-gray-500">
                        Created: {timeLabel}
                    </p>
                )}

                {recipe.notes && (
                    <div className="mt-5 rounded-xl bg-gray-100 p-4">
                        <p className="text-xs font-semibold text-gray-700">Notes</p>
                        <p className="mt-2 text-sm leading-relaxed text-gray-800">
                            {recipe.notes}
                        </p>
                    </div>
                )}
            </div>

            {/* CONTENT */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                {/* INGREDIENTS */}
                <div>
                    <div className="flex items-baseline justify-between">
                        <h2 className="text-base font-semibold tracking-tight text-gray-900">
                            Ingredients
                        </h2>
                        <p className="text-xs font-medium text-gray-500">
                            {ingredients.length} item{ingredients.length === 1 ? "" : "s"}
                        </p>
                    </div>

                    {ingredients.length === 0 ? (
                        <p className="mt-3 text-sm text-gray-500">
                            No ingredients added yet.
                        </p>
                    ) : (
                        <ul className="mt-3 space-y-2 pl-5 text-sm text-gray-800">
                            {ingredients.map((ingredient, idx) => (
                                <li key={`${ingredient}-${idx}`} className="list-disc">
                                    {ingredient}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="my-6 h-px w-full bg-gray-100" />

                {/* STEPS */}
                <div>
                    <div className="flex items-baseline justify-between">
                        <h2 className="text-base font-semibold tracking-tight text-gray-900">
                            Steps
                        </h2>
                        <p className="text-xs font-medium text-gray-500">
                            {steps.length} step{steps.length === 1 ? "" : "s"}
                        </p>
                    </div>

                    {steps.length === 0 ? (
                        <p className="mt-3 text-sm text-gray-500">No steps added yet.</p>
                    ) : (
                        <ol className="mt-3 space-y-3 pl-5 text-sm text-gray-800">
                            {steps.map((step, idx) => (
                                <li key={`${step}-${idx}`} className="list-decimal">
                                    <span className="leading-relaxed">{step}</span>
                                </li>
                            ))}
                        </ol>
                    )}
                </div>
            </div>
        </div>
    );
}