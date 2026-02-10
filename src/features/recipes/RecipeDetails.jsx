import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { supabase } from "../../lib/supabaseClient"
import { useAuth } from "../../app/AuthProvider"

export default function RecipeDetails() {
    const { slug } = useParams();
    const { user } = useAuth();

    const [recipe, setRecipe] = useState(null)
    const [loading, setLoading] = useState(true);

    //load recipe details on mount
    //fetch recipe from supabase by slug
    return (
        <div>
            <div>
                Recipe Details
            </div>
        </div>
    )
}