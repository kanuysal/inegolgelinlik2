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

  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('status', 'pending_review')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('getPendingListings error:', error)
    return []
  }

  // Fetch profiles separately to avoid join issues
  if (data && data.length > 0) {
    const sellerIds = Array.from(new Set(data.map((l: any) => l.seller_id)))
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, full_name')
      .in('id', sellerIds)

    const profileMap = new Map(profiles?.map((p: any) => [p.id, p]) || [])

    return data.map((listing: any) => ({
      ...listing,
      profiles: profileMap.get(listing.seller_id) || null,
    }))
  }

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
      images: g.images.length > 0 ? g.images : [],
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

export async function syncCatalogImages() {
  await requireAdminRole()
  const supabase = await adminDb()

  const { GOWN_CATALOG } = await import('@/lib/catalog')

  // Get all existing products
  const { data: products } = await supabase.from('products').select('id, style_name, images, description')
  if (!products) return { error: 'Failed to fetch products' }

  // Build lookup from catalog name -> {images, description}
  const catalogMap = new Map<string, { images: string[], description: string }>()
  for (const g of GOWN_CATALOG) {
    catalogMap.set(g.name.toLowerCase(), { images: g.images, description: g.description })
  }

  let updated = 0
  let skipped = 0

  for (const product of products) {
    const catalogEntry = catalogMap.get(product.style_name.toLowerCase())
    if (!catalogEntry) {
      skipped++
      continue
    }
    const catalogImages = catalogEntry.images

    // Build update payload
    const updates: Record<string, any> = { updated_at: new Date().toISOString() }

    // Sync images if catalog has more
    const rawImages = product.images
    const currentImages: string[] = Array.isArray(rawImages) ? rawImages.filter((u: string) => u && u.startsWith('http')) : []
    if (catalogImages.length > currentImages.length) {
      updates.images = catalogImages
    }

    // Sync description if catalog has one and product doesn't
    const catalogDesc = catalogEntry.description
    if (catalogDesc && (!product.description || product.description.length < catalogDesc.length)) {
      updates.description = catalogDesc
    }

    if (Object.keys(updates).length <= 1) {
      skipped++
      continue
    }

    const { error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', product.id)

    if (!error) updated++
    else skipped++
  }

  revalidatePath('/admin')
  return { success: true, updated, skipped }
}

// ── Stockist Sync (page-by-page for Vercel timeout) ──

const STOCKIST_SILHOUETTE_MAP: Record<string, string> = {
  'Ballgown': 'ball_gown', 'Mermaid': 'mermaid', 'A-line': 'a_line', 'A-Line': 'a_line',
  'Sheath': 'sheath', 'Fit & Flare': 'fit_and_flare', 'Trumpet': 'trumpet',
  'Empire': 'empire', 'Column': 'column', 'Mini': 'sheath',
}

const STOCKIST_TRAIN_MAP: Record<string, string> = {
  'Cathedral': 'cathedral', 'Chapel': 'chapel', 'Court': 'court',
  'Sweep': 'sweep', 'Royal': 'royal', 'None': 'none',
}

function stockistCategory(lineName: string): 'bridal' | 'evening' | 'accessories' {
  if (lineName.includes('Evening') || lineName.includes('Luxury') || lineName.includes('Design')) return 'evening'
  return 'bridal'
}

/**
 * Step 1: Login to stockist, check DB columns, return session info.
 */
export async function syncStockistInit() {
  await requireAdminRole()
  const supabase = await adminDb()

  // Check columns exist
  const { error: colCheck } = await supabase.from('products').select('stockist_id').limit(1)
  if (colCheck?.message?.includes('does not exist')) {
    return {
      error: 'Missing database columns. Run this SQL in Supabase Dashboard > SQL Editor:\n\nALTER TABLE products ADD COLUMN IF NOT EXISTS stockist_id integer UNIQUE;\nALTER TABLE products ADD COLUMN IF NOT EXISTS stockist_data jsonb DEFAULT \'{}\';'
    }
  }

  // Login to stockist
  const { loginToStockist } = await import('@/lib/stockist')
  try {
    const { cookies, version } = await loginToStockist()
    if (!cookies || cookies.length < 10) {
      return { error: 'Login failed: no session cookies received' }
    }
    return { success: true, cookies, version }
  } catch (e: any) {
    return { error: `Stockist login failed: ${e.message}` }
  }
}

/**
 * Step 2: Fetch one page of products and upsert dresses into Supabase.
 * Returns { created, updated, errors, lastPage, dressCount }.
 */
export async function syncStockistPage(page: number, cookies: string, version: string) {
  await requireAdminRole()
  const supabase = await adminDb()
  const { groupHashtags } = await import('@/lib/stockist')

  const STOCKIST_BASE = 'https://stockist.galialahav.com'
  const DRESS_TYPES = new Set(['wedding_dress', 'evening_dress'])

  // Fetch one page
  const url = `${STOCKIST_BASE}/our-products?price_type=retail_sale_price&page=${page}`
  const res = await fetch(url, {
    headers: {
      'X-Inertia': 'true',
      'X-Inertia-Version': version,
      'X-Requested-With': 'XMLHttpRequest',
      Cookie: cookies,
    },
  })

  const text = await res.text()
  let json: any
  try {
    json = JSON.parse(text)
  } catch {
    const m = text.match(/data-page="([^"]+)"/)
    if (m) {
      const raw = m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&')
      json = JSON.parse(raw)
    } else {
      return { error: `Page ${page}: unexpected response` }
    }
  }

  if (json.component === 'Auth/Login') {
    return { error: `Session expired on page ${page}` }
  }

  const productsPage = json.props?.products
  if (!productsPage?.data) {
    return { error: `Page ${page}: no products data` }
  }

  const lastPage = productsPage.last_page || 1

  // Filter dresses
  const dresses = productsPage.data.filter((p: any) => DRESS_TYPES.has(p.type?.code))

  // Get existing products for matching
  const { data: existingProducts } = await supabase
    .from('products')
    .select('id, style_name, stockist_id')
  const byStockistId = new Map<number, string>()
  const byName = new Map<string, string>()
  for (const p of existingProducts || []) {
    if (p.stockist_id) byStockistId.set(p.stockist_id, p.id)
    byName.set(p.style_name.toLowerCase(), p.id)
  }

  let created = 0, updated = 0, errors = 0

  for (const dress of dresses) {
    const hashtags = groupHashtags(dress.hashtags)
    const shape = hashtags['shape']?.[0] || ''
    const train = hashtags['train']?.[0] || ''

    const stockistData = {
      neckline: hashtags['neckline'] || [],
      shape: hashtags['shape'] || [],
      train: hashtags['train'] || [],
      colors: hashtags['colors'] || [],
      materials: hashtags['materials'] || [],
      sleeves: hashtags['sleeves_straps'] || [],
      waist: hashtags['waist'] || [],
      style: hashtags['style'] || [],
      length: hashtags['length'] || [],
      back: hashtags['back'] || [],
      collection: dress.collection?.name || '',
      collectionLine: dress.collection?.collectionLineName || '',
      modelNumber: dress.modelNumber || '',
      retailPrice: dress.retailPrice || null,
    }

    const images = (dress.images || []).map((img: any) => img.url)

    const row = {
      style_name: dress.name,
      category: stockistCategory(dress.collection?.collectionLineName || ''),
      silhouette: STOCKIST_SILHOUETTE_MAP[shape] || null,
      train_style: STOCKIST_TRAIN_MAP[train] || null,
      msrp: dress.retailPrice?.amount || null,
      description: dress.description || null,
      images,
      is_active: true,
      stockist_id: dress.id,
      stockist_data: stockistData,
      updated_at: new Date().toISOString(),
    }

    const existingId = byStockistId.get(dress.id) || byName.get(dress.name.toLowerCase())

    if (existingId) {
      const { error } = await supabase.from('products').update(row).eq('id', existingId)
      if (error) errors++
      else updated++
    } else {
      const { error } = await supabase.from('products').insert(row)
      if (error) errors++
      else created++
    }
  }

  if (page === lastPage) revalidatePath('/admin')
  return { success: true, created, updated, errors, lastPage, dressCount: dresses.length }
}

/** Legacy wrapper — kept for backward compat but now just delegates to chunked sync */
export async function syncFromStockist() {
  return { error: 'Use the new chunked sync (Sync from Stockist button) instead.' }
}

// ── Featured Gowns ──────────────────────────────────
export async function getFeaturedGowns() {
  await requireModRole()
  const supabase = await db()
  const { data, error } = await supabase
    .from('featured_gowns')
    .select('*')
    .order('display_order', { ascending: true })

  if (error?.message?.includes('does not exist')) return { needsMigration: true, data: [] }
  return { data: data || [] }
}

export async function getPublicFeaturedGowns() {
  const supabase = await db()
  const { data, error } = await supabase
    .from('featured_gowns')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) return []
  return data || []
}

export async function addFeaturedGown(gown: {
  title: string
  subtitle: string
  price: string
  image_url: string
  link: string
}) {
  await requireAdminRole()
  const supabase = await adminDb()

  const { data: existing } = await supabase
    .from('featured_gowns')
    .select('display_order')
    .order('display_order', { ascending: false })
    .limit(1)

  const maxOrder = existing?.[0]?.display_order || 0

  const { error } = await supabase.from('featured_gowns').insert({
    ...gown,
    display_order: maxOrder + 1,
    is_active: true,
  })

  if (error) return { error: error.message }
  revalidatePath('/admin')
  revalidatePath('/')
  return { success: true }
}

export async function updateFeaturedGown(id: string, updates: Record<string, any>) {
  await requireAdminRole()
  const supabase = await adminDb()

  const { error } = await supabase
    .from('featured_gowns')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/admin')
  revalidatePath('/')
  return { success: true }
}

export async function removeFeaturedGown(id: string) {
  await requireAdminRole()
  const supabase = await adminDb()

  const { error } = await supabase.from('featured_gowns').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin')
  revalidatePath('/')
  return { success: true }
}

export async function reorderFeaturedGown(id: string, direction: 'up' | 'down') {
  await requireAdminRole()
  const supabase = await adminDb()

  const { data: all } = await supabase
    .from('featured_gowns')
    .select('id, display_order')
    .order('display_order', { ascending: true })

  if (!all || all.length < 2) return { success: true }

  const idx = all.findIndex((g: any) => g.id === id)
  if (idx === -1) return { error: 'Not found' }

  const swapIdx = direction === 'up' ? idx - 1 : idx + 1
  if (swapIdx < 0 || swapIdx >= all.length) return { success: true }

  const orderA = all[idx].display_order
  const orderB = all[swapIdx].display_order

  await supabase.from('featured_gowns').update({ display_order: orderB }).eq('id', all[idx].id)
  await supabase.from('featured_gowns').update({ display_order: orderA }).eq('id', all[swapIdx].id)

  revalidatePath('/admin')
  revalidatePath('/')
  return { success: true }
}

// ── Delete Listing ──────────────────────────────────
export async function deleteListing(listingId: string) {
  await requireAdminRole()
  const supabase = await adminDb()

  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', listingId)

  if (error) return { error: error.message }
  revalidatePath('/admin')
  revalidatePath('/')
  revalidatePath('/shop')
  return { success: true }
}

// ── Seed Test Listings ──────────────────────────────
const SEED_GOWNS = [
  { title: 'Tal', condition: 'excellent', silhouette: 'mermaid', price: 7668, msrp: 15000, size: '0', img: 'https://cdn.shopify.com/s/files/1/0839/7222/7357/files/Maya_side.jpg' },
  { title: 'Camellia', condition: 'good', silhouette: 'a_line', price: 7045, msrp: 19912, size: '12', img: 'https://cdn.shopify.com/s/files/1/0839/7222/7357/files/Nora_2.jpg' },
  { title: 'Hazel', condition: 'excellent', silhouette: 'sheath', price: 3416, msrp: 8142, size: '6', img: 'https://cdn.shopify.com/s/files/1/0839/7222/7357/files/FABIANAB.jpg' },
  { title: 'Meghan', condition: 'excellent', silhouette: 'ball_gown', price: 9896, msrp: 20323, size: '2', img: 'https://cdn.shopify.com/s/files/1/0839/7222/7357/files/Lorena_-_Studio_-_Ai.jpg' },
  { title: 'Lia', condition: 'new_unworn', silhouette: 'fit_and_flare', price: 3733, msrp: 12266, size: '2', img: 'https://cdn.shopify.com/s/files/1/0839/7222/7357/files/BlancheM.jpg' },
  { title: 'Toni', condition: 'excellent', silhouette: 'mermaid', price: 8492, msrp: 15339, size: '4', img: 'https://cdn.shopify.com/s/files/1/0839/7222/7357/files/Gaia_1.jpg' },
  { title: 'Lilah', condition: 'good', silhouette: 'a_line', price: 7050, msrp: 21054, size: '16', img: 'https://cdn.shopify.com/s/files/1/0839/7222/7357/files/Maya_side.jpg' },
  { title: 'Willow', condition: 'new_unworn', silhouette: 'sheath', price: 5485, msrp: 18200, size: '16', img: 'https://cdn.shopify.com/s/files/1/0839/7222/7357/files/Nora_2.jpg' },
  { title: 'Tango', condition: 'excellent', silhouette: 'trumpet', price: 4506, msrp: 14214, size: '10', img: 'https://cdn.shopify.com/s/files/1/0839/7222/7357/files/FABIANAB.jpg' },
  { title: 'Stassie', condition: 'good', silhouette: 'ball_gown', price: 4234, msrp: 11331, size: '8', img: 'https://cdn.shopify.com/s/files/1/0839/7222/7357/files/Lorena_-_Studio_-_Ai.jpg' },
  { title: 'Hallie', condition: 'excellent', silhouette: 'mermaid', price: 10951, msrp: 16034, size: '10', img: 'https://cdn.shopify.com/s/files/1/0839/7222/7357/files/BlancheM.jpg' },
  { title: 'Courtney', condition: 'good', silhouette: 'a_line', price: 4279, msrp: 8347, size: '10', img: 'https://cdn.shopify.com/s/files/1/0839/7222/7357/files/Gaia_1.jpg' },
  { title: 'Ina', condition: 'excellent', silhouette: 'sheath', price: 7017, msrp: 16165, size: '10', img: 'https://cdn.shopify.com/s/files/1/0839/7222/7357/files/Maya_side.jpg' },
  { title: 'Clara', condition: 'excellent', silhouette: 'fit_and_flare', price: 8715, msrp: 22060, size: '6', img: 'https://cdn.shopify.com/s/files/1/0839/7222/7357/files/Nora_2.jpg' },
  { title: 'Frankie', condition: 'new_unworn', silhouette: 'trumpet', price: 5880, msrp: 14427, size: '12', img: 'https://cdn.shopify.com/s/files/1/0839/7222/7357/files/FABIANAB.jpg' },
  { title: 'Angel', condition: 'excellent', silhouette: 'a_line', price: 6320, msrp: 13500, size: '2', img: 'https://cdn.shopify.com/s/files/1/0839/7222/7357/files/Lorena_-_Studio_-_Ai.jpg' },
  { title: 'Lily', condition: 'good', silhouette: 'mermaid', price: 5100, msrp: 11200, size: '14', img: 'https://cdn.shopify.com/s/files/1/0839/7222/7357/files/BlancheM.jpg' },
  { title: 'Brielle', condition: 'new_unworn', silhouette: 'ball_gown', price: 11200, msrp: 22000, size: '4', img: 'https://cdn.shopify.com/s/files/1/0839/7222/7357/files/Gaia_1.jpg' },
  { title: 'Dahlia', condition: 'excellent', silhouette: 'sheath', price: 4850, msrp: 9700, size: '8', img: 'https://cdn.shopify.com/s/files/1/0839/7222/7357/files/Maya_side.jpg' },
  { title: 'Ember', condition: 'good', silhouette: 'fit_and_flare', price: 6750, msrp: 15300, size: '6', img: 'https://cdn.shopify.com/s/files/1/0839/7222/7357/files/Nora_2.jpg' },
  { title: 'Faye', condition: 'excellent', silhouette: 'trumpet', price: 8900, msrp: 17800, size: '10', img: 'https://cdn.shopify.com/s/files/1/0839/7222/7357/files/FABIANAB.jpg' },
  { title: 'Gemma', condition: 'new_unworn', silhouette: 'a_line', price: 7200, msrp: 14400, size: '0', img: 'https://cdn.shopify.com/s/files/1/0839/7222/7357/files/Lorena_-_Studio_-_Ai.jpg' },
  { title: 'Harlow', condition: 'excellent', silhouette: 'mermaid', price: 9350, msrp: 19500, size: '4', img: 'https://cdn.shopify.com/s/files/1/0839/7222/7357/files/BlancheM.jpg' },
  { title: 'Ivy', condition: 'good', silhouette: 'ball_gown', price: 5600, msrp: 12800, size: '12', img: 'https://cdn.shopify.com/s/files/1/0839/7222/7357/files/Gaia_1.jpg' },
  { title: 'Juniper', condition: 'excellent', silhouette: 'sheath', price: 4100, msrp: 8600, size: '2', img: 'https://cdn.shopify.com/s/files/1/0839/7222/7357/files/Maya_side.jpg' },
  { title: 'Kira', condition: 'new_unworn', silhouette: 'fit_and_flare', price: 10500, msrp: 21000, size: '8', img: 'https://cdn.shopify.com/s/files/1/0839/7222/7357/files/Nora_2.jpg' },
  { title: 'Luna', condition: 'excellent', silhouette: 'trumpet', price: 7800, msrp: 16200, size: '6', img: 'https://cdn.shopify.com/s/files/1/0839/7222/7357/files/FABIANAB.jpg' },
  { title: 'Maren', condition: 'good', silhouette: 'a_line', price: 3950, msrp: 9100, size: '14', img: 'https://cdn.shopify.com/s/files/1/0839/7222/7357/files/Lorena_-_Studio_-_Ai.jpg' },
  { title: 'Nadia', condition: 'excellent', silhouette: 'mermaid', price: 8100, msrp: 18000, size: '4', img: 'https://cdn.shopify.com/s/files/1/0839/7222/7357/files/BlancheM.jpg' },
  { title: 'Opal', condition: 'new_unworn', silhouette: 'ball_gown', price: 12500, msrp: 25000, size: '6', img: 'https://cdn.shopify.com/s/files/1/0839/7222/7357/files/Gaia_1.jpg' },
]

export async function seedTestListings() {
  const user = await requireAdminRole()
  const supabase = await adminDb()

  let created = 0
  let errors = 0

  for (const gown of SEED_GOWNS) {
    const { error } = await supabase.from('listings').insert({
      seller_id: user.id,
      title: gown.title,
      category: 'bridal',
      listing_type: 'sample_sale',
      condition: gown.condition,
      size_us: gown.size,
      silhouette: gown.silhouette,
      price: gown.price,
      msrp: gown.msrp,
      images: [gown.img],
      status: 'approved',
    })

    if (error) {
      console.error(`Seed error for ${gown.title}:`, error.message)
      errors++
    } else {
      created++
    }
  }

  revalidatePath('/')
  revalidatePath('/shop')
  revalidatePath('/admin')
  return { success: true, created, errors }
}

export async function deleteAllTestListings() {
  const user = await requireAdminRole()
  const supabase = await adminDb()

  const { data, error } = await supabase
    .from('listings')
    .delete()
    .eq('seller_id', user.id)
    .eq('listing_type', 'sample_sale')
    .select('id')

  if (error) return { error: error.message }
  revalidatePath('/')
  revalidatePath('/shop')
  revalidatePath('/admin')
  return { success: true, deleted: data?.length || 0 }
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
