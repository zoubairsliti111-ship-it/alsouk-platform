import { createClient } from "@/lib/supabase/client"

/** Whether `userId` has saved `productId` — used to hydrate a Save button's
 *  initial state from the real value instead of always starting unsaved. */
export async function isProductSaved(userId: string, productId: string): Promise<boolean> {
  const supabase = createClient()
  const { data } = await supabase
    .from("saved_products")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle()
  return Boolean(data)
}

export async function saveProduct(userId: string, productId: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase.from("saved_products").insert({ user_id: userId, product_id: productId })
  return !error
}

export async function unsaveProduct(userId: string, productId: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from("saved_products")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId)
  return !error
}
