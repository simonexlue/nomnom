import { supabase } from "./supabaseClient";

export async function getSignedImageUrl(path) {
    if(!path) return null;

    const {data, error} = await supabase.storage
        .from("recipe-images")
        .createSignedUrl(path, 60*60) // expires in 1 hr

    if(error) {
        console.log("Failed to create signed URL:", error.message)
        return null;
    }

    return data?.signedUrl ?? null
}