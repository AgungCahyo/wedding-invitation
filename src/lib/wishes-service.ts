import { supabase } from "./supabase";

export interface WishRecord {
  id: number;
  name: string;
  message: string;
  created_at: string;
}

/**
 * Save wish to Supabase
 */
export async function saveWish(name: string, message: string) {
  try {
    const { data, error } = await supabase
      .from("wishes")
      .insert({
        name: name.trim(),
        message: message.trim(),
      })
      .select();

    if (error) {
      console.error("Error saving wish:", error);
      throw new Error(error.message);
    }

    return { success: true, data: data[0] as WishRecord };
  } catch (error) {
    console.error("Failed to save wish:", error);
    throw error;
  }
}

/**
 * Fetch all wishes from Supabase
 */
export async function fetchWishes() {
  try {
    const { data, error } = await supabase
      .from("wishes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching wishes:", error);
      throw new Error(error.message);
    }

    return {
      success: true,
      data: (data as WishRecord[]).map((wish) => ({
        id: wish.id,
        name: wish.name,
        message: wish.message,
        date: wish.created_at.split("T")[0],
      })),
    };
  } catch (error) {
    console.error("Failed to fetch wishes:", error);
    throw error;
  }
}

/**
 * Get total wishes count
 */
export async function getWishesCount() {
  try {
    const { count, error } = await supabase
      .from("wishes")
      .select("*", { count: "exact", head: true });

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, count: count || 0 };
  } catch (error) {
    console.error("Failed to get wishes count:", error);
    throw error;
  }
}
