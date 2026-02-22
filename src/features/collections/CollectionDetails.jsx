import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../app/AuthProvider";
import { supabase } from "../../lib/supabaseClient";
import { getCollection, updateCollection } from "../../lib/collections";
import { getSignedImageUrl } from "../../lib/storage";
import { RecipeCard } from "../../components/recipe/RecipeCard";

export default function CollectionDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [collection, setCollection] = useState(null);

    // current image (view mode + existing image)
    const [imageUrl, setImageUrl] = useState(null);

    // recipes in this collection
    const [recipes, setRecipes] = useState([]);
    const [recipesLoading, setRecipesLoading] = useState(true);

    // edit mode
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    // draft fields
    const [draftName, setDraftName] = useState("");
    const [draftDesc, setDraftDesc] = useState("");

    // image edit
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [removeImage, setRemoveImage] = useState(false);

    // delete
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        async function loadCollection() {
            try {
                setLoading(true);
                setError("");

                const data = await getCollection({
                    id,
                    userId: user.id,
                });

                setCollection(data);

                // seed drafts + reset image edit state
                setDraftName(data?.name ?? "");
                setDraftDesc(data?.description ?? "");
                setImageFile(null);
                setPreviewUrl("");
                setRemoveImage(false);
                setIsDragging(false);

                if (data?.image_path) {
                    const url = await getSignedImageUrl(data.image_path);
                    setImageUrl(url);
                } else {
                    setImageUrl(null);
                }
            } catch (err) {
                setError(err?.message || "Error fetching collection.");
                setCollection(null);
            } finally {
                setLoading(false);
            }
        }

        if (user?.id && id) loadCollection();
    }, [user?.id, id]);

    useEffect(() => {
        async function loadRecipes() {
            try {
                setRecipesLoading(true);

                // 1) get recipe_ids
                const { data: joinRows, error: joinErr } = await supabase
                    .from("collection_recipes")
                    .select("recipe_id")
                    .eq("user_id", user.id)
                    .eq("collection_id", id)
                    .order("added_at", { ascending: false });

                if (joinErr) throw joinErr;

                const recipeIds = (joinRows ?? []).map((r) => r.recipe_id);

                if (!recipeIds.length) {
                    setRecipes([]);
                    return;
                }

                // 2) fetch recipes
                const { data: recipesData, error: recipesErr } = await supabase
                    .from("recipes")
                    .select("id, title, slug, tags, image_path, updated_at")
                    .eq("user_id", user.id)
                    .in("id", recipeIds);

                if (recipesErr) throw recipesErr;

                // 3) preserve order from join table
                const byId = new Map((recipesData ?? []).map((r) => [r.id, r]));
                const ordered = recipeIds.map((rid) => byId.get(rid)).filter(Boolean);

                setRecipes(ordered);
            } catch (err) {
                console.log("loadRecipes error:", err?.message);
                setRecipes([]);
            } finally {
                setRecipesLoading(false);
            }
        }

        if (user?.id && id) loadRecipes();
    }, [user?.id, id]);

    useEffect(() => {
        if (!imageFile) {
            setPreviewUrl("");
            return;
        }

        const url = URL.createObjectURL(imageFile);
        setPreviewUrl(url);

        return () => URL.revokeObjectURL(url);
    }, [imageFile]);

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

    async function handleSave() {
        try {
            setSaving(true);
            setError("");

            const nextName = draftName.trim();
            if (!nextName) return;

            // 1) Update core fields
            const updated = await updateCollection({
                id: collection.id,
                userId: user.id,
                updates: {
                    name: nextName,
                    description: draftDesc.trim(),
                },
            });

            // 2) Handle image replacement/removal
            if (imageFile) {
                const allowed = ["image/jpeg", "image/png", "image/webp"];
                if (!allowed.includes(imageFile.type)) {
                    console.log("Only JPG, PNG, or WEBP allowed");
                    return;
                }

                const ext = getExtFromFile(imageFile);
                const filePath = `collections/${user.id}/${collection.id}/cover.${ext}`;

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

                if (collection.image_path && collection.image_path !== filePath) {
                    const { error: oldRemoveErr } = await supabase.storage
                        .from("recipe-images")
                        .remove([collection.image_path]);

                    if (oldRemoveErr) console.log("Failed to remove old image:", oldRemoveErr.message);
                }

                const updated2 = await updateCollection({
                    id: collection.id,
                    userId: user.id,
                    updates: { image_path: filePath },
                });

                setCollection(updated2);
                const signed = await getSignedImageUrl(filePath);
                setImageUrl(signed);
            } else if (removeImage && collection.image_path) {
                const { error: removeErr } = await supabase.storage
                    .from("recipe-images")
                    .remove([collection.image_path]);

                if (removeErr) console.log("Failed to remove image from storage:", removeErr.message);

                const updated2 = await updateCollection({
                    id: collection.id,
                    userId: user.id,
                    updates: { image_path: null },
                });

                setCollection(updated2);
                setImageUrl(null);
            } else {
                setCollection(updated);
            }

            // cleanup edit state
            setIsEditing(false);
            setImageFile(null);
            setPreviewUrl("");
            setRemoveImage(false);
            setIsDragging(false);
        } catch (err) {
            setError(err?.message || "Failed to save changes");
        } finally {
            setSaving(false);
        }
    }

    function handleCancel() {
        setDraftName(collection?.name ?? "");
        setDraftDesc(collection?.description ?? "");
        setIsEditing(false);
        setError("");

        setImageFile(null);
        setPreviewUrl("");
        setRemoveImage(false);
        setIsDragging(false);
    }

    async function handleDelete() {
        try {
            setDeleting(true);
            setError("");

            // 1) remove image from storage if it exists
            if (collection?.image_path) {
                const { error: removeErr } = await supabase.storage
                    .from("recipe-images")
                    .remove([collection.image_path]);

                if (removeErr) console.log("Failed to remove image:", removeErr.message);
            }

            // 2) delete join rows (collection_recipes)
            const { error: joinErr } = await supabase
                .from("collection_recipes")
                .delete()
                .eq("user_id", user.id)
                .eq("collection_id", collection.id);

            if (joinErr) console.log("Failed to remove join rows:", joinErr.message);

            // 3) delete the collection row
            const { error: colErr } = await supabase
                .from("collections")
                .delete()
                .eq("user_id", user.id)
                .eq("id", collection.id);

            if (colErr) throw colErr;

            navigate("/collections");
        } catch (err) {
            console.log(err?.message);
            setError(err?.message || "Failed to delete collection.");
        } finally {
            setDeleting(false);
            setShowDeleteConfirm(false);
        }
    }

    if (loading) return null;
    if (!collection) return <div>Collection not found.</div>;

    const inputClass =
        "w-full rounded-xl bg-gray-100 mt-2 mb-2 px-4 py-2.5 outline-none ring-2 ring-transparent focus:ring-yellow-300";

    const topBoxH = "h-[320px] sm:h-[360px] md:h-[380px] lg:h-[420px]";

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="sticky top-0 z-20 space-y-3 mb-4 bg-[#f4efe4] pb-4 px-1">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        {!isEditing ? (
                            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 break-words">
                                {collection.name}
                            </h1>
                        ) : (
                            <div>
                                <div className="text-xs font-medium text-gray-500">Collection Name</div>
                                <input
                                    className={inputClass}
                                    type="text"
                                    value={draftName}
                                    onChange={(e) => setDraftName(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        <div className="mt-2 h-1 w-10 rounded-full bg-yellow-400" />
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                        {!isEditing ? (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                    className="rounded-xl bg-yellow-300 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-yellow-400 active:scale-[0.98] transition"
                                >
                                    Edit
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="rounded-xl bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-300 transition"
                                >
                                    Delete
                                </button>
                            </>
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
                                    onClick={handleCancel}
                                    className="rounded-xl bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-200 disabled:opacity-60 active:scale-[0.98] transition"
                                >
                                    Cancel
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* TOP LAYOUT */}
            {/* <md: single col; md+: 2 cols; xl+: right column becomes recipes */}
            <div className="space-y-8">
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-[2fr_3fr] items-start">
                    {/* LEFT COLUMN */}
                    <div className="space-y-6">
                        {/* IMAGE */}
                        <div
                            className={[
                                "relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-b from-gray-50 to-gray-100 shadow-sm",
                                isEditing && (removeImage || !imageUrl) && !previewUrl ? "border-dashed" : "",
                                "p-0",
                            ].join(" ")}
                        >
                            <div className={["relative w-full", topBoxH].join(" ")}>
                                {/* Preview */}
                                {isEditing && previewUrl ? (
                                    <>
                                        <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" loading="lazy" />

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

                                {/* Existing image */}
                                {!previewUrl && imageUrl && (!isEditing || (isEditing && !removeImage)) ? (
                                    <>
                                        <img
                                            src={imageUrl}
                                            alt={collection.name || "Collection cover"}
                                            className="h-full w-full object-cover"
                                            loading="lazy"
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

                                {/* Dropzone */}
                                {isEditing && !previewUrl && (removeImage || !imageUrl) ? (
                                    <div
                                        className={[
                                            "h-full w-full grid place-items-center border-2 border-dashed transition",
                                            isDragging ? "border-yellow-300 bg-yellow-50/40" : "border-gray-200 bg-white/60 hover:border-gray-300",
                                        ].join(" ")}
                                        onDragEnter={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setIsDragging(true);
                                        }}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setIsDragging(true);
                                        }}
                                        onDragLeave={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setIsDragging(false);
                                        }}
                                        onDrop={onDropFile}
                                    >
                                        <div className="flex flex-col items-center text-center px-6">
                                            <div className="text-sm font-semibold text-gray-900">Drag & drop your cover image here</div>

                                            <div className="mt-1 text-xs text-gray-500">PNG, JPG or WEBP • Max 10MB</div>

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

                                {/* View fallback */}
                                {!isEditing && !imageUrl ? (
                                    <div className="grid h-full w-full place-items-center border-2 border-dashed border-gray-200 bg-white/60">
                                        <div className="text-center">
                                            <p className="text-sm font-semibold text-gray-800">No photo added</p>
                                            <p className="mt-1 text-xs text-gray-500">Add one in edit mode</p>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        {/* XL+: description moves UNDER the image */}
                        <div className="hidden xl:block">
                            <DescriptionCard
                                collection={collection}
                                isEditing={isEditing}
                                draftDesc={draftDesc}
                                setDraftDesc={setDraftDesc}
                                error={error}
                                inputClass={inputClass}
                            />
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="space-y-6">
                        {/* md/lg: description sits to the right and MATCHES height */}
                        <div className="xl:hidden">
                            <DescriptionCard
                                className={topBoxH + " overflow-hidden"}
                                collection={collection}
                                isEditing={isEditing}
                                draftDesc={draftDesc}
                                setDraftDesc={setDraftDesc}
                                error={error}
                                inputClass={inputClass}
                            />
                        </div>

                        {/* xl+: right side reserved for recipes */}
                        <div className="hidden xl:block">
                            <RecipesSection recipes={recipes} recipesLoading={recipesLoading} />
                        </div>
                    </div>
                </div>

                {/* <xl: recipes go BELOW the top area */}
                <div className="xl:hidden">
                    <RecipesSection recipes={recipes} recipesLoading={recipesLoading} />
                </div>
            </div>

            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <h3 className="text-lg font-semibold text-gray-900">Delete collection?</h3>

                        <p className="mt-2 text-sm text-gray-600">
                            This will permanently delete <span className="font-semibold">{collection.name}</span>.
                            <span className="font-semibold text-gray-900"> This cannot be undone.</span>
                        </p>

                        <div className="mt-6 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                disabled={deleting}
                                onClick={() => setShowDeleteConfirm(false)}
                                className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-200 disabled:opacity-60 transition"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={deleting}
                                onClick={handleDelete}
                                className="rounded-xl bg-yellow-300 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-yellow-400 active:scale-[0.98] transition disabled:opacity-60"
                            >
                                {deleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function DescriptionCard({
    collection,
    isEditing,
    draftDesc,
    setDraftDesc,
    error,
    inputClass,
    className = "",
}) {
    return (
        <div className={["rounded-2xl border border-gray-200 bg-white shadow-sm p-6", className].join(" ")}>
            <div className="flex items-baseline justify-between">
                <h3 className="text-base font-semibold text-gray-900">Description</h3>
                <p className="text-xs text-gray-500">{collection?.description ? "Added" : "None"}</p>
            </div>

            {!isEditing ? (
                collection?.description ? (
                    <p className="mt-3 text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">{collection.description}</p>
                ) : (
                    <p className="mt-3 text-sm text-gray-500">
                        Add a short description to remember what this collection is for.
                    </p>
                )
            ) : (
                <div className="mt-3">
                    <div className="text-xs font-medium text-gray-500">Collection Description</div>
                    <textarea
                        value={draftDesc}
                        onChange={(e) => setDraftDesc(e.target.value)}
                        rows={10}
                        className={[inputClass, "resize-none h-[240px] sm:h-[260px] md:h-[280px] lg:h-[320px]"].join(" ")}
                        placeholder="ex. Chicken broth base, quick soups, meal prep..."
                    />
                </div>
            )}

            {error ? (
                <div className="mt-4 rounded-2xl bg-red-50 p-4 ring-1 ring-red-200">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            ) : null}
        </div>
    );
}

function RecipesSection({ recipes, recipesLoading, className = "" }) {
    return (
        <div className={className}>
            <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-semibold tracking-tight text-gray-900">Recipes in this collection</h2>
                <span className="text-xs text-gray-500">{recipesLoading ? "…" : `${recipes.length} total`}</span>
            </div>

            <div className="mt-2 h-1 w-10 rounded-full bg-yellow-400" />

            {recipesLoading ? (
                <p className="mt-4 text-sm text-gray-500">Loading recipes...</p>
            ) : recipes.length === 0 ? (
                <p className="mt-4 text-sm text-gray-500">No recipes in this collection yet.</p>
            ) : (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {recipes.map((r) => (
                        <div key={r.id} className="max-w-[170px]">
                            <RecipeCard recipe={r} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}