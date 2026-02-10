import { supabase } from "./supabaseClient";

export async function getRecipe( {slug, userId}) {
    const {data, error} = await supabase
        .from("recipes")
        .select("id, title, ingredients, steps, notes, tags, slug, created_at")
        .eq("slug", slug)
        .eq("user_id", userId)
        .single();

    if(error) {
        throw error
    }

    return data;
}