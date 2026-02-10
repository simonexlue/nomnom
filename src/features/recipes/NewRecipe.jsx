import { useAuth } from "../../app/AuthProvider"
import { useState } from "react";

export default function NewRecipe() {
    const [title, setTitle] = useState("");
    const [ingredients, setIngredients] = useState("");
    const [steps, setSteps] = useState("");
    const [notes, setNotes] = useState("");
    const [tags, setTags] = useState("");

    // const {user} = useAuth();
    const user_id = useAuth().user.id

    console.log(user_id)

    function handleSubmit(e) {
        e.preventDefault();
    }

    const inputClass =
        "w-full rounded-xl bg-gray-200 mt-2 px-4 py-2.5 outline-none ring-2 ring-transparent focus:ring-yellow-300";

    return (
        <div className="space-y-8">
            {/* HEADER */}
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-gray-900">New Recipe</h1>
                <div className="mt-2 h-1 w-10 rounded-full bg-yellow-400" />
            </div>

            {/* FORM */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <form onSubmit={handleSubmit}>

                    {/* recipes.title */}
                    <div className="space-y-1">
                        <span className="text-xs font-medium text-gray-500">Recipe Name</span>
                        <input
                            className={inputClass}
                            type="text"
                            placeholder="Ceasar Salad"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    {/* recipes.ingredients */}
                    {/* recipes.steps */}
                    {/* recipes.notes (optional) */}
                    {/* recipes.tags (optional) */}
                </form>
            </div>
        </div>
    )
}