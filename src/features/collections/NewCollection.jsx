import { useAuth } from "../../app/AuthProvider";
import { useState, useRef, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { createCollection } from "../../lib/collections";

export default function NewCollection() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    //Image stuff
    const [imageFile, setImageFile] = useState(null);

    const fileInputRef = useRef(null)
    const [isDragging, setIsDragging] = useState(false)
    const [previewUrl, setPreviewUrl] = useState("")

    const user_id = useAuth().user.id
    const navigate = useNavigate();

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

        try {
            const { data: created, error } = await supabase
                .from("collections")
                .insert({ user_id, name, description: description || null })
                .select("id")
                .single()

            if (error) {
                console.log("Create collection failed:", error.message)
                return;
            }

            // upload optional cover image
            if (imageFile) {
                const allowed = ["image/jpeg", "image/png", "image/webp"]
                if (!allowed.includes(imageFile.type)) {
                    console.log("Only JPG, PNG, or WEBP allowed")
                    return;
                }

                const ext = getExtFromFile(imageFile)
                const filePath = `collections/${user_id}/${created.id}/cover.${ext}`

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
                    .from("collections")
                    .update({ image_path: filePath })
                    .eq("id", created.id)

                if (updateError) {
                    console.log("Failed to save image_path:", updateError.message)
                    return;
                }
            }

            navigate("/collections")
        } catch (error) {
            console.log("Create collection failed:", error.message)
        }
    }

    const inputClass =
        "w-full rounded-xl bg-gray-100 mt-2 mb-2 px-4 py-2.5 outline-none ring-2 ring-transparent focus:ring-yellow-300";

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-gray-900">New Collection</h1>
                <div className="mt-2 h-1 w-10 rounded-full bg-yellow-400" />
            </div>

            {/* FORM */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* collections.name */}
                    <div className="space-y-1">
                        <span className="text-xs font-medium text-gray-500">Collection Name</span>
                        <input
                            className={inputClass}
                            type="text"
                            placeholder="Weeknight Dinners"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    {/* collections.description */}
                    <div className="space-y-1">
                        <span className="text-xs font-medium text-gray-500">Description (optional)</span>
                        <textarea
                            className={`${inputClass} min-h-[110px] resize-none`}
                            placeholder="Quick meals I can make after work..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    {/* Cover Image (optional) */}
                    <div className="space-y-1">
                        <span className="text-xs font-medium text-gray-500">Cover Image (optional)</span>

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
                                <div className="mt-2 text-sm font-medium text-gray-900">
                                    Drag & drop your cover image here
                                </div>

                                <div className="mt-1 text-xs text-gray-500">
                                    PNG, JPG or WEBP • Max 10MB
                                </div>

                                <button
                                    type="button"
                                    onClick={pickImage}
                                    className="mt-3 rounded-xl bg-gray-200 px-5 py-2 text-sm font-semibold text-gray-900 hover:bg-yellow-400 shadow-sm hover:shadow active:scale-[0.98] transition"
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
                                <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl bg-gray-100 p-4">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="h-16 w-24 overflow-hidden rounded-xl bg-gray-200">
                                            {previewUrl ? (
                                                <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
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

                    {/* PREVIEW */}
                    <div className="rounded-2xl bg-gray-100 p-4 ring-1 ring-black/5">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-gray-900">Preview</p>
                                <p className="mt-1 text-xs text-gray-500">
                                    This is how your collection will look.
                                </p>
                            </div>

                            <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-gray-700 ring-1 ring-black/5">
                                0 recipes
                            </span>
                        </div>

                        <div className="mt-4 grid gap-4 sm:grid-cols-[160px_1fr]">
                            {/* Cover preview */}
                            <div className="aspect-[3/2] w-full overflow-hidden rounded-2xl bg-white/60 ring-1 ring-black/5">
                                {previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        alt="Cover preview"
                                        className="h-full w-full object-cover object-center block"
                                    />
                                ) : (
                                    <div className="h-full w-full grid place-items-center text-center">
                                        <div className="mx-auto grid h-10 w-10 place-items-center rounded-2xl bg-gray-200">
                                            <span className="text-lg">📚</span>
                                        </div>
                                        <p className="text-xs font-medium text-gray-600">No cover yet</p>
                                    </div>
                                )}
                            </div>

                            {/* Text preview */}
                            <div className="min-w-0">
                                <p className="text-base font-semibold text-gray-900 line-clamp-2">
                                    {name ? name : "Collection name"}
                                </p>

                                <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                                    {description
                                        ? description
                                        : "Add a short description like “easy weeknight meals” or “high protein lunches”."}
                                </p>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-gray-900">
                                        meal prep
                                    </span>
                                    <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-gray-900">
                                        quick
                                    </span>
                                    <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-gray-900">
                                        favorites
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Submit */}
                    <button
                        className="w-full rounded-xl bg-yellow-300 py-2.5 font-semibold text-gray-900 hover:bg-yellow-400"
                        type="submit"
                    >
                        Create Collection
                    </button>
                </form>
            </div>
        </div>
    )
}