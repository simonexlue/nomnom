import { supabase } from "./supabaseClient";

export async function getRecipe( {slug, userId}) {
    const {data, error} = await supabase
        .from("recipes")
        .select("id, title, ingredients, steps, notes, tags, slug, created_at, image_path")
        .eq("slug", slug)
        .eq("user_id", userId)
        .single();

    if(error) {
        throw error
    }

    return data;
}

export async function getAllRecipes({userId}) {
    const {data, error} = await supabase
        .from("recipes")
        .select()
        .eq("user_id", userId)
        .order("created_at", {ascending: false})

    if (error) {
        throw error
    }

    return data;
}

export async function updateRecipe({ id, userId, updates }) {
  const { data, error } = await supabase
    .from("recipes")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .select("id, title, ingredients, steps, notes, tags, slug, created_at, image_path")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteRecipe({id, userId}) {
    const {error} = await supabase
        .from("recipes")
        .delete()
        .eq("id", id)
        .eq("user_id", userId)

    if(error) throw error;
    return true;
}