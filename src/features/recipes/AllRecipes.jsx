import { useEffect, useState } from "react";
import { getAllRecipes } from "../../lib/recipes";
import { useAuth } from "../../app/AuthProvider";
import { RecipeCard } from "../../components/recipe/RecipeCard";

export default function AllRecipes() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [recipes, setRecipes] = useState([])
    const userId = useAuth().user.id

    useEffect(() => {
        async function loadAllRecipes() {
            try {
                setLoading(true);
                setError("");

                const data = await getAllRecipes({ userId });
                setRecipes(data)

            } catch (error) {
                setError(error.message);
                setLoading(false);
            } finally {
                setLoading(false);
            }
        }
        loadAllRecipes()

    }, [])
    console.log(recipes)
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="sticky top-0 z-20 space-y-3 mb-4 pb-4 px-1">
                <h1 className="text-2xl font-semibold tracking-tight text-gray-900 break-words">All Recipes</h1>
                <div className="mt-2 h-1 w-10 rounded-full bg-yellow-400" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {recipes.map((r) => (
                    <div key={r.id} className="max-w-[170px]">
                        <RecipeCard recipe={r} />
                    </div>
                ))}
            </div>
        </div>


    )
}