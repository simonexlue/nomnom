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