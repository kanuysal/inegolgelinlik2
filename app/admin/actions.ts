'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { requireAuth, hasRole } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

async function db() {
  return (await createClient()) as any
}

async function adminDb() {
  return (await createAdminClient()) as any
}

async function requireAdminRole() {
  const user = await requireAuth()
  const isAdmin = await hasRole(user.id, 'admin')
  if (!isAdmin) throw new Error('Unauthorized: admin role required')
  return user
}

async function requireModRole() {
  const user = await requireAuth()
  const isMod = await hasRole(user.id, 'moderator')
  if (!isMod) throw new Error('Unauthorized: moderator role required')
  return user
}

// ── Dashboard Stats ──────────────────────────────────
export async function getAdminStats() {
  await requireModRole()
  const supabase = await db()

  const [listings, pendingListings, orders, users] = await Promise.all([
    supabase.from('listings').select('id', { count: 'exact', head: true }),
    supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'pending_review'),
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
  ])

  return {
    totalListings: listings.count || 0,
    pendingReview: pendingListings.count || 0,
    totalOrders: orders.count || 0,
    totalUsers: users.count || 0,
  }
}

// ── Listing Moderation ───────────────────────────────
export async function getPendingListings() {
  await requireModRole()
  const supabase = await db()

  const { data } = await supabase
    .from('listings')
    .select('*, profiles(display_name, full_name)')
    .eq('status', 'pending_review')
    .order('created_at', { ascending: true })

  return data || []
}

export async function getAllListings(statusFilter?: string) {
  await requireModRole()
  const supabase = await db()

  let query = supabase
    .from('listings')
    .select('*, profiles(display_name, full_name)')
    .order('created_at', { ascending: false })
    .limit(100)

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter)
  }

  const { data } = await query
  return data || []
}

export async function approveListing(listingId: string) {
  const user = await requireModRole()
  const supabase = await db()

  const { error } = await supabase
    .from('listings')
    .update({ status: 'approved', updated_at: new Date().toISOString() })
    .eq('id', listingId)
    .eq('status', 'pending_review')

  if (error) return { error: error.message }

  // Log the action
  await supabase.from('listing_approval_log').insert({
    listing_id: listingId,
    admin_id: user.id,
    action: 'approved',
  })

  // Notify seller
  const { data: listing } = await supabase
    .from('listings')
    .select('seller_id, title')
    .eq('id', listingId)
    .single()

  if (listing) {
    await supabase.from('notifications').insert({
      user_id: listing.seller_id,
      type: 'listing_approved',
      title: 'Listing Approved',
      message: `Your listing "${listing.title}" has been approved and is now live!`,
      link: `/shop/${listingId}`,
    })
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function rejectListing(listingId: string, reason: string) {
  const user = await requireModRole()
  const supabase = await db()

  if (!reason.trim()) return { error: 'Rejection reason is required' }

  const { error } = await supabase
    .from('listings')
    .update({
      status: 'rejected',
      rejection_reason: reason.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', listingId)
    .eq('status', 'pending_review')

  if (error) return { error: error.message }

  await supabase.from('listing_approval_log').insert({
    listing_id: listingId,
    admin_id: user.id,
    action: 'rejected',
    reason: reason.trim(),
  })

  const { data: listing } = await supabase
    .from('listings')
    .select('seller_id, title')
    .eq('id', listingId)
    .single()

  if (listing) {
    await supabase.from('notifications').insert({
      user_id: listing.seller_id,
      type: 'listing_rejected',
      title: 'Listing Needs Changes',
      message: `Your listing "${listing.title}" was not approved. Reason: ${reason.trim()}`,
      link: '/dashboard',
    })
  }

  revalidatePath('/admin')
  return { success: true }
}

// ── User Management ──────────────────────────────────
export async function getUsers() {
  await requireAdminRole()
  const supabase = await adminDb()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  const { data: roles } = await supabase
    .from('user_roles')
    .select('user_id, role')

  // Merge roles into profiles
  const userMap = new Map<string, string[]>()
  roles?.forEach((r: any) => {
    if (!userMap.has(r.user_id)) userMap.set(r.user_id, [])
    userMap.get(r.user_id)!.push(r.role)
  })

  return (profiles || []).map((p: any) => ({
    ...p,
    roles: userMap.get(p.id) || ['user'],
  }))
}

export async function setUserRole(userId: string, role: 'user' | 'moderator' | 'admin') {
  const admin = await requireAdminRole()
  const supabase = await adminDb()

  // Remove existing roles
  await supabase.from('user_roles').delete().eq('user_id', userId)

  // Add new role (unless it's just 'user', which is the default)
  if (role !== 'user') {
    await supabase.from('user_roles').insert({
      user_id: userId,
      role,
      granted_by: admin.id,
    })
  }

  revalidatePath('/admin')
  return { success: true }
}

// ── Product Catalog Management ───────────────────────
export async function getProducts() {
  await requireModRole()
  const supabase = await db()

  const { data } = await supabase
    .from('products')
    .select('*')
    .order('style_name', { ascending: true })

  return data || []
}

export async function createProduct(formData: FormData) {
  await requireAdminRole()
  const supabase = await adminDb()

  const { error } = await supabase.from('products').insert({
    style_name: formData.get('style_name') as string,
    sku: (formData.get('sku') as string) || null,
    category: formData.get('category') as string,
    silhouette: (formData.get('silhouette') as string) || null,
    train_style: (formData.get('train_style') as string) || null,
    msrp: formData.get('msrp') ? Number(formData.get('msrp')) : null,
    description: (formData.get('description') as string) || null,
  })

  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

export async function updateProduct(productId: string, formData: FormData) {
  await requireAdminRole()
  const supabase = await adminDb()

  const updates: Record<string, any> = {
    style_name: formData.get('style_name') as string,
    category: formData.get('category') as string,
    sku: (formData.get('sku') as string) || null,
    silhouette: (formData.get('silhouette') as string) || null,
    train_style: (formData.get('train_style') as string) || null,
    msrp: formData.get('msrp') ? Number(formData.get('msrp')) : null,
    description: (formData.get('description') as string) || null,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', productId)

  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

export async function deleteProduct(productId: string) {
  await requireAdminRole()
  const supabase = await adminDb()

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)

  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

export async function toggleProductActive(productId: string, isActive: boolean) {
  await requireAdminRole()
  const supabase = await adminDb()

  const { error } = await supabase
    .from('products')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', productId)

  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

export async function uploadProductImage(productId: string, formData: FormData) {
  await requireAdminRole()
  const supabase = await adminDb()

  const file = formData.get('file') as File
  if (!file) return { error: 'No file provided' }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return { error: 'Only JPEG, PNG, and WebP images are allowed' }
  }

  if (file.size > 5 * 1024 * 1024) {
    return { error: 'Image must be under 5MB' }
  }

  const ext = file.name.split('.').pop() || 'jpg'
  const fileName = `products/${productId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { data, error } = await supabase.storage
    .from('listing-images')
    .upload(fileName, file, { cacheControl: '3600', upsert: false })

  if (error) return { error: 'Failed to upload image' }

  const { data: { publicUrl } } = supabase.storage
    .from('listing-images')
    .getPublicUrl(data.path)

  // Append to product images array
  const { data: product } = await supabase
    .from('products')
    .select('images')
    .eq('id', productId)
    .single()

  const currentImages = product?.images || []
  const { error: updateError } = await supabase
    .from('products')
    .update({
      images: [...currentImages, publicUrl],
      updated_at: new Date().toISOString(),
    })
    .eq('id', productId)

  if (updateError) return { error: updateError.message }

  revalidatePath('/admin')
  return { success: true, url: publicUrl }
}

export async function removeProductImage(productId: string, imageUrl: string) {
  await requireAdminRole()
  const supabase = await adminDb()

  // Remove from product images array
  const { data: product } = await supabase
    .from('products')
    .select('images')
    .eq('id', productId)
    .single()

  const currentImages: string[] = product?.images || []
  const updatedImages = currentImages.filter((img: string) => img !== imageUrl)

  const { error } = await supabase
    .from('products')
    .update({
      images: updatedImages,
      updated_at: new Date().toISOString(),
    })
    .eq('id', productId)

  if (error) return { error: error.message }

  // Try to remove from storage (best-effort, URL might be external)
  try {
    const url = new URL(imageUrl)
    const storagePath = url.pathname.split('/listing-images/')[1]
    if (storagePath) {
      await supabase.storage.from('listing-images').remove([decodeURIComponent(storagePath)])
    }
  } catch { /* external URL, skip */ }

  revalidatePath('/admin')
  return { success: true }
}

export async function addProductImageUrl(productId: string, imageUrl: string) {
  await requireAdminRole()
  const supabase = await adminDb()

  const { data: product } = await supabase
    .from('products')
    .select('images')
    .eq('id', productId)
    .single()

  const currentImages: string[] = product?.images || []

  const { error } = await supabase
    .from('products')
    .update({
      images: [...currentImages, imageUrl],
      updated_at: new Date().toISOString(),
    })
    .eq('id', productId)

  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

export async function bulkImportCatalog() {
  await requireAdminRole()
  const supabase = await adminDb()

  // Import from static catalog
  const { GOWN_CATALOG } = await import('@/lib/catalog')

  // Map catalog collection to DB category enum
  const collectionToCategory = (collection: string): 'bridal' | 'evening' | 'accessories' => {
    if (collection === 'Evening') return 'evening'
    if (collection === 'Accessories') return 'accessories'
    return 'bridal'
  }

  // Map catalog silhouette to DB enum
  const silhouetteMap: Record<string, string> = {
    'Mermaid': 'mermaid',
    'A-Line': 'a_line',
    'Ball Gown': 'ball_gown',
    'Sheath': 'sheath',
    'Fit & Flare': 'fit_and_flare',
    'Trumpet': 'trumpet',
    'Empire': 'empire',
    'Column': 'column',
  }

  // Get existing products to avoid duplicates
  const { data: existing } = await supabase.from('products').select('style_name')
  const existingNames = new Set((existing || []).map((p: any) => p.style_name.toLowerCase()))

  const newProducts = GOWN_CATALOG
    .filter(g => !existingNames.has(g.name.toLowerCase()))
    .map(g => ({
      style_name: g.name,
      category: collectionToCategory(g.collection),
      silhouette: silhouetteMap[g.silhouette] || null,
      description: g.description || null,
      images: g.images.length > 0 ? g.images : '{}',
      msrp: null,
      is_active: true,
    }))

  if (newProducts.length === 0) {
    return { success: true, imported: 0, message: 'All products already exist' }
  }

  // Insert in batches of 50
  let imported = 0
  for (let i = 0; i < newProducts.length; i += 50) {
    const batch = newProducts.slice(i, i + 50)
    const { error } = await supabase.from('products').insert(batch)
    if (error) return { error: error.message, imported }
    imported += batch.length
  }

  revalidatePath('/admin')
  return { success: true, imported }
}

// ── Claims / Disputes ────────────────────────────────
export async function getClaims() {
  await requireModRole()
  const supabase = await db()

  const { data } = await supabase
    .from('claims')
    .select('*, orders(listing_id, total, listings(title))')
    .order('created_at', { ascending: false })

  return data || []
}

export async function resolveClaim(claimId: string, notes: string) {
  const user = await requireModRole()
  const supabase = await db()

  const { error } = await supabase
    .from('claims')
    .update({
      status: 'resolved',
      resolution_notes: notes,
      resolved_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', claimId)

  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}
