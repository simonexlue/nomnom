import { useAuth } from "../../app/AuthProvider"
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";
import { FaAngleDown } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

export default function NewRecipe() {
    const [title, setTitle] = useState("");
    const [ingredientsList, setIngredientsList] = useState([]);
    const [ingredientsInput, setIngredientsInput] = useState("");
    const [stepsInput, setStepsInput] = useState("");
    const [stepsList, setStepsList] = useState([]);
    const [notes, setNotes] = useState("");
    const [tagsInput, setTagsInput] = useState("");
    const [tagsList, setTagsList] = useState([]);
    const [imageFile, setImageFile] = useState(null);

    const [collection, setCollection] = useState([])
    const [selectedCollectionId, setSelectedCollectionId] = useState("")

    const user_id = useAuth().user.id

    const navigate = useNavigate();

    const fileInputRef = useRef(null)
    const [isDragging, setIsDragging] = useState(false)
    const [previewUrl, setPreviewUrl] = useState("")

    useEffect(() => {
        async function fetchCollectionNames() {
            const { data, error } = await supabase
                .from("collections")
                .select("id, name")

            if (error) {
                console.log("failed to load collections:", error)
                return;
            }
            setCollection(data ?? [])
        }

        fetchCollectionNames()
    }, [])

    useEffect(() => {
        if (!imageFile) {
            setPreviewUrl("")
            return;
        }

        const url = URL.createObjectURL(imageFile)
        setPreviewUrl(url)

        return () => URL.revokeObjectURL(url)
    }, [imageFile])

    function getExtFromFile(file) {
        const type = (file?.type || "").toLowerCase()

        if (type === "image/jpeg") return "jpg"
        if (type === "image/png") return "png"
        if (type === "image/webp") return "webp"

        const nameExt = file?.name?.split(".").pop()?.toLowerCase()
        return nameExt || "jpg"
    }

    function pickImage() {
        fileInputRef.current?.click()
    }

    function onDropFile(e) {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        const file = e.dataTransfer?.files?.[0]
        if (!file) return;

        const allowed = ["image/jpeg", "image/png", "image/webp"]
        if (!allowed.includes(file.type)) {
            console.log("Only JPG, PNG, or WEBP allowed")
            return;
        }

        setImageFile(file)
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const baseSlug = slugify(title);
        const slug = await makeUniqueSlug(baseSlug);

        const newRecipe = {
            user_id,
            title,
            ingredients: ingredientsList,
            steps: stepsList,
            notes: notes || null,
            tags: tagsList || [],
            slug
        }

        const { data: recipe, error } = await supabase
            .from("recipes")
            .insert(newRecipe)
            .select("id, slug")
            .single()

        if (error) {
            console.log("Create recipe failed:", error.message)
            return;
        }

        // upload image + save image_path
        if (imageFile) {
            const allowed = ["image/jpeg", "image/png", "image/webp"]
            if (!allowed.includes(imageFile.type)) {
                console.log("Only JPG, PNG, or WEBP allowed")
                return;
            }

            const ext = getExtFromFile(imageFile)
            const filePath = `recipes/${user_id}/${recipe.id}/cover.${ext}`

            const { error: uploadError } = await supabase.storage
                .from("recipe-images")
                .upload(filePath, imageFile, {
                    contentType: imageFile.type,
                    upsert: true,
                })

            if (uploadError) {
                console.log("Image upload failed:", uploadError.message)
                return;
            }

            const { error: updateError } = await supabase
                .from("recipes")
                .update({ image_path: filePath })
                .eq("id", recipe.id)

            if (updateError) {
                console.log("Failed to save image_path:", updateError.message)
                return;
            }
        }

        // if user picked a collection, link it
        if (selectedCollectionId) {
            const { error: linkError } = await supabase
                .from("collection_recipes")
                .insert({
                    user_id,
                    collection_id: selectedCollectionId,
                    recipe_id: recipe.id
                })
            if (linkError) {
                console.log("Failed to link to collection:", linkError)
            }
        }

        navigate(`/recipes/${recipe.slug}`)
    }

    async function makeUniqueSlug(baseSlug) {
        if (!baseSlug) return "";

        const { data, error } = await supabase
            .from("recipes")
            .select("slug")
            .eq("user_id", user_id)
            .like("slug", `${baseSlug}%`);

        if (error) {
            console.log("Failed to check slug uniqueness:", error.message)
            return baseSlug;
        }

        const existing = new Set((data ?? []).map((r) => r.slug));

        if (!existing.has(baseSlug)) return baseSlug;

        let n = 2;
        while (existing.has(`${baseSlug}-${n}`)) n += 1;
        return `${baseSlug}-${n}`;
    }

    function slugify(str) {
        return str
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-");
    }

    function addIngredients(e) {
        if (e) e.preventDefault()
        const nextIngredient = ingredientsInput.trim();
        if (!nextIngredient) return;
        setIngredientsList((prev) => [...prev, nextIngredient])
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

                    {/* Collection dropdown */}
                    <div className="space-y-1 mt-2">
                        <span className="text-xs font-medium text-gray-500">Add to Collection (optional)</span>
                        <div className="relative">
                            <select
                                className={`${inputClass} appearance-none pr-14`}
                                value={selectedCollectionId}
                                onChange={(e) => setSelectedCollectionId(e.target.value)}
                            >
                                <option value="">No Collection</option>
                                {collection.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            <FaAngleDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>

                    {/* Image (drag + drop) */}
                    <div className="space-y-1 mt-2">
                        <span className="text-xs font-medium text-gray-500">
                            Image (optional)
                        </span>

                        <div
                            className={[
                                "mt-2 rounded-3xl border-2 border-dashed p-4 transition",
                                isDragging
                                    ? "border-yellow-300 bg-yellow-50/40"
                                    : "border-gray-300 hover:border-gray-400",
                            ].join(" ")}
                            onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true) }}
                            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true) }}
                            onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false) }}
                            onDrop={onDropFile}
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="mt-4 text-sm font-medium text-gray-900">
                                    Drag & drop your cover image here
                                </div>

                                <div className="mt-1 text-xs text-gray-500">
                                    PNG, JPG or WEBP • Max 10MB
                                </div>

                                <button
                                    type="button"
                                    onClick={pickImage}
                                    className="mt-2 rounded-xl bg-gray-200 px-5 py-2 text-sm font-semibold text-gray-900 hover:bg-yellow-400 shadow-sm hover:shadow active:scale-[0.98] transition"
                                >
                                    Choose file
                                </button>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                                />
                            </div>

                            {imageFile && (
                                <div className="mt-8 flex items-center justify-between gap-4 rounded-2xl bg-gray-100 p-4">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="h-16 w-24 overflow-hidden rounded-xl bg-gray-200">
                                            {previewUrl ? (
                                                <img
                                                    src={previewUrl}
                                                    alt="Preview"
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : null}
                                        </div>

                                        <div className="min-w-0">
                                            <div className="text-sm font-medium text-gray-900 break-all">
                                                {imageFile.name}
                                            </div>
                                            <div className="mt-1 text-xs text-gray-500">
                                                Click remove if needed
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className="shrink-0 rounded-xl bg-gray-200 px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-300 transition"
                                        onClick={() => setImageFile(null)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        className="mt-4 w-full rounded-xl bg-yellow-300 py-2.5 font-semibold text-gray-900 hover:bg-yellow-400"
                        type="submit"
                    >
                        Create Recipe
                    </button>
                </form>
            </div >
        </div >
    )
}
