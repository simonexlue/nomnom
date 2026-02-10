import { useEffect, useState } from "react"
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
                console.log(err.message)
                setRecipe(null)
            } finally {
                setLoading(false);
            }
        }
        if (user?.id && slug) loadRecipe();
    }, [user?.id, slug])

    if (loading) return null;
    if (!recipe) return <div>Recipe not found.</div>;

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{recipe.title}</h1>
                <div className="mt-2 h-1 w-10 rounded-full bg-yellow-400" />
            </div>
        </div>
    )
}