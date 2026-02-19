'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import {
  getAdminStats,
  getPendingListings,
  getAllListings,
  approveListing,
  rejectListing,
  getUsers,
  setUserRole,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductActive,
  uploadProductImage,
  removeProductImage,
  addProductImageUrl,
  bulkImportCatalog,
  syncCatalogImages,
  syncStockistInit,
  syncStockistPage,
  getClaims,
  resolveClaim,
} from './actions'

type Tab = 'overview' | 'moderation' | 'listings' | 'users' | 'products' | 'claims'

// ═══════════════════════════════════════════════════════
// OVERVIEW TAB
// ═══════════════════════════════════════════════════════
function OverviewTab() {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    getAdminStats().then(setStats).catch(() => setStats(null))
  }, [])

  if (!stats) return <LoadingSkeleton />

  const cards = [
    { label: 'Pending Review', value: stats.pendingReview, color: 'text-yellow-600', icon: '⏳' },
    { label: 'Total Listings', value: stats.totalListings, color: 'text-[#1c1c1c]', icon: '👗' },
    { label: 'Total Orders', value: stats.totalOrders, color: 'text-emerald-600', icon: '📦' },
    { label: 'Total Users', value: stats.totalUsers, color: 'text-blue-600', icon: '👥' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map(c => (
        <div key={c.label} className="border border-[#1c1c1c]/5 rounded-xl p-6 text-center">
          <div className="text-3xl mb-2">{c.icon}</div>
          <p className={`font-serif text-3xl font-light ${c.color}`}>{c.value}</p>
          <p className="font-sans text-[10px] text-[#1c1c1c]/30 uppercase tracking-[0.15em] mt-1 font-light">{c.label}</p>
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// MODERATION TAB (Pending Review Queue)
// ═══════════════════════════════════════════════════════
function ModerationTab() {
  const [pending, setPending] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    getPendingListings().then(d => { setPending(d); setLoading(false) })
  }, [])

  const handleApprove = (id: string) => {
    startTransition(async () => {
      const res = await approveListing(id)
      if (res.success) setPending(prev => prev.filter(l => l.id !== id))
    })
  }

  const handleReject = () => {
    if (!rejectId || !rejectReason.trim()) return
    startTransition(async () => {
      const res = await rejectListing(rejectId, rejectReason)
      if (res.success) {
        setPending(prev => prev.filter(l => l.id !== rejectId))
        setRejectId(null)
        setRejectReason('')
      }
    })
  }

  if (loading) return <LoadingSkeleton />

  if (pending.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">✅</div>
        <h3 className="font-serif text-2xl text-[#1c1c1c] font-light">All clear</h3>
        <p className="text-[#1c1c1c]/40 font-sans mt-2 font-light">No listings pending review</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="font-sans text-sm text-yellow-600 mb-4 font-light">⏳ {pending.length} listing{pending.length !== 1 ? 's' : ''} awaiting review</p>
      {pending.map((listing: any) => (
        <div key={listing.id} className="border border-[#1c1c1c]/5 rounded-lg p-5 hover:border-[#1c1c1c]/10 transition-colors">
          <div className="flex gap-5">
            <div className="flex gap-2 flex-shrink-0">
              {listing.images?.slice(0, 3).map((img: string, i: number) => (
                <div key={i} className="w-20 h-20 bg-[#1c1c1c]/[0.03] rounded-lg overflow-hidden">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
              {(!listing.images || listing.images.length === 0) && (
                <div className="w-20 h-20 bg-[#1c1c1c]/[0.03] rounded-lg flex items-center justify-center text-[#1c1c1c]/20">👗</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-serif text-xl text-[#1c1c1c] font-light">{listing.title}</h3>
              <p className="font-sans text-xs text-[#1c1c1c]/30 mt-1 font-light">
                By {listing.profiles?.display_name || listing.profiles?.full_name || 'Unknown'} · {listing.category} · Size {listing.size_us || '—'} · ${listing.price?.toLocaleString()}
              </p>
              {listing.description && (
                <p className="font-sans text-sm text-[#1c1c1c]/40 mt-2 line-clamp-2 font-light">{listing.description}</p>
              )}
              <div className="flex gap-3 mt-4">
                <button onClick={() => handleApprove(listing.id)} disabled={isPending} className="bg-emerald-600 text-white px-5 py-2 rounded-full font-sans text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-emerald-500 transition-colors disabled:opacity-50">
                  ✓ Approve
                </button>
                <button onClick={() => setRejectId(listing.id)} disabled={isPending} className="bg-red-50 text-red-500 px-5 py-2 rounded-full font-sans text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-red-100 transition-colors border border-red-200">
                  ✕ Reject
                </button>
              </div>
            </div>
          </div>

          {/* Rejection modal inline */}
          {rejectId === listing.id && (
            <div className="mt-4 pt-4 border-t border-[#1c1c1c]/5">
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Reason for rejection (required)..."
                className="w-full bg-[#1c1c1c]/[0.03] border border-[#1c1c1c]/10 rounded-xl px-4 py-3 font-sans text-sm text-[#1c1c1c] placeholder:text-[#1c1c1c]/25 focus:outline-none focus:border-red-400 min-h-[80px]"
              />
              <div className="flex gap-2 mt-3">
                <button onClick={handleReject} disabled={!rejectReason.trim() || isPending} className="bg-red-600 text-white px-5 py-2 rounded-full font-sans text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-red-500 disabled:opacity-50">
                  Confirm Rejection
                </button>
                <button onClick={() => { setRejectId(null); setRejectReason('') }} className="text-[#1c1c1c]/30 font-sans text-xs font-light hover:text-[#1c1c1c]">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// ALL LISTINGS TAB
// ═══════════════════════════════════════════════════════
function AllListingsTab() {
  const [listings, setListings] = useState<any[]>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getAllListings(filter).then(d => { setListings(d); setLoading(false) })
  }, [filter])

  const statuses = ['all', 'draft', 'pending_review', 'approved', 'rejected', 'sold', 'archived']

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-5 py-2.5 rounded-full font-sans text-[9px] uppercase tracking-[0.2em] font-bold transition-all ${filter === s ? 'bg-[#1c1c1c] text-white' : 'bg-[#1c1c1c]/[0.03] text-[#1c1c1c]/30 hover:text-[#1c1c1c]/60 hover:bg-[#1c1c1c]/[0.06] border border-[#1c1c1c]/5'}`}>
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>
      {loading ? <LoadingSkeleton /> : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#1c1c1c]/5">
                <th className="pb-3 font-sans text-[10px] uppercase tracking-[0.15em] text-[#1c1c1c]/30 font-light">Title</th>
                <th className="pb-3 font-sans text-[10px] uppercase tracking-[0.15em] text-[#1c1c1c]/30 font-light">Seller</th>
                <th className="pb-3 font-sans text-[10px] uppercase tracking-[0.15em] text-[#1c1c1c]/30 font-light">Price</th>
                <th className="pb-3 font-sans text-[10px] uppercase tracking-[0.15em] text-[#1c1c1c]/30 font-light">Status</th>
                <th className="pb-3 font-sans text-[10px] uppercase tracking-[0.15em] text-[#1c1c1c]/30 font-light">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c1c1c]/5">
              {listings.map((l: any) => (
                <tr key={l.id} className="hover:bg-[#1c1c1c]/[0.02] transition-colors">
                  <td className="py-3 font-serif text-[#1c1c1c] font-light">{l.title}</td>
                  <td className="py-3 font-sans text-sm text-[#1c1c1c]/40 font-light">{l.profiles?.display_name || l.profiles?.full_name || '—'}</td>
                  <td className="py-3 font-sans text-sm text-[#1c1c1c] font-light">${l.price?.toLocaleString()}</td>
                  <td className="py-3"><StatusBadge status={l.status} /></td>
                  <td className="py-3 font-sans text-xs text-[#1c1c1c]/30 font-light">{new Date(l.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {listings.length === 0 && <p className="text-center text-[#1c1c1c]/30 py-8 font-sans font-light">No listings match this filter</p>}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// USERS TAB
// ═══════════════════════════════════════════════════════
function UsersTab() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    getUsers().then(d => { setUsers(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const handleRoleChange = (userId: string, role: 'user' | 'moderator' | 'admin') => {
    startTransition(async () => {
      await setUserRole(userId, role)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, roles: role === 'user' ? ['user'] : [role] } : u))
    })
  }

  if (loading) return <LoadingSkeleton />

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-[#1c1c1c]/5">
            <th className="pb-3 font-sans text-[10px] uppercase tracking-[0.15em] text-[#1c1c1c]/30 font-light">User</th>
            <th className="pb-3 font-sans text-[10px] uppercase tracking-[0.15em] text-[#1c1c1c]/30 font-light">Joined</th>
            <th className="pb-3 font-sans text-[10px] uppercase tracking-[0.15em] text-[#1c1c1c]/30 font-light">Role</th>
            <th className="pb-3 font-sans text-[10px] uppercase tracking-[0.15em] text-[#1c1c1c]/30 font-light">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1c1c1c]/5">
          {users.map((u: any) => (
            <tr key={u.id} className="hover:bg-[#1c1c1c]/[0.02] transition-colors">
              <td className="py-3">
                <p className="font-serif text-[#1c1c1c] font-light">{u.display_name || u.full_name || 'No name'}</p>
                <p className="font-sans text-xs text-[#1c1c1c]/25 font-light">{u.id.slice(0, 8)}...</p>
              </td>
              <td className="py-3 font-sans text-xs text-[#1c1c1c]/30 font-light">{new Date(u.created_at).toLocaleDateString()}</td>
              <td className="py-3">
                <span className={`text-[9px] font-sans font-bold uppercase tracking-[0.1em] px-2.5 py-1 rounded-full ${
                  u.roles?.includes('admin') ? 'bg-red-50 text-red-500 border border-red-200' :
                  u.roles?.includes('moderator') ? 'bg-blue-50 text-blue-500 border border-blue-200' :
                  'bg-[#1c1c1c]/[0.03] text-[#1c1c1c]/30 border border-[#1c1c1c]/5'
                }`}>
                  {u.roles?.includes('admin') ? 'Admin' : u.roles?.includes('moderator') ? 'Moderator' : 'User'}
                </span>
              </td>
              <td className="py-3">
                <select
                  value={u.roles?.includes('admin') ? 'admin' : u.roles?.includes('moderator') ? 'moderator' : 'user'}
                  onChange={e => handleRoleChange(u.id, e.target.value as any)}
                  disabled={isPending}
                  className="bg-[#1c1c1c]/[0.03] border border-[#1c1c1c]/10 rounded-lg px-2 py-1 font-sans text-xs text-[#1c1c1c] focus:outline-none focus:border-[#1c1c1c]/30"
                >
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// IMAGE MANAGER (for editing existing product images)
// ═══════════════════════════════════════════════════════
function ImageManager({ productId, images, onUpdate }: {
  productId: string
  images: string[]
  onUpdate: () => void
}) {
  const [uploading, setUploading] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    const formData = new FormData()
    formData.append('file', file)
    const res = await uploadProductImage(productId, formData)
    if (res.error) setError(res.error)
    else onUpdate()
    setUploading(false)
    e.target.value = ''
  }

  const handleRemove = async (url: string) => {
    setError(null)
    const res = await removeProductImage(productId, url)
    if (res.error) setError(res.error)
    else onUpdate()
  }

  const handleAddUrl = async () => {
    if (!urlInput.trim()) return
    setError(null)
    const res = await addProductImageUrl(productId, urlInput.trim())
    if (res.error) setError(res.error)
    else { setUrlInput(''); onUpdate() }
  }

  return (
    <div className="col-span-2 space-y-3">
      <label className="font-sans text-[9px] uppercase tracking-[0.3em] text-[#1c1c1c]/30 font-bold">Images</label>

      {/* Current images */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((url, i) => (
            <div key={i} className="relative group w-24 h-24 rounded-xl overflow-hidden bg-[#1c1c1c]/[0.03] border border-[#1c1c1c]/5">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(url)}
                className="absolute inset-0 bg-obsidian/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-sans font-bold uppercase tracking-wider"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload + URL input */}
      <div className="flex gap-3 items-center">
        <label className={`cursor-pointer px-4 py-2.5 rounded-full font-sans text-[9px] font-bold uppercase tracking-[0.15em] transition-colors border ${uploading ? 'border-[#1c1c1c]/5 text-[#1c1c1c]/15' : 'border-[#1c1c1c]/10 text-[#1c1c1c]/40 hover:text-[#1c1c1c] hover:border-[#1c1c1c]/20'}`}>
          {uploading ? 'Uploading...' : 'Upload Image'}
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUpload} disabled={uploading} className="hidden" />
        </label>
        <span className="text-[#1c1c1c]/15 font-sans text-[10px]">or</span>
        <input
          value={urlInput}
          onChange={e => setUrlInput(e.target.value)}
          placeholder="Paste image URL..."
          className={`flex-1 ${inputClass} text-xs py-2`}
        />
        <button
          type="button"
          onClick={handleAddUrl}
          disabled={!urlInput.trim()}
          className="px-4 py-2.5 rounded-full font-sans text-[9px] font-bold uppercase tracking-[0.15em] border border-[#1c1c1c]/10 text-[#1c1c1c]/40 hover:text-[#1c1c1c] hover:border-[#1c1c1c]/20 transition-colors disabled:opacity-30"
        >
          Add
        </button>
      </div>

      {error && <p className="font-sans text-xs text-red-500">{error}</p>}
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// PRODUCT FORM (shared between create & edit)
// ═══════════════════════════════════════════════════════
const inputClass = "bg-[#1c1c1c]/[0.03] border border-[#1c1c1c]/10 rounded-xl px-4 py-3 font-sans text-sm text-[#1c1c1c] placeholder:text-[#1c1c1c]/25 focus:outline-none focus:border-[#1c1c1c]/30 transition-colors"

function ProductForm({ product, onSubmit, onCancel, isPending, onRefresh }: {
  product?: any
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  isPending: boolean
  onRefresh?: () => void
}) {
  return (
    <form onSubmit={onSubmit} className="bg-[#1c1c1c]/[0.02] border border-[#1c1c1c]/5 rounded-2xl p-8 mb-6 grid grid-cols-2 gap-4">
      <div className="col-span-2">
        <input name="style_name" required defaultValue={product?.style_name || ''} placeholder="Style Name (e.g., GALA 1001)" className={`w-full ${inputClass}`} />
      </div>
      <input name="sku" defaultValue={product?.sku || ''} placeholder="SKU (optional)" className={inputClass} />
      <select name="category" required defaultValue={product?.category || 'bridal'} className={inputClass}>
        <option value="bridal">Bridal</option>
        <option value="evening">Evening</option>
        <option value="accessories">Accessories</option>
      </select>
      <select name="silhouette" defaultValue={product?.silhouette || ''} className={inputClass}>
        <option value="">Silhouette (optional)</option>
        <option value="a_line">A-Line</option>
        <option value="ball_gown">Ball Gown</option>
        <option value="mermaid">Mermaid</option>
        <option value="trumpet">Trumpet</option>
        <option value="sheath">Sheath</option>
        <option value="fit_and_flare">Fit & Flare</option>
        <option value="empire">Empire</option>
        <option value="column">Column</option>
      </select>
      <select name="train_style" defaultValue={product?.train_style || ''} className={inputClass}>
        <option value="">Train (optional)</option>
        <option value="none">None</option>
        <option value="sweep">Sweep</option>
        <option value="court">Court</option>
        <option value="chapel">Chapel</option>
        <option value="cathedral">Cathedral</option>
        <option value="royal">Royal</option>
      </select>
      <input name="msrp" type="number" defaultValue={product?.msrp || ''} placeholder="MSRP (optional)" className={inputClass} />
      <textarea name="description" defaultValue={product?.description || ''} placeholder="Description (optional)" className={`col-span-2 ${inputClass} min-h-[80px]`} />

      {/* Image management — only for existing products */}
      {product?.id && onRefresh && (
        <ImageManager productId={product.id} images={product.images || []} onUpdate={onRefresh} />
      )}

      <div className="col-span-2 flex gap-3">
        <button type="submit" disabled={isPending} className="px-10 py-4 bg-[#1c1c1c] text-white font-sans text-[10px] font-bold uppercase tracking-[0.25em] rounded-full hover:bg-[#333] transition-all shadow-lg disabled:opacity-50">
          {isPending ? 'Saving...' : product ? 'Save Changes' : 'Create Product'}
        </button>
        <button type="button" onClick={onCancel} className="px-8 py-4 border border-[#1c1c1c]/10 rounded-full font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1c1c1c]/30 hover:text-[#1c1c1c] hover:border-[#1c1c1c]/20 transition-all">
          Cancel
        </button>
      </div>
    </form>
  )
}

// ═══════════════════════════════════════════════════════
// PRODUCT CARD (shop-style catalog card with admin overlays)
// ═══════════════════════════════════════════════════════
function AdminProductCard({ product, onEdit, onToggle, onDelete, isPending }: {
  product: any
  onEdit: () => void
  onToggle: () => void
  onDelete: () => void
  isPending: boolean
}) {
  const [confirmDel, setConfirmDel] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const mainImage = product.images?.[0]
  const imageCount = product.images?.length || 0

  const silhouetteLabel: Record<string, string> = {
    a_line: 'A-Line', ball_gown: 'Ball Gown', mermaid: 'Mermaid',
    trumpet: 'Trumpet', sheath: 'Sheath', fit_and_flare: 'Fit & Flare',
    empire: 'Empire', column: 'Column',
  }

  return (
    <article
      className={`group relative cursor-pointer ${!product.is_active ? 'opacity-40' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image container — matches shop ProductCard */}
      <div className="relative aspect-[2/3] overflow-hidden bg-obsidian/[0.03] rounded-2xl" onClick={onEdit}>
        {mainImage ? (
          <img
            src={mainImage}
            alt={product.style_name}
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-600 ease-[cubic-bezier(0.22,1,0.36,1)] ${isHovered ? 'scale-105' : 'scale-100'}`}
          />
        ) : (
          <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-obsidian/[0.04]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" className="w-16 h-16 mb-3 text-obsidian/10">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-obsidian/15">No Image</span>
          </div>
        )}

        {/* Hover gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-obsidian/40 via-transparent to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-20'}`} />

        {/* Top badges */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-10">
          {/* Category badge */}
          <span className={`px-3 py-1 text-[9px] uppercase tracking-[0.15em] font-sans font-bold border rounded-full backdrop-blur-md ${
            product.category === 'bridal'
              ? 'bg-emerald-500/10 text-emerald-600/90 border-emerald-500/20'
              : product.category === 'evening'
              ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
              : 'bg-obsidian/5 text-obsidian/40 border-obsidian/10'
          }`}>
            {product.category}
          </span>

          {/* Photo count badge */}
          {imageCount > 0 && (
            <span className="px-3 py-1 bg-[#1c1c1c] text-white text-[9px] uppercase tracking-[0.15em] font-sans font-bold rounded-full shadow-[0_4px_15px_rgba(197,160,89,0.3)]">
              {imageCount} {imageCount === 1 ? 'Photo' : 'Photos'}
            </span>
          )}
        </div>

        {/* Active status + edit on hover (bottom of image) */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10">
          {/* Active status indicator */}
          <button
            onClick={e => { e.stopPropagation(); onToggle() }}
            disabled={isPending}
            className="flex items-center gap-1.5"
            title={product.is_active ? 'Active — click to deactivate' : 'Inactive — click to activate'}
          >
            <span className={`block w-2 h-2 rounded-full ${product.is_active ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]' : 'bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.6)]'}`} />
            <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-white/90">
              {product.is_active ? 'Active' : 'Inactive'}
            </span>
          </button>

          {/* Edit button on hover */}
          <div className={`transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <span className="px-6 py-3 bg-[#1c1c1c] text-white font-sans text-[10px] font-bold uppercase tracking-[0.25em] rounded-full hover:bg-[#333] transition-all shadow-2xl">
              Edit Product
            </span>
          </div>
        </div>
      </div>

      {/* Card info — matches shop ProductCard layout */}
      <div className="pt-6 pb-2">
        {/* Collection / Silhouette */}
        <p className="font-sans text-[9px] uppercase tracking-[0.4em] text-obsidian/30 mb-2 font-bold">
          {silhouetteLabel[product.silhouette] || product.category || 'Galia Lahav'}
        </p>

        {/* Title */}
        <h3 className="font-serif text-2xl tracking-tight text-obsidian group-hover:text-[#1c1c1c] transition-colors duration-500">
          {product.style_name}
        </h3>

        {/* Attributes */}
        <p className="font-sans text-[11px] text-obsidian/40 mt-2 tracking-wide font-medium">
          {product.category ? product.category.charAt(0).toUpperCase() + product.category.slice(1) : ''}{product.silhouette ? ` · ${silhouetteLabel[product.silhouette] || product.silhouette}` : ''}{product.sku ? ` · ${product.sku}` : ''}
        </p>

        {/* Price + admin actions */}
        <div className="flex items-baseline justify-between mt-4">
          <div className="flex items-baseline gap-3">
            {product.msrp ? (
              <span className="font-sans text-xl font-bold text-obsidian tracking-tight">
                ${Number(product.msrp).toLocaleString()}
              </span>
            ) : (
              <span className="font-sans text-sm text-obsidian/20">MSRP not set</span>
            )}
          </div>
          <div className="flex gap-1.5 items-center">
            <button
              onClick={onEdit}
              className="px-3 py-1.5 rounded-full font-sans text-[9px] font-bold uppercase tracking-[0.15em] text-obsidian/30 hover:text-[#1c1c1c] hover:bg-obsidian/5 transition-colors"
            >
              Edit
            </button>
            {confirmDel ? (
              <div className="flex gap-1 items-center">
                <button
                  onClick={() => { onDelete(); setConfirmDel(false) }}
                  disabled={isPending}
                  className="px-2.5 py-1.5 rounded-full font-sans text-[9px] font-bold uppercase tracking-[0.1em] text-red-500 bg-red-50 hover:bg-red-100"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setConfirmDel(false)}
                  className="px-2 py-1.5 rounded-full font-sans text-[9px] font-bold uppercase tracking-[0.1em] text-obsidian/20"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); setConfirmDel(true) }}
                className="px-3 py-1.5 rounded-full font-sans text-[9px] font-bold uppercase tracking-[0.15em] text-obsidian/15 hover:text-red-400 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

// ═══════════════════════════════════════════════════════
// PRODUCT EDIT DRAWER (slide-over panel — light theme)
// ═══════════════════════════════════════════════════════
const lightInputClass = "bg-obsidian/[0.03] border border-obsidian/10 rounded-xl px-4 py-3 font-sans text-sm text-obsidian placeholder:text-obsidian/25 focus:outline-none focus:border-[#1c1c1c]/30 transition-colors"

function ProductEditDrawer({ product, onClose, onSubmit, isPending, onRefresh }: {
  product: any
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  isPending: boolean
  onRefresh: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-obsidian/30 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative w-full max-w-xl bg-white overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xl border-b border-obsidian/5 px-8 py-5 flex items-center justify-between">
          <div>
            <p className="font-sans text-[9px] uppercase tracking-[0.4em] text-obsidian/30 font-bold mb-1">{product.category}</p>
            <h2 className="font-serif text-3xl text-obsidian tracking-tight">{product.style_name}</h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-obsidian/5 hover:bg-obsidian/10 flex items-center justify-center text-obsidian/30 hover:text-obsidian transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Image gallery at top */}
        <div className="px-8 pt-6">
          {product.images?.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 mb-8">
              {product.images.map((url: string, i: number) => (
                <div key={i} className={`rounded-2xl overflow-hidden bg-obsidian/[0.03] ${i === 0 ? 'col-span-2 row-span-2 aspect-[3/4]' : 'aspect-square'}`}>
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <div className="aspect-[3/2] rounded-2xl bg-obsidian/[0.03] flex flex-col items-center justify-center mb-8">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" className="w-12 h-12 mb-2 text-obsidian/10">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              <span className="font-sans text-[10px] text-obsidian/20 uppercase tracking-[0.2em] font-bold">No images yet</span>
            </div>
          )}
        </div>

        {/* Edit form — light themed */}
        <div className="px-8 pb-10">
          <form onSubmit={onSubmit} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="font-sans text-[9px] uppercase tracking-[0.3em] text-obsidian/30 font-bold mb-2 block">Style Name</label>
              <input name="style_name" required defaultValue={product?.style_name || ''} placeholder="e.g., GALA 1001" className={`w-full ${lightInputClass}`} />
            </div>
            <div>
              <label className="font-sans text-[9px] uppercase tracking-[0.3em] text-obsidian/30 font-bold mb-2 block">SKU</label>
              <input name="sku" defaultValue={product?.sku || ''} placeholder="Optional" className={lightInputClass} />
            </div>
            <div>
              <label className="font-sans text-[9px] uppercase tracking-[0.3em] text-obsidian/30 font-bold mb-2 block">Category</label>
              <select name="category" required defaultValue={product?.category || 'bridal'} className={lightInputClass}>
                <option value="bridal">Bridal</option>
                <option value="evening">Evening</option>
                <option value="accessories">Accessories</option>
              </select>
            </div>
            <div>
              <label className="font-sans text-[9px] uppercase tracking-[0.3em] text-obsidian/30 font-bold mb-2 block">Silhouette</label>
              <select name="silhouette" defaultValue={product?.silhouette || ''} className={lightInputClass}>
                <option value="">None</option>
                <option value="a_line">A-Line</option>
                <option value="ball_gown">Ball Gown</option>
                <option value="mermaid">Mermaid</option>
                <option value="trumpet">Trumpet</option>
                <option value="sheath">Sheath</option>
                <option value="fit_and_flare">Fit & Flare</option>
                <option value="empire">Empire</option>
                <option value="column">Column</option>
              </select>
            </div>
            <div>
              <label className="font-sans text-[9px] uppercase tracking-[0.3em] text-obsidian/30 font-bold mb-2 block">Train Style</label>
              <select name="train_style" defaultValue={product?.train_style || ''} className={lightInputClass}>
                <option value="">None</option>
                <option value="sweep">Sweep</option>
                <option value="court">Court</option>
                <option value="chapel">Chapel</option>
                <option value="cathedral">Cathedral</option>
                <option value="royal">Royal</option>
              </select>
            </div>
            <div>
              <label className="font-sans text-[9px] uppercase tracking-[0.3em] text-obsidian/30 font-bold mb-2 block">MSRP</label>
              <input name="msrp" type="number" defaultValue={product?.msrp || ''} placeholder="Optional" className={lightInputClass} />
            </div>
            <div className="col-span-2">
              <label className="font-sans text-[9px] uppercase tracking-[0.3em] text-obsidian/30 font-bold mb-2 block">Description</label>
              <textarea name="description" defaultValue={product?.description || ''} placeholder="Optional description..." className={`${lightInputClass} min-h-[80px] w-full`} />
            </div>

            {/* Image management */}
            {product?.id && onRefresh && (
              <LightImageManager productId={product.id} images={product.images || []} onUpdate={onRefresh} />
            )}

            <div className="col-span-2 flex gap-3 mt-2">
              <button type="submit" disabled={isPending} className="px-10 py-4 bg-[#1c1c1c] text-white font-sans text-[10px] font-bold uppercase tracking-[0.25em] rounded-full hover:bg-[#333] transition-all shadow-lg disabled:opacity-50">
                {isPending ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" onClick={onClose} className="px-8 py-4 border border-obsidian/10 rounded-full font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-obsidian/30 hover:text-obsidian hover:border-obsidian/20 transition-all">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// Light-themed image manager for the edit drawer
function LightImageManager({ productId, images, onUpdate }: {
  productId: string
  images: string[]
  onUpdate: () => void
}) {
  const [uploading, setUploading] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    const formData = new FormData()
    formData.append('file', file)
    const res = await uploadProductImage(productId, formData)
    if (res.error) setError(res.error)
    else onUpdate()
    setUploading(false)
    e.target.value = ''
  }

  const handleRemove = async (url: string) => {
    setError(null)
    const res = await removeProductImage(productId, url)
    if (res.error) setError(res.error)
    else onUpdate()
  }

  const handleAddUrl = async () => {
    if (!urlInput.trim()) return
    setError(null)
    const res = await addProductImageUrl(productId, urlInput.trim())
    if (res.error) setError(res.error)
    else { setUrlInput(''); onUpdate() }
  }

  return (
    <div className="col-span-2 space-y-3">
      <label className="font-sans text-[9px] uppercase tracking-[0.3em] text-obsidian/30 font-bold block">Images</label>

      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((url, i) => (
            <div key={i} className="relative group w-24 h-24 rounded-xl overflow-hidden bg-obsidian/[0.03] border border-obsidian/5">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(url)}
                className="absolute inset-0 bg-obsidian/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-sans font-bold uppercase tracking-wider"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3 items-center">
        <label className={`cursor-pointer px-4 py-2.5 rounded-full font-sans text-[9px] font-bold uppercase tracking-[0.15em] transition-colors border ${uploading ? 'border-obsidian/5 text-obsidian/15' : 'border-obsidian/10 text-obsidian/40 hover:text-obsidian hover:border-obsidian/20'}`}>
          {uploading ? 'Uploading...' : 'Upload Image'}
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUpload} disabled={uploading} className="hidden" />
        </label>
        <span className="text-obsidian/15 font-sans text-[10px]">or</span>
        <input
          value={urlInput}
          onChange={e => setUrlInput(e.target.value)}
          placeholder="Paste image URL..."
          className={`flex-1 ${lightInputClass} text-xs py-2.5`}
        />
        <button
          type="button"
          onClick={handleAddUrl}
          disabled={!urlInput.trim()}
          className="px-4 py-2.5 rounded-full font-sans text-[9px] font-bold uppercase tracking-[0.15em] border border-obsidian/10 text-obsidian/40 hover:text-obsidian hover:border-obsidian/20 transition-colors disabled:opacity-30"
        >
          Add
        </button>
      </div>

      {error && <p className="font-sans text-xs text-red-500">{error}</p>}
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// STOCKIST SYNC BUTTON (chunked page-by-page)
// ═══════════════════════════════════════════════════════
function StockistSyncButton({ onDone, disabled, onMessage }: {
  onDone: () => Promise<any>
  disabled: boolean
  onMessage: (msg: string | null) => void
}) {
  const [syncing, setSyncing] = useState(false)
  const [progress, setProgress] = useState('')

  const handleSync = async () => {
    setSyncing(true)
    onMessage(null)
    setProgress('Logging in to stockist...')

    try {
      const init = await syncStockistInit()
      if (!init.success || !init.cookies || !init.version) {
        onMessage(init.error || 'Failed to login to stockist')
        setSyncing(false)
        setProgress('')
        return
      }

      const { cookies, version } = init
      let totalCreated = 0, totalUpdated = 0, totalErrors = 0, totalDresses = 0
      let lastPage = 1

      // Fetch page 1 first to get lastPage
      setProgress('Fetching page 1...')
      const first = await syncStockistPage(1, cookies, version)
      if (!first.success) {
        onMessage(first.error || 'Failed on page 1')
        setSyncing(false)
        setProgress('')
        return
      }

      lastPage = first.lastPage || 1
      totalCreated += first.created || 0
      totalUpdated += first.updated || 0
      totalErrors += first.errors || 0
      totalDresses += first.dressCount || 0

      // Fetch remaining pages
      for (let page = 2; page <= lastPage; page++) {
        setProgress(`Fetching page ${page} of ${lastPage}...`)
        const res = await syncStockistPage(page, cookies, version)
        if (!res.success) {
          onMessage(`Error on page ${page}: ${res.error}. Synced ${totalDresses} dresses so far.`)
          break
        }
        totalCreated += res.created || 0
        totalUpdated += res.updated || 0
        totalErrors += res.errors || 0
        totalDresses += res.dressCount || 0
      }

      onMessage(`Stockist sync complete: ${totalCreated} created, ${totalUpdated} updated, ${totalErrors} errors (${totalDresses} dresses across ${lastPage} pages)`)
      await onDone()
    } catch (e: any) {
      onMessage(`Sync error: ${e.message}`)
    } finally {
      setSyncing(false)
      setProgress('')
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleSync}
        disabled={disabled || syncing}
        className="px-6 py-3 bg-[#5e6db3] text-white font-sans text-[10px] font-bold uppercase tracking-[0.2em] rounded-full hover:bg-[#4a5a9e] transition-all shadow-lg disabled:opacity-50 whitespace-nowrap"
      >
        {syncing ? 'Syncing...' : 'Sync from Stockist'}
      </button>
      {progress && (
        <span className="font-sans text-[10px] text-obsidian/40 animate-pulse">{progress}</span>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// PRODUCTS CATALOG TAB (shop-style light theme)
// ═══════════════════════════════════════════════════════
function ProductsTab() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any | null>(null)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [importMsg, setImportMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const refresh = () => getProducts().then(setProducts)

  useEffect(() => {
    refresh().then(() => setLoading(false))
  }, [])

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    const form = new FormData(e.target as HTMLFormElement)
    startTransition(async () => {
      const res = await createProduct(form)
      if (res.success) {
        setShowForm(false)
        await refresh()
      }
    })
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return
    const form = new FormData(e.target as HTMLFormElement)
    startTransition(async () => {
      const res = await updateProduct(editingProduct.id, form)
      if (res.success) {
        const updated = await getProducts()
        setProducts(updated)
        const refreshed = updated.find((p: any) => p.id === editingProduct.id)
        if (refreshed) setEditingProduct(refreshed)
        else setEditingProduct(null)
      }
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteProduct(id)
      if (res.success) {
        setProducts(prev => prev.filter(p => p.id !== id))
        if (editingProduct?.id === id) setEditingProduct(null)
      }
    })
  }

  const handleToggle = (id: string, current: boolean) => {
    startTransition(async () => {
      const res = await toggleProductActive(id, !current)
      if (res.success) {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p))
        if (editingProduct?.id === id) setEditingProduct((prev: any) => prev ? { ...prev, is_active: !current } : null)
      }
    })
  }

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-12">
        <div className="space-y-8">
          {[1, 2].map(i => (
            <div key={i} className="h-48 bg-obsidian/[0.03] rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const filtered = products.filter(p => {
    const matchSearch = !search || p.style_name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase())
    const matchCat = catFilter === 'all' || p.category === catFilter
    const matchActive = activeFilter === 'all' || (activeFilter === 'active' ? p.is_active : !p.is_active)
    return matchSearch && matchCat && matchActive
  })

  return (
    /* Light background panel that mimics the shop page */
    <div className="bg-white rounded-3xl -mx-6 px-6 md:px-10 py-10">
      {/* Hero section */}
      <div className="max-w-7xl mx-auto mb-10">
        <h2 className="font-serif text-5xl md:text-6xl font-light tracking-tight text-obsidian leading-none">
          Product Catalog
        </h2>
        <p className="font-sans text-sm text-obsidian/40 mt-4 tracking-wide max-w-lg leading-relaxed">
          Manage the official Galia Lahav catalog. Add images, edit details, and control which products are visible on the marketplace.
        </p>
      </div>

      {/* Toolbar */}
      <div className="max-w-7xl mx-auto flex flex-col gap-5 mb-10">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or SKU..."
            className={`flex-1 ${lightInputClass}`}
          />
          <div className="flex gap-3 items-center flex-shrink-0">
            {products.length === 0 && (
              <button
                onClick={() => {
                  startTransition(async () => {
                    setImportMsg(null)
                    const res = await bulkImportCatalog()
                    if (res.success) {
                      setImportMsg(`Imported ${res.imported} products`)
                      await refresh()
                    } else {
                      setImportMsg(res.error || 'Import failed')
                    }
                  })
                }}
                disabled={isPending}
                className="px-6 py-3 bg-[#1c1c1c] text-white font-sans text-[10px] font-bold uppercase tracking-[0.2em] rounded-full hover:bg-[#333] transition-all shadow-lg disabled:opacity-50 whitespace-nowrap"
              >
                {isPending ? 'Importing...' : 'Import Catalog'}
              </button>
            )}
            {products.length > 0 && (
              <button
                onClick={() => {
                  startTransition(async () => {
                    setImportMsg(null)
                    const res = await syncCatalogImages()
                    if (res.success) {
                      setImportMsg(`Synced images: ${res.updated} updated, ${res.skipped} skipped`)
                      await refresh()
                    } else {
                      setImportMsg(res.error || 'Sync failed')
                    }
                  })
                }}
                disabled={isPending}
                className="px-6 py-3 bg-obsidian text-white font-sans text-[10px] font-bold uppercase tracking-[0.2em] rounded-full hover:bg-obsidian/80 transition-all shadow-lg disabled:opacity-50 whitespace-nowrap"
              >
                {isPending ? 'Syncing...' : 'Sync Images'}
              </button>
            )}
            <StockistSyncButton onDone={refresh} disabled={isPending} onMessage={setImportMsg} />
            <button
              onClick={() => { setShowForm(!showForm); setEditingProduct(null) }}
              className="px-6 py-3 bg-[#1c1c1c] text-white font-sans text-[10px] font-bold uppercase tracking-[0.2em] rounded-full hover:bg-[#333] transition-all shadow-lg whitespace-nowrap"
            >
              {showForm ? 'Cancel' : '+ Add Product'}
            </button>
          </div>
        </div>
        {importMsg && (
          <div className="px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
            <span className="font-sans text-xs text-emerald-700">{importMsg}</span>
          </div>
        )}

        {/* Filter pills — shop style */}
        <div className="flex flex-wrap gap-2 items-center">
          {['all', 'bridal', 'evening', 'accessories'].map(c => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className={`px-5 py-2.5 rounded-full font-sans text-[9px] uppercase tracking-[0.2em] font-bold transition-all ${
                catFilter === c
                  ? 'bg-obsidian text-white'
                  : 'bg-obsidian/[0.03] text-obsidian/30 hover:text-obsidian/60 hover:bg-obsidian/[0.06] border border-obsidian/5'
              }`}
            >
              {c}
            </button>
          ))}
          <span className="w-px h-4 bg-obsidian/10 mx-2" />
          {(['all', 'active', 'inactive'] as const).map(s => (
            <button
              key={s}
              onClick={() => setActiveFilter(s)}
              className={`px-5 py-2.5 rounded-full font-sans text-[9px] uppercase tracking-[0.2em] font-bold transition-all ${
                activeFilter === s
                  ? 'bg-obsidian text-white'
                  : 'bg-obsidian/[0.03] text-obsidian/30 hover:text-obsidian/60 hover:bg-obsidian/[0.06] border border-obsidian/5'
              }`}
            >
              {s}
            </button>
          ))}
          <span className="ml-auto font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-obsidian/20">
            {filtered.length} of {products.length}
          </span>
        </div>
      </div>

      {/* Create form */}
      {showForm && !editingProduct && (
        <div className="max-w-7xl mx-auto mb-10">
          <form onSubmit={handleCreate} className="bg-obsidian/[0.02] border border-obsidian/5 rounded-2xl p-8 grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <input name="style_name" required placeholder="Style Name (e.g., GALA 1001)" className={`w-full ${lightInputClass}`} />
            </div>
            <input name="sku" placeholder="SKU (optional)" className={lightInputClass} />
            <select name="category" required defaultValue="bridal" className={lightInputClass}>
              <option value="bridal">Bridal</option>
              <option value="evening">Evening</option>
              <option value="accessories">Accessories</option>
            </select>
            <select name="silhouette" className={lightInputClass}>
              <option value="">Silhouette (optional)</option>
              <option value="a_line">A-Line</option>
              <option value="ball_gown">Ball Gown</option>
              <option value="mermaid">Mermaid</option>
              <option value="trumpet">Trumpet</option>
              <option value="sheath">Sheath</option>
              <option value="fit_and_flare">Fit & Flare</option>
              <option value="empire">Empire</option>
              <option value="column">Column</option>
            </select>
            <select name="train_style" className={lightInputClass}>
              <option value="">Train (optional)</option>
              <option value="sweep">Sweep</option>
              <option value="court">Court</option>
              <option value="chapel">Chapel</option>
              <option value="cathedral">Cathedral</option>
              <option value="royal">Royal</option>
            </select>
            <input name="msrp" type="number" placeholder="MSRP (optional)" className={lightInputClass} />
            <textarea name="description" placeholder="Description (optional)" className={`col-span-2 ${lightInputClass} min-h-[80px]`} />
            <div className="col-span-2 flex gap-3">
              <button type="submit" disabled={isPending} className="px-10 py-4 bg-[#1c1c1c] text-white font-sans text-[10px] font-bold uppercase tracking-[0.25em] rounded-full hover:bg-[#333] transition-all shadow-lg disabled:opacity-50">
                {isPending ? 'Creating...' : 'Create Product'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-8 py-4 border border-obsidian/10 rounded-full font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-obsidian/30 hover:text-obsidian hover:border-obsidian/20 transition-all">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Product card grid — shop page style */}
      <div className="max-w-7xl mx-auto">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-16">
            {filtered.map((p: any) => (
              <AdminProductCard
                key={p.id}
                product={p}
                onEdit={() => { setEditingProduct(p); setShowForm(false) }}
                onToggle={() => handleToggle(p.id, p.is_active)}
                onDelete={() => handleDelete(p.id)}
                isPending={isPending}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40">
            <p className="font-serif text-3xl text-obsidian/40 tracking-tight mb-4">
              No products found
            </p>
            <p className="font-sans text-sm text-obsidian/20 mb-10 max-w-xs text-center leading-relaxed">
              Try adjusting your filters or add a new product to the catalog.
            </p>
            <button
              onClick={() => { setCatFilter('all'); setActiveFilter('all'); setSearch('') }}
              className="px-12 py-4 border border-obsidian/10 rounded-full font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-obsidian/40 hover:text-obsidian hover:border-obsidian/30 transition-all hover:bg-obsidian/5"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Edit drawer */}
      {editingProduct && (
        <ProductEditDrawer
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSubmit={handleUpdate}
          isPending={isPending}
          onRefresh={async () => {
            const updated = await getProducts()
            setProducts(updated)
            const refreshed = updated.find((p: any) => p.id === editingProduct.id)
            if (refreshed) setEditingProduct(refreshed)
          }}
        />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// CLAIMS TAB
// ═══════════════════════════════════════════════════════
function ClaimsTab() {
  const [claims, setClaims] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [resolveId, setResolveId] = useState<string | null>(null)
  const [resolveNotes, setResolveNotes] = useState('')
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    getClaims().then(d => { setClaims(d); setLoading(false) })
  }, [])

  const handleResolve = () => {
    if (!resolveId) return
    startTransition(async () => {
      await resolveClaim(resolveId, resolveNotes)
      setClaims(prev => prev.map(c => c.id === resolveId ? { ...c, status: 'resolved' } : c))
      setResolveId(null)
      setResolveNotes('')
    })
  }

  if (loading) return <LoadingSkeleton />

  if (claims.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🛡️</div>
        <h3 className="font-serif text-2xl text-[#1c1c1c] font-light">No claims</h3>
        <p className="text-[#1c1c1c]/40 font-sans mt-2 font-light">All disputes have been handled</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {claims.map((claim: any) => (
        <div key={claim.id} className="border border-[#1c1c1c]/5 rounded-lg p-5 hover:border-[#1c1c1c]/10 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-serif text-lg text-[#1c1c1c] font-light">{claim.reason}</h3>
              <p className="font-sans text-xs text-[#1c1c1c]/30 mt-1 font-light">
                Order #{claim.order_id?.slice(0, 8)} · {claim.orders?.listings?.title || 'Unknown listing'}
              </p>
              {claim.description && <p className="font-sans text-sm text-[#1c1c1c]/40 mt-2 font-light">{claim.description}</p>}
            </div>
            <StatusBadge status={claim.status} />
          </div>
          {claim.status === 'open' && (
            <div className="mt-4 pt-4 border-t border-[#1c1c1c]/5">
              {resolveId === claim.id ? (
                <div>
                  <textarea value={resolveNotes} onChange={e => setResolveNotes(e.target.value)} placeholder="Resolution notes..." className="w-full bg-[#1c1c1c]/[0.03] border border-[#1c1c1c]/10 rounded-xl px-4 py-3 font-sans text-sm text-[#1c1c1c] placeholder:text-[#1c1c1c]/25 focus:outline-none focus:border-[#1c1c1c]/30 min-h-[60px]" />
                  <div className="flex gap-2 mt-2">
                    <button onClick={handleResolve} disabled={isPending} className="bg-emerald-600 text-white px-5 py-2 rounded-full font-sans text-[10px] font-bold uppercase tracking-[0.15em]">Resolve</button>
                    <button onClick={() => setResolveId(null)} className="text-[#1c1c1c]/30 font-sans text-xs font-light hover:text-[#1c1c1c]">Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setResolveId(claim.id)} className="font-sans text-[13px] font-light text-[#1c1c1c]/40 hover:text-[#1c1c1c] transition-colors">
                  Resolve Claim →
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════
const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-[#1c1c1c]/[0.04] text-[#1c1c1c]/40 border border-[#1c1c1c]/10',
  pending_review: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  rejected: 'bg-red-50 text-red-600 border border-red-200',
  sold: 'bg-blue-50 text-blue-700 border border-blue-200',
  archived: 'bg-[#1c1c1c]/[0.03] text-[#1c1c1c]/30 border border-[#1c1c1c]/5',
  open: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  under_review: 'bg-blue-50 text-blue-600 border border-blue-200',
  resolved: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  dismissed: 'bg-[#1c1c1c]/[0.03] text-[#1c1c1c]/30 border border-[#1c1c1c]/5',
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`${STATUS_STYLES[status] || 'bg-[#1c1c1c]/[0.04] text-[#1c1c1c]/40 border border-[#1c1c1c]/10'} text-[9px] px-2.5 py-1 rounded-full font-sans font-bold uppercase tracking-[0.1em]`}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="border border-[#1c1c1c]/5 rounded-lg p-5 animate-pulse">
          <div className="h-4 bg-[#1c1c1c]/[0.06] rounded w-1/3 mb-3" />
          <div className="h-3 bg-[#1c1c1c]/[0.04] rounded w-1/2" />
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// MAIN ADMIN PAGE
// ═══════════════════════════════════════════════════════
export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('overview')
  const [authorized, setAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    getAdminStats()
      .then(() => setAuthorized(true))
      .catch(() => setAuthorized(false))
  }, [])

  if (authorized === null) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse font-sans text-[#1c1c1c]/30">Verifying access...</div>
      </div>
    )
  }

  if (authorized === false) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="font-serif text-3xl text-[#1c1c1c] mb-2">Access Denied</h1>
          <p className="text-[#1c1c1c]/40 font-sans mb-6 font-light">You need admin or moderator privileges to access this page.</p>
          <Link href="/dashboard" className="font-sans text-[13px] font-light uppercase tracking-[0.08em] text-[#1c1c1c]/40 hover:text-[#1c1c1c] transition-colors">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'overview', label: 'Overview', icon: '📊' },
    { key: 'moderation', label: 'Moderation', icon: '⏳' },
    { key: 'listings', label: 'All Listings', icon: '👗' },
    { key: 'users', label: 'Users', icon: '👥' },
    { key: 'products', label: 'Catalog', icon: '📦' },
    { key: 'claims', label: 'Claims', icon: '🛡️' },
  ]

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-[#1c1c1c]/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-serif text-2xl tracking-[0.3em] text-[#1c1c1c] font-light">
              RE:GALIA
            </Link>
            <span className="bg-[#1c1c1c] text-white text-[9px] px-3 py-1 rounded-full font-sans uppercase tracking-[0.15em] font-bold">Admin</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="font-sans text-[13px] font-light uppercase tracking-[0.08em] text-[#1c1c1c]/40 hover:text-[#1c1c1c] transition-colors">
              Dashboard
            </Link>
            <Link href="/shop" className="font-sans text-[13px] font-light uppercase tracking-[0.08em] text-[#1c1c1c]/40 hover:text-[#1c1c1c] transition-colors">
              Shop
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="font-serif text-4xl text-[#1c1c1c] mb-8 font-light">Admin Center</h1>

        <div className="flex gap-1 mb-8 border-b border-[#1c1c1c]/5 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`px-5 py-3 font-sans text-sm font-light whitespace-nowrap transition-colors relative ${tab === t.key ? 'text-[#1c1c1c]' : 'text-[#1c1c1c]/30 hover:text-[#1c1c1c]/60'}`}>
              <span className="mr-1.5">{t.icon}</span>
              {t.label}
              {tab === t.key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1c1c1c]" />}
            </button>
          ))}
        </div>

        {tab === 'overview' && <OverviewTab />}
        {tab === 'moderation' && <ModerationTab />}
        {tab === 'listings' && <AllListingsTab />}
        {tab === 'users' && <UsersTab />}
        {tab === 'products' && <ProductsTab />}
        {tab === 'claims' && <ClaimsTab />}
      </div>
    </div>
  )
}
