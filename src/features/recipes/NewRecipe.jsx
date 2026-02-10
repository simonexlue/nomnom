import { useAuth } from "../../app/AuthProvider"
import { useState } from "react";

export default function NewRecipe() {
    const [title, setTitle] = useState("");
    const [ingredientsList, setIngredientsList] = useState([]);
    const [ingredientsInput, setIngredientsInput] = useState("");
    const [stepsInput, setStepsInput] = useState("");
    const [stepsList, setStepsList] = useState([]);
    const [notes, setNotes] = useState("");
    const [tagsInput, setTagsInput] = useState("");
    const [tagsList, setTagsList] = useState([]);

    // const {user} = useAuth();
    const user_id = useAuth().user.id

    // console.log(user_id)

    function handleSubmit(e) {
        e.preventDefault();
    }

    function addIngredients(e) {
        // prevent button submission of the form
        if (e) e.preventDefault()
        // validate string
        const nextIngredient = ingredientsInput.trim();
        if (!nextIngredient) return;
        // add ingredient to main ingredient list
        setIngredientsList((prev) => [...prev, nextIngredient])
        // clear input
        setIngredientsInput("")
    }

    function removeIngredient(indexToRemove) {
        setIngredientsList((prev) => prev.filter((_, i) => i !== indexToRemove))
    }

    function addSteps(e) {
        if (e) e.preventDefault()
        const nextStep = stepsInput.trim();
        if (!nextStep) return;
        setStepsList((prev) => [...prev, nextStep])
        setStepsInput("")
    }

    function removeStep(indexToRemove) {
        setStepsList((prev) => prev.filter((_, i) => i !== indexToRemove))
    }

    function addTag(e) {
        if (e) e.preventDefault()
        const nextTag = tagsInput.trim();
        if (!nextTag) return;
        setTagsList((prev) => [...prev, nextTag])
        setTagsInput("")
    }

    function removeTag(indexToRemove) {
        setTagsList((prev) => prev.filter((_, i) => i !== indexToRemove))
    }

    const inputClass =
        "w-full rounded-xl bg-gray-200 mt-2 mb-2 px-4 py-2.5 outline-none ring-2 ring-transparent focus:ring-yellow-300";

    const pillClass =
        "group relative inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-gray-900 mt-1 cursor-pointer select-none hover:bg-yellow-200 max-w-full whitespace-normal break-all";

    const tooltip =
        "pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-2 py-1 text-[11px] text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
    return (
        <div className="space-y-6">
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
                    <div className="space-y-1 mt-2">
                        <span className="text-xs font-medium text-gray-500">Ingredients</span>
                        <div className="relative">
                            <input
                                className={`${inputClass} pr-12`}
                                type="text"
                                placeholder="1 egg"
                                value={ingredientsInput}
                                onChange={(e) => setIngredientsInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        addIngredients(e);
                                    }
                                }}
                            />

                            <button
                                type="button"
                                onClick={addIngredients}
                                className="absolute right-2 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full text-gray-900 hover:bg-yellow-300"
                                aria-label="Add ingredient"
                                title="Add ingredient"
                            >
                                +
                            </button>
                        </div>
                        {ingredientsList.length > 0 &&
                            <div className="flex flex-wrap gap-2">
                                {ingredientsList.map((ingredient, index) => (
                                    <span
                                        key={`${ingredient}-${index}`}
                                        className={pillClass}
                                        title="Click to remove ingredient"
                                        onClick={() => removeIngredient(index)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") removeIngredient(index);
                                        }}
                                    >
                                        {ingredient}
                                        <span className={tooltip}>Click to remove {ingredient}</span>
                                    </span>
                                ))}
                            </div>}
                    </div>

                    {/* recipes.steps */}
                    <div className="space-y-1 mt-2">
                        <span className="text-xs font-medium text-gray-500">Steps</span>
                        <div className="relative">
                            <input
                                className={`${inputClass} pr-12`}
                                type="text"
                                placeholder="Add dry ingredients to a mixing bowl..."
                                value={stepsInput}
                                onChange={(e) => setStepsInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        addSteps(e);
                                    }
                                }}
                            />

                            <button
                                type="button"
                                onClick={addSteps}
                                className="absolute right-2 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full text-gray-900 hover:bg-yellow-300"
                                aria-label="Add step"
                                title="Add step"
                            >
                                +
                            </button>
                        </div>
                        {stepsList.length > 0 && (
                            <ol className="list-decimal w-full bg-gray-200 rounded-xl pl-8 pr-4 py-2">
                                {stepsList.map((step, index) => (
                                    <li key={`step-${index}`} className="py-1.5 text-sm text-gray-900">
                                        <div className="flex justify-between items-start">
                                            <span className="break-words min-w-0 pr-4">{step}</span>
                                            <button
                                                type="button"
                                                className="flex justify-center items-center rounded-xl bg-yellow-300 px-2.5 text-sm shadow-sm hover:bg-yellow-400 hover:shadow active:scale-[0.98] transition cursor-pointer"
                                                onClick={() => removeStep(index)}
                                            >
                                                x
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </div>

                    {/* recipes.notes (optional) */}
                    <div className="space-y-1 mt-2">
                        <span className="text-xs font-medium text-gray-500">Notes (optional)</span>
                        <input
                            className={inputClass}
                            type="text"
                            placeholder="This recipe was amazing, would make again"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    {/* recipes.tags (optional) */}
                    <div className="space-y-1 mt-2">
                        <span className="text-xs font-medium text-gray-500">Tags (optional)</span>
                        <div className="relative">
                            <input
                                className={`${inputClass} pr-12`}
                                type="text"
                                placeholder="ex. fast"
                                value={tagsInput}
                                onChange={(e) => setTagsInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        addTag(e);
                                    }
                                }}
                            />

                            <button
                                type="button"
                                onClick={addTag}
                                className="absolute right-2 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full text-gray-900 hover:bg-yellow-300"
                                aria-label="Add tag"
                                title="Add tag"
                            >
                                +
                            </button>
                        </div>
                        {tagsList.length > 0 &&
                            <div className="flex flex-wrap gap-2">
                                {tagsList.map((tag, index) => (
                                    <span
                                        key={`${tag}-${index}`}
                                        className={pillClass}
                                        title="Click to remove tag"
                                        onClick={() => removeTag(index)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") removeTag(index);
                                        }}
                                    >
                                        {tag}
                                        <span className={tooltip}>Click to remove {tag}</span>
                                    </span>
                                ))}
                            </div>}
                    </div>
                </form>
            </div >
        </div >
    )
}