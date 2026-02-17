import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { getRecipe, updateRecipe } from "../../lib/recipes";
import { useAuth } from "../../app/AuthProvider";
import { getSignedImageUrl } from "../../lib/storage";

export default function RecipeDetails() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);

    // current image (view mode + existing image)
    const [imageUrl, setImageUrl] = useState(null);

    // edit mode
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    // draft fields
    const [draftTitle, setDraftTitle] = useState("");
    const [draftNotes, setDraftNotes] = useState("");

    const [draftIngredients, setDraftIngredients] = useState([]);
    const [ingredientInput, setIngredientInput] = useState("");

    const [draftSteps, setDraftSteps] = useState([]);
    const [stepInput, setStepInput] = useState("");

    const [draftTags, setDraftTags] = useState([]);
    const [tagInput, setTagInput] = useState("");

    // image edit
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [removeImage, setRemoveImage] = useState(false);

    useEffect(() => {
        async function loadRecipe() {
            try {
                setLoading(true);

                const data = await getRecipe({
                    slug,
                    userId: user.id,
                });

                setRecipe(data);

                // set draft defaults
                setDraftTitle(data.title ?? "");
                setDraftNotes(data.notes ?? "");
                setDraftIngredients(data.ingredients ?? []);
                setDraftSteps(data.steps ?? []);
                setDraftTags(data.tags ?? []);

                // reset image edit state
                setImageFile(null);
                setPreviewUrl("");
                setRemoveImage(false);

                if (data?.image_path) {
                    const url = await getSignedImageUrl(data.image_path);
                    setImageUrl(url);
                } else {
                    setImageUrl(null);
                }
            } catch (error) {
                console.log(error.message);
                setRecipe(null);
            } finally {
                setLoading(false);
            }
        }

        if (user?.id && slug) loadRecipe();
    }, [user?.id, slug]);

    useEffect(() => {
        if (!imageFile) {
            setPreviewUrl("");
            return;
        }

        const url = URL.createObjectURL(imageFile);
        setPreviewUrl(url);

        return () => URL.revokeObjectURL(url);
    }, [imageFile]);

    if (loading) return null;
    if (!recipe) return <div>Recipe not found.</div>;

    const ingredients = recipe.ingredients ?? [];
    const steps = recipe.steps ?? [];
    const tags = recipe.tags ?? [];

    const pillClass =
        "group relative inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-gray-900 mt-1 cursor-pointer select-none hover:bg-yellow-200 max-w-full whitespace-normal break-all";

    const tooltip =
        "pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-2 py-1 text-[11px] text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100";

    const inputClass =
        "w-full rounded-xl bg-gray-100 mt-2 mb-2 px-4 py-2.5 outline-none ring-2 ring-transparent focus:ring-yellow-300";

    function slugify(str) {
        return (str ?? "")
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-");
    }

    async function makeUniqueSlugForUpdate(baseSlug, recipeId) {
        if (!baseSlug) return "";

        // Pull all slugs for this user that begin with baseSlug
        // ignore this recipe's current slug so renaming to same title doesn't force -2.
        const { data, error } = await supabase
            .from("recipes")
            .select("id, slug")
            .eq("user_id", user.id)
            .like("slug", `${baseSlug}%`);

        if (error) {
            console.log("Failed to check slug uniqueness:", error.message);
            return baseSlug;
        }

        const existing = new Set(
            (data ?? [])
                .filter((r) => r.id !== recipeId)
                .map((r) => r.slug),
        );

        if (!existing.has(baseSlug)) return baseSlug;

        let n = 2;
        while (existing.has(`${baseSlug}-${n}`)) n += 1;
        return `${baseSlug}-${n}`;
    }

    function getExtFromFile(file) {
        const type = (file?.type || "").toLowerCase();

        if (type === "image/jpeg") return "jpg";
        if (type === "image/png") return "png";
        if (type === "image/webp") return "webp";

        const nameExt = file?.name?.split(".").pop()?.toLowerCase();
        return nameExt || "jpg";
    }

    function pickImage() {
        fileInputRef.current?.click();
    }

    function onDropFile(e) {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer?.files?.[0];
        if (!file) return;

        const allowed = ["image/jpeg", "image/png", "image/webp"];
        if (!allowed.includes(file.type)) {
            console.log("Only JPG, PNG, or WEBP allowed");
            return;
        }

        setRemoveImage(true);
        setImageFile(file);
    }

    function addIngredient(e) {
        if (e) e.preventDefault();
        const next = ingredientInput.trim();
        if (!next) return;
        setDraftIngredients((prev) => [...prev, next]);
        setIngredientInput("");
    }

    function removeIngredient(idxToRemove) {
        setDraftIngredients((prev) => prev.filter((_, i) => i !== idxToRemove));
    }

    function addStep(e) {
        if (e) e.preventDefault();
        const next = stepInput.trim();
        if (!next) return;
        setDraftSteps((prev) => [...prev, next]);
        setStepInput("");
    }

    function removeStep(idxToRemove) {
        setDraftSteps((prev) => prev.filter((_, i) => i !== idxToRemove));
    }

    function addTag(e) {
        if (e) e.preventDefault();
        const next = tagInput.trim();
        if (!next) return;
        setDraftTags((prev) => [...prev, next]);
        setTagInput("");
    }

    function removeTag(idxToRemove) {
        setDraftTags((prev) => prev.filter((_, i) => i !== idxToRemove));
    }

    function startEdit() {
        setIsEditing(true);

        // reset draft to recipe (fresh)
        setDraftTitle(recipe.title ?? "");
        setDraftNotes(recipe.notes ?? "");
        setDraftIngredients(recipe.ingredients ?? []);
        setDraftSteps(recipe.steps ?? []);
        setDraftTags(recipe.tags ?? []);

        // image edit reset
        setImageFile(null);
        setPreviewUrl("");
        setRemoveImage(false);
    }

    function cancelEdit() {
        setIsEditing(false);

        // revert local edit state
        setDraftTitle(recipe.title ?? "");
        setDraftNotes(recipe.notes ?? "");
        setDraftIngredients(recipe.ingredients ?? []);
        setDraftSteps(recipe.steps ?? []);
        setDraftTags(recipe.tags ?? []);

        setImageFile(null);
        setPreviewUrl("");
        setRemoveImage(false);
    }

    async function handleSave() {
        try {
            setSaving(true);

            const nextTitle = draftTitle.trim();
            if (!nextTitle) return;

            // If title changed, compute a new unique slug
            let nextSlug = recipe.slug;
            if (nextTitle !== (recipe.title ?? "")) {
                const baseSlug = slugify(nextTitle);
                nextSlug = await makeUniqueSlugForUpdate(baseSlug, recipe.id);
            }

            // 1) Update core fields (title, slug, arrays, notes, tags)
            const updated = await updateRecipe({
                id: recipe.id,
                userId: user.id,
                updates: {
                    title: nextTitle,
                    slug: nextSlug,
                    notes: draftNotes || null,
                    ingredients: draftIngredients,
                    steps: draftSteps,
                    tags: draftTags,
                },
            });

            // 2) Handle image replacement / removal
            if (imageFile) {
                const allowed = ["image/jpeg", "image/png", "image/webp"];
                if (!allowed.includes(imageFile.type)) {
                    console.log("Only JPG, PNG, or WEBP allowed");
                    return;
                }

                const ext = getExtFromFile(imageFile);
                const filePath = `recipes/${user.id}/${recipe.id}/cover.${ext}`;

                const { error: uploadError } = await supabase.storage
                    .from("recipe-images")
                    .upload(filePath, imageFile, {
                        contentType: imageFile.type,
                        upsert: true,
                    });

                if (uploadError) {
                    console.log("Image upload failed:", uploadError.message);
                    return;
                }

                // (optional but nice): if old path exists and is different, remove it to avoid orphan files
                if (recipe.image_path && recipe.image_path !== filePath) {
                    const { error: oldRemoveErr } = await supabase.storage
                        .from("recipe-images")
                        .remove([recipe.image_path]);

                    if (oldRemoveErr) console.log("Failed to remove old image:", oldRemoveErr.message);
                }

                const updated2 = await updateRecipe({
                    id: recipe.id,
                    userId: user.id,
                    updates: { image_path: filePath },
                });

                setRecipe(updated2);
                const signed = await getSignedImageUrl(filePath);
                setImageUrl(signed);

            } else if (removeImage && recipe.image_path) {
                const { error: removeErr } = await supabase.storage
                    .from("recipe-images")
                    .remove([recipe.image_path]);

                if (removeErr) console.log("Failed to remove image from storage:", removeErr.message);

                const updated2 = await updateRecipe({
                    id: recipe.id,
                    userId: user.id,
                    updates: { image_path: null },
                });

                setRecipe(updated2);
                setImageUrl(null);

            } else {
                setRecipe(updated);
            }

            // clean up edit state
            setIsEditing(false);
            setImageFile(null);
            setPreviewUrl("");
            setRemoveImage(false);

            // If slug changed, update the URL
            if (nextSlug && nextSlug !== slug) {
                navigate(`/recipes/${nextSlug}`, { replace: true });
            }
        } catch (error) {
            console.log(error.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="space-y-6">
            {/* HEADER (non-scrollable) */}
            <div className="sticky top-0 z-20 space-y-3 mb-4 bg-[#f4efe4] pb-4 px-1">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        {!isEditing ? (
                            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 break-words">
                                {recipe.title}
                            </h1>
                        ) : (
                            <div>
                                <div className="text-xs font-medium text-gray-500">Recipe Name</div>
                                <input
                                    className={inputClass}
                                    type="text"
                                    value={draftTitle}
                                    onChange={(e) => setDraftTitle(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        <div className="mt-2 h-1 w-10 rounded-full bg-yellow-400" />

                        {/* TAGS */}
                        {!isEditing ? (
                            tags.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {tags.map((tag, idx) => (
                                        <span key={`${tag}-${idx}`} className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-gray-900">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )
                        ) : (
                            <div className="mt-4">
                                <div className="text-xs font-medium text-gray-500">Tags (optional)</div>

                                <div className="relative">
                                    <input
                                        className={`${inputClass} pr-12`}
                                        type="text"
                                        placeholder="ex. fast"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
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

                                {draftTags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {draftTags.map((tag, index) => (
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
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                        {!isEditing ? (
                            <button
                                type="button"
                                onClick={startEdit}
                                className="rounded-xl bg-yellow-300 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-yellow-400 active:scale-[0.98] transition"
                            >
                                Edit
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    disabled={saving}
                                    onClick={handleSave}
                                    className="rounded-xl bg-yellow-300 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-yellow-400 disabled:opacity-60 active:scale-[0.98] transition"
                                >
                                    {saving ? "Saving..." : "Save"}
                                </button>

                                <button
                                    type="button"
                                    disabled={saving}
                                    onClick={cancelEdit}
                                    className="rounded-xl bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-200 disabled:opacity-60 active:scale-[0.98] transition"
                                >
                                    Cancel
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* SCROLLABLE CONTENT */}
            <div className="space-y-6">
                {/* PREP / COOK / SERVES SECTION */}
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
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
                <div className="grid gap-6 xl:grid-cols-[2fr_3fr]">
                    {/* LEFT SIDE */}
                    <div className="space-y-6">
                        {/* PHOTO / IMAGE EDIT (single panel) */}
                        <div
                            className={[
                                "relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-b from-gray-50 to-gray-100 shadow-sm",
                                isEditing && (removeImage || !imageUrl) && !previewUrl ? "border-dashed" : "",
                            ].join(" ")}
                        >
                            <div className="aspect-[4/3] relative">
                                {/* 1) Preview if new file picked */}
                                {isEditing && previewUrl ? (
                                    <>
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="h-full w-full object-cover rounded-2xl"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setImageFile(null);
                                                setPreviewUrl("");
                                                setRemoveImage(true);
                                            }}
                                            className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-gray-900 shadow-md ring-1 ring-black/10 hover:bg-white active:scale-[0.98] transition"
                                        >
                                            <span className="text-sm leading-none">×</span>
                                            Remove
                                        </button>
                                    </>
                                ) : null}

                                {/* 2) Existing image (only when not removed) */}
                                {(!previewUrl && imageUrl && (!isEditing || (isEditing && !removeImage))) ? (
                                    <>
                                        <img
                                            src={imageUrl}
                                            alt={recipe.title}
                                            className="h-full w-full object-cover rounded-2xl"
                                        />

                                        {isEditing && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setRemoveImage(true);
                                                    setImageFile(null);
                                                    setPreviewUrl("");
                                                }}
                                                className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-gray-900 shadow-md ring-1 ring-black/10 hover:bg-white active:scale-[0.98] transition"
                                            >
                                                <span className="text-sm leading-none">×</span>
                                                Remove
                                            </button>
                                        )}
                                    </>
                                ) : null}

                                {/* 3) Dropzone (only when editing AND image cleared) */}
                                {isEditing && !previewUrl && (removeImage || !imageUrl) ? (
                                    <div
                                        className={[
                                            "h-full w-full grid place-items-center rounded-2xl border-2 border-dashed transition",
                                            isDragging
                                                ? "border-yellow-300 bg-yellow-50/40"
                                                : "border-gray-200 bg-white/60 hover:border-gray-300",
                                        ].join(" ")}
                                        onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                                        onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }}
                                        onDrop={onDropFile}
                                    >
                                        <div className="flex flex-col items-center text-center px-6">
                                            <div className="text-sm font-semibold text-gray-900">
                                                Drag & drop your cover image here
                                            </div>

                                            <div className="mt-1 text-xs text-gray-500">
                                                PNG, JPG or WEBP • Max 10MB
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setRemoveImage(true);
                                                    pickImage();
                                                }}
                                                className="mt-3 rounded-xl bg-gray-200 px-5 py-2 text-sm font-semibold text-gray-900 hover:bg-yellow-400 shadow-sm hover:shadow active:scale-[0.98] transition"
                                            >
                                                Choose file
                                            </button>

                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const f = e.target.files?.[0] ?? null;
                                                    setIsDragging(false);
                                                    setImageFile(f);
                                                    setRemoveImage(true);
                                                }}
                                            />
                                        </div>
                                    </div>
                                ) : null}

                                {/* 4) Non-edit fallback when no image */}
                                {!isEditing && !imageUrl ? (
                                    <div className="grid h-full w-full place-items-center rounded-2xl border-2 border-dashed border-gray-200 bg-white/60">
                                        <div className="text-center">
                                            <p className="text-sm font-semibold text-gray-800">No photo added</p>
                                            <p className="mt-1 text-xs text-gray-500">Add one in edit mode</p>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </div>


                        {/* NOTES */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="text-base font-semibold tracking-tight text-gray-900">
                                Notes
                            </h2>

                            {!isEditing ? (
                                recipe.notes ? (
                                    <p className="mt-3 text-sm leading-relaxed text-gray-800">
                                        {recipe.notes}
                                    </p>
                                ) : (
                                    <p className="mt-3 text-sm text-gray-500">No notes added yet.</p>
                                )
                            ) : (
                                <input
                                    className={inputClass}
                                    type="text"
                                    placeholder="This recipe was amazing, would make again"
                                    value={draftNotes}
                                    onChange={(e) => setDraftNotes(e.target.value)}
                                />
                            )}
                        </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        {/* INGREDIENTS */}
                        <div>
                            <div className="flex items-baseline justify-between">
                                <h3 className="text-base font-semibold text-gray-900">Ingredients</h3>
                                <p className="text-xs text-gray-500">
                                    {(isEditing ? draftIngredients : ingredients).length} item
                                    {(isEditing ? draftIngredients : ingredients).length === 1 ? "" : "s"}
                                </p>
                            </div>

                            {!isEditing ? (
                                ingredients.length === 0 ? (
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
                                )
                            ) : (
                                <div className="mt-3">
                                    <div className="relative">
                                        <input
                                            className={`${inputClass} pr-12`}
                                            type="text"
                                            placeholder="1 egg"
                                            value={ingredientInput}
                                            onChange={(e) => setIngredientInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    addIngredient(e);
                                                }
                                            }}
                                        />

                                        <button
                                            type="button"
                                            onClick={addIngredient}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full text-gray-900 hover:bg-yellow-300"
                                            aria-label="Add ingredient"
                                            title="Add ingredient"
                                        >
                                            +
                                        </button>
                                    </div>

                                    {draftIngredients.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {draftIngredients.map((ingredient, index) => (
                                                <span
                                                    key={`${ingredient}-${index}`}
                                                    className={pillClass}
                                                    title="Click to remove ingredient"
                                                    onClick={() => removeIngredient(index)}
                                                    role="button"
                                                    tabIndex={0}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter" || e.key === " ")
                                                            removeIngredient(index);
                                                    }}
                                                >
                                                    {ingredient}
                                                    <span className={tooltip}>
                                                        Click to remove {ingredient}
                                                    </span>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="my-6 h-px w-full bg-gray-200" />

                        {/* STEPS */}
                        <div>
                            <div className="flex items-baseline justify-between">
                                <h3 className="text-base font-semibold text-gray-900">Steps</h3>
                                <p className="text-xs text-gray-500">
                                    {(isEditing ? draftSteps : steps).length} step
                                    {(isEditing ? draftSteps : steps).length === 1 ? "" : "s"}
                                </p>
                            </div>

                            {!isEditing ? (
                                steps.length === 0 ? (
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
                                )
                            ) : (
                                <div className="mt-3">
                                    <div className="relative">
                                        <input
                                            className={`${inputClass} pr-12`}
                                            type="text"
                                            placeholder="Add dry ingredients to a mixing bowl..."
                                            value={stepInput}
                                            onChange={(e) => setStepInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    addStep(e);
                                                }
                                            }}
                                        />

                                        <button
                                            type="button"
                                            onClick={addStep}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full text-gray-900 hover:bg-yellow-300"
                                            aria-label="Add step"
                                            title="Add step"
                                        >
                                            +
                                        </button>
                                    </div>

                                    {draftSteps.length > 0 && (
                                        <ol className="list-decimal w-full bg-gray-200 rounded-xl pl-8 pr-4 py-2 mt-2">
                                            {draftSteps.map((step, index) => (
                                                <li
                                                    key={`step-${index}`}
                                                    className="py-1.5 text-sm text-gray-900"
                                                >
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
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
