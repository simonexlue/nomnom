import { supabase } from "./supabaseClient";

export async function getAllCollections({userId}) {
    const {data, error} = await supabase
        .from("collections")
        .select()
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