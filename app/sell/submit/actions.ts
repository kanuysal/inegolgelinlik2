'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { listingSchema } from '@/lib/validators/listing'
import { GOWN_CATALOG } from '@/lib/catalog'
import { SIZE_DATABASE } from '@/lib/sizes'

// Helper: get an untyped supabase client (DB types don't match runtime schema)
async function getSupabase() {
  return await createClient() as any
}

export async function searchProducts(query: string) {
  try {
    const lowercaseQuery = query.toLowerCase()

    // Search in local catalog first
    const filteredCatalog = GOWN_CATALOG.filter(gown =>
      gown.name.toLowerCase().includes(lowercaseQuery) ||
      gown.silhouette.toLowerCase().includes(lowercaseQuery)
    ).map(gown => ({
      id: gown.id,
      style_name: gown.name,
      sku: null,
      category: gown.collection === 'Evening' ? 'evening' : 'bridal',
      silhouette: gown.silhouette,
      train_style: null,
      msrp: parseInt(gown.msrp_range.split('-')[1].replace(/[^0-9]/g, '')),
      images: gown.images
    }))

    const supabase = await getSupabase()
    const { data, error } = await supabase
      .from('products')
      .select('id, style_name, sku, category, silhouette, train_style, msrp, images')
      .or(`style_name.ilike.%${query}%,sku.ilike.%${query}%`)
      .limit(10)

    // Merge results, prioritizing catalog matches
    const dbProducts = data || []
    const combined = [...filteredCatalog, ...dbProducts.filter((p: any) => !filteredCatalog.find(c => c.style_name === p.style_name))]

    return { products: combined.slice(0, 10), error: error?.message || null }
  } catch (err: any) {
    console.error('Search products crash:', err)
    return { products: [], error: 'Search failed' }
  }
}

export async function getCatalogGowns() {
  // Return the master catalog directly
  return { gowns: GOWN_CATALOG, error: null }
}

export async function getSizeDimensions(sizeLabel: string) {
  const localSize = SIZE_DATABASE.find(s => s.label === sizeLabel)
  if (localSize) {
    return {
      dimensions: {
        bust: localSize.bust_cm,
        waist: localSize.waist_cm,
        hips: localSize.hips_cm,
        height_with_shoes: 175 // Default couture height
      },
      error: null
    }
  }

  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('universal_sizes')
    .select('bust, waist, hips, height_with_shoes')
    .eq('size_label', sizeLabel)
    .single()

  if (error) return { dimensions: null, error: error.message }
  return { dimensions: data, error: null }
}

export async function submitListing(formData: {
  title: string
  description?: string
  category: 'bridal' | 'evening' | 'accessories'
  condition: 'new_unworn' | 'excellent' | 'good'
  size_us?: string
  bust_cm?: number | null
  waist_cm?: number | null
  hips_cm?: number | null
  height_cm?: number | null
  silhouette?: string | null
  train_style?: string | null
  price: number
  msrp?: number | null
  product_id?: string | null
  images: string[]
}) {
  const user = await requireAuth()
  const supabase = await getSupabase()

  // Validate with Zod
  const result = listingSchema.safeParse({
    ...formData,
    listing_type: 'peer_to_peer',
  })

  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  // Insert listing
  const { data, error } = await supabase
    .from('listings')
    .insert({
      seller_id: user.id,
      title: result.data.title,
      description: result.data.description || null,
      category: result.data.category,
      condition: result.data.condition,
      listing_type: result.data.listing_type,
      size_us: result.data.size_us || null,
      bust_cm: result.data.bust_cm ?? null,
      waist_cm: result.data.waist_cm ?? null,
      hips_cm: result.data.hips_cm ?? null,
      height_cm: result.data.height_cm ?? null,
      silhouette: result.data.silhouette ?? null,
      train_style: result.data.train_style ?? null,
      price: result.data.price,
      msrp: result.data.msrp ?? null,
      product_id: result.data.product_id ?? null,
      images: formData.images || [],
      status: 'pending_review',
    })
    .select('id')
    .single()

  if (error) {
    console.error('Listing insert error:', error)
    return { error: 'Failed to submit listing. Please try again.' }
  }

  return { success: true, listingId: data.id }
}

export async function uploadListingImage(formData: FormData) {
  const user = await requireAuth()
  const supabase = await getSupabase()

  const file = formData.get('file') as File
  if (!file) return { error: 'No file provided' }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return { error: 'Only JPEG, PNG, and WebP images are allowed' }
  }

  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { error: 'Image must be under 5MB' }
  }

  const ext = file.name.split('.').pop() || 'jpg'
  const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { data, error } = await supabase.storage
    .from('listing-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('Upload error:', error)
    return { error: 'Failed to upload image' }
  }

  const { data: { publicUrl } } = supabase.storage
    .from('listing-images')
    .getPublicUrl(data.path)

  return { url: publicUrl, path: data.path, error: null }
}

export async function removeListingImage(path: string) {
  const user = await requireAuth()
  const supabase = await getSupabase()

  // Security: ensure the path belongs to the user
  if (!path.startsWith(`${user.id}/`)) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase.storage
    .from('listing-images')
    .remove([path])

  if (error) {
    return { error: 'Failed to remove image' }
  }

  return { success: true }
}
