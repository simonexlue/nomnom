import { supabase } from "./supabaseClient";

export async function getCollection({id, userId}) {
    const {data, error} = await supabase
        .from("collections")
        .select("id, name, description, created_at, image_path")
        .eq("id", id)
        .eq("user_id", userId)
        .single()

    if(error) {
        throw error
    }
    return data;
}

export async function getAllCollections({userId}) {
    const {data, error} = await supabase
        .from("collections")
        .select("id, name, description, image_path")
        .eq("user_id", userId)
        .order("created_at", {ascending: false})

    if (error) {
        throw error
    }

    return data;
}

export async function createCollection({userId, name, description}) {
    const {data, error} = await supabase
        .from("collections")
        .insert({
            user_id: userId,
            name,
            description: description || null,
        })
        .select("id")
        .single()

    if(error) {
        throw new Error(error.message)
    }

    return data;
}

export async function updateCollection({ id, userId, updates }) {
  const { data, error } = await supabase
    .from("collections")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .select("id, name, description, created_at, image_path")
    .single();

  if (error) throw error;
  return data;
}

// join table helpers (collection_recipes)

export async function getRecipeCollectionIds({ userId, recipeId }) {
  const { data, error } = await supabase
    .from("collection_recipes")
    .select("collection_id")
    .eq("user_id", userId)
    .eq("recipe_id", recipeId);

  if (error) throw error;
  return (data ?? []).map((r) => r.collection_id);
}

export async function setRecipeCollections({ userId, recipeId, collectionIds }) {
  const next = Array.from(new Set(collectionIds ?? []));

  const { data: existingRows, error: existingErr } = await supabase
    .from("collection_recipes")
    .select("collection_id")
    .eq("user_id", userId)
    .eq("recipe_id", recipeId);

  if (existingErr) throw existingErr;

  const existing = new Set((existingRows ?? []).map((r) => r.collection_id));

  const toAdd = next.filter((id) => !existing.has(id));
  const toRemove = Array.from(existing).filter((id) => !next.includes(id));

  if (toRemove.length > 0) {
    const { error: delErr } = await supabase
      .from("collection_recipes")
      .delete()
      .eq("user_id", userId)
      .eq("recipe_id", recipeId)
      .in("collection_id", toRemove);

    if (delErr) throw delErr;
  }

  if (toAdd.length > 0) {
    const payload = toAdd.map((collection_id) => ({
      user_id: userId,
      recipe_id: recipeId,
      collection_id,
    }));

    const { error: insErr } = await supabase
      .from("collection_recipes")
      .insert(payload);

    if (insErr) throw insErr;
  }

  return true;
}