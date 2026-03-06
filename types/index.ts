export type GarmentCategory = "upper" | "lower" | "dress" | "overall" | "look"

export interface Garment {
  id: string
  name: string
  brand: string | null
  price: number | null
  category: GarmentCategory
  image_url: string
  product_url: string | null
  created_at: string
}

export interface Profile {
  id: string
  email: string | null
  name: string | null
  avatar_url: string | null
  created_at: string
}

export type TryOnStatus = "idle" | "uploading" | "processing" | "done" | "error"

export interface TryOnResult {
  id: string
  user_id: string
  person_image_url: string
  garment_id: string | null
  garment_image_url: string | null
  result_image_url: string
  is_favorite: boolean
  in_cart: boolean
  created_at: string
  garment?: Garment
}

export interface CartItem {
  id: string
  user_id: string
  garment_id: string
  tryon_result_id: string | null
  created_at: string
  garment?: Garment
  tryon_result?: TryOnResult
}

export interface TryOnRequest {
  person_image_url: string
  garment_image_url: string
  garment_id?: string
}

export interface TryOnResponse {
  result_image_url: string
  tryon_result_id: string
}
