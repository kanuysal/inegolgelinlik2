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
    { label: 'Pending Review', value: stats.pendingReview, color: 'text-yellow-400', icon: '⏳' },
    { label: 'Total Listings', value: stats.totalListings, color: 'text-champagne', icon: '👗' },
    { label: 'Total Orders', value: stats.totalOrders, color: 'text-emerald-400', icon: '📦' },
    { label: 'Total Users', value: stats.totalUsers, color: 'text-blue-400', icon: '👥' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map(c => (
        <div key={c.label} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 text-center">
          <div className="text-3xl mb-2">{c.icon}</div>
          <p className={`font-serif text-3xl ${c.color}`}>{c.value}</p>
          <p className="font-sans text-xs text-zinc-500 uppercase tracking-wider mt-1">{c.label}</p>
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
        <h3 className="font-serif text-2xl text-champagne">All clear</h3>
        <p className="text-zinc-400 font-sans mt-2">No listings pending review</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="font-sans text-sm text-yellow-400 mb-4">⏳ {pending.length} listing{pending.length !== 1 ? 's' : ''} awaiting review</p>
      {pending.map((listing: any) => (
        <div key={listing.id} className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-5">
          <div className="flex gap-5">
            <div className="flex gap-2 flex-shrink-0">
              {listing.images?.slice(0, 3).map((img: string, i: number) => (
                <div key={i} className="w-20 h-20 bg-zinc-800 rounded-lg overflow-hidden">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
              {(!listing.images || listing.images.length === 0) && (
                <div className="w-20 h-20 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-600">👗</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-serif text-xl text-champagne">{listing.title}</h3>
              <p className="font-sans text-xs text-zinc-500 mt-1">
                By {listing.profiles?.display_name || listing.profiles?.full_name || 'Unknown'} · {listing.category} · Size {listing.size_us || '—'} · ${listing.price?.toLocaleString()}
              </p>
              {listing.description && (
                <p className="font-sans text-sm text-zinc-400 mt-2 line-clamp-2">{listing.description}</p>
              )}
              <div className="flex gap-3 mt-4">
                <button onClick={() => handleApprove(listing.id)} disabled={isPending} className="bg-emerald-600 text-white px-5 py-2 rounded-lg font-sans text-xs uppercase tracking-widest hover:bg-emerald-500 transition-colors disabled:opacity-50">
                  ✓ Approve
                </button>
                <button onClick={() => setRejectId(listing.id)} disabled={isPending} className="bg-red-600/20 text-red-400 px-5 py-2 rounded-lg font-sans text-xs uppercase tracking-widest hover:bg-red-600/30 transition-colors border border-red-600/30">
                  ✕ Reject
                </button>
              </div>
            </div>
          </div>

          {/* Rejection modal inline */}
          {rejectId === listing.id && (
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Reason for rejection (required)..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 font-sans text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-500 min-h-[80px]"
              />
              <div className="flex gap-2 mt-3">
                <button onClick={handleReject} disabled={!rejectReason.trim() || isPending} className="bg-red-600 text-white px-5 py-2 rounded-lg font-sans text-xs uppercase tracking-widest hover:bg-red-500 disabled:opacity-50">
                  Confirm Rejection
                </button>
                <button onClick={() => { setRejectId(null); setRejectReason('') }} className="text-zinc-400 font-sans text-xs hover:text-zinc-300">
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
          <button key={s} onClick={() => setFilter(s)} className={`px-4 py-1.5 rounded-full font-sans text-xs uppercase tracking-wider transition-colors ${filter === s ? 'bg-gold-muted text-obsidian' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>
      {loading ? <LoadingSkeleton /> : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="pb-3 font-sans text-xs uppercase tracking-wider text-zinc-500">Title</th>
                <th className="pb-3 font-sans text-xs uppercase tracking-wider text-zinc-500">Seller</th>
                <th className="pb-3 font-sans text-xs uppercase tracking-wider text-zinc-500">Price</th>
                <th className="pb-3 font-sans text-xs uppercase tracking-wider text-zinc-500">Status</th>
                <th className="pb-3 font-sans text-xs uppercase tracking-wider text-zinc-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {listings.map((l: any) => (
                <tr key={l.id} className="hover:bg-zinc-800/30">
                  <td className="py-3 font-serif text-champagne">{l.title}</td>
                  <td className="py-3 font-sans text-sm text-zinc-400">{l.profiles?.display_name || l.profiles?.full_name || '—'}</td>
                  <td className="py-3 font-sans text-sm text-zinc-300">${l.price?.toLocaleString()}</td>
                  <td className="py-3"><StatusBadge status={l.status} /></td>
                  <td className="py-3 font-sans text-xs text-zinc-500">{new Date(l.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {listings.length === 0 && <p className="text-center text-zinc-500 py-8 font-sans">No listings match this filter</p>}
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
          <tr className="border-b border-zinc-800">
            <th className="pb-3 font-sans text-xs uppercase tracking-wider text-zinc-500">User</th>
            <th className="pb-3 font-sans text-xs uppercase tracking-wider text-zinc-500">Joined</th>
            <th className="pb-3 font-sans text-xs uppercase tracking-wider text-zinc-500">Role</th>
            <th className="pb-3 font-sans text-xs uppercase tracking-wider text-zinc-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/50">
          {users.map((u: any) => (
            <tr key={u.id} className="hover:bg-zinc-800/30">
              <td className="py-3">
                <p className="font-serif text-champagne">{u.display_name || u.full_name || 'No name'}</p>
                <p className="font-sans text-xs text-zinc-500">{u.id.slice(0, 8)}...</p>
              </td>
              <td className="py-3 font-sans text-xs text-zinc-500">{new Date(u.created_at).toLocaleDateString()}</td>
              <td className="py-3">
                <span className={`text-xs font-sans px-2.5 py-1 rounded-full ${
                  u.roles?.includes('admin') ? 'bg-red-600/20 text-red-400' :
                  u.roles?.includes('moderator') ? 'bg-blue-600/20 text-blue-400' :
                  'bg-zinc-700 text-zinc-400'
                }`}>
                  {u.roles?.includes('admin') ? 'Admin' : u.roles?.includes('moderator') ? 'Moderator' : 'User'}
                </span>
              </td>
              <td className="py-3">
                <select
                  value={u.roles?.includes('admin') ? 'admin' : u.roles?.includes('moderator') ? 'moderator' : 'user'}
                  onChange={e => handleRoleChange(u.id, e.target.value as any)}
                  disabled={isPending}
                  className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 font-sans text-xs text-white"
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
// PRODUCT FORM (shared between create & edit)
// ═══════════════════════════════════════════════════════
const inputClass = "bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 font-sans text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-gold-muted"

function ProductForm({ product, onSubmit, onCancel, isPending }: {
  product?: any
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  isPending: boolean
}) {
  return (
    <form onSubmit={onSubmit} className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-6 mb-6 grid grid-cols-2 gap-4">
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
      <div className="col-span-2 flex gap-3">
        <button type="submit" disabled={isPending} className="bg-gold-muted text-obsidian px-8 py-3 font-sans text-xs uppercase tracking-widest hover:bg-champagne transition-colors disabled:opacity-50">
          {isPending ? 'Saving...' : product ? 'Save Changes' : 'Create Product'}
        </button>
        <button type="button" onClick={onCancel} className="px-6 py-3 font-sans text-xs uppercase tracking-widest text-zinc-400 hover:text-zinc-200 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  )
}

// ═══════════════════════════════════════════════════════
// PRODUCTS CATALOG TAB
// ═══════════════════════════════════════════════════════
function ProductsTab() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any | null>(null)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
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
        setEditingProduct(null)
        await refresh()
      }
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteProduct(id)
      if (res.success) {
        setConfirmDelete(null)
        setProducts(prev => prev.filter(p => p.id !== id))
      }
    })
  }

  const handleToggle = (id: string, current: boolean) => {
    startTransition(async () => {
      const res = await toggleProductActive(id, !current)
      if (res.success) {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p))
      }
    })
  }

  if (loading) return <LoadingSkeleton />

  const filtered = products.filter(p => {
    const matchSearch = !search || p.style_name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase())
    const matchCat = catFilter === 'all' || p.category === catFilter
    const matchActive = activeFilter === 'all' || (activeFilter === 'active' ? p.is_active : !p.is_active)
    return matchSearch && matchCat && matchActive
  })

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or SKU..."
          className={`flex-1 ${inputClass}`}
        />
        <div className="flex gap-2">
          {['all', 'bridal', 'evening', 'accessories'].map(c => (
            <button key={c} onClick={() => setCatFilter(c)} className={`px-4 py-2 rounded-full font-sans text-xs uppercase tracking-wider transition-colors ${catFilter === c ? 'bg-gold-muted text-obsidian' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'inactive'] as const).map(s => (
            <button key={s} onClick={() => setActiveFilter(s)} className={`px-4 py-2 rounded-full font-sans text-xs uppercase tracking-wider transition-colors ${activeFilter === s ? 'bg-gold-muted text-obsidian' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Stats + Add button */}
      <div className="flex justify-between items-center mb-6">
        <p className="font-sans text-zinc-400 text-sm">
          {filtered.length} of {products.length} products
        </p>
        <button onClick={() => { setShowForm(!showForm); setEditingProduct(null) }} className="bg-gold-muted text-obsidian px-5 py-2 rounded-lg font-sans text-xs uppercase tracking-widest hover:bg-champagne transition-colors">
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {/* Create form */}
      {showForm && !editingProduct && (
        <ProductForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} isPending={isPending} />
      )}

      {/* Edit form */}
      {editingProduct && (
        <ProductForm product={editingProduct} onSubmit={handleUpdate} onCancel={() => setEditingProduct(null)} isPending={isPending} />
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="pb-3 font-sans text-xs uppercase tracking-wider text-zinc-500">Style</th>
              <th className="pb-3 font-sans text-xs uppercase tracking-wider text-zinc-500">SKU</th>
              <th className="pb-3 font-sans text-xs uppercase tracking-wider text-zinc-500">Category</th>
              <th className="pb-3 font-sans text-xs uppercase tracking-wider text-zinc-500">Silhouette</th>
              <th className="pb-3 font-sans text-xs uppercase tracking-wider text-zinc-500">MSRP</th>
              <th className="pb-3 font-sans text-xs uppercase tracking-wider text-zinc-500">Active</th>
              <th className="pb-3 font-sans text-xs uppercase tracking-wider text-zinc-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {filtered.map((p: any) => (
              <tr key={p.id} className={`hover:bg-zinc-800/30 ${!p.is_active ? 'opacity-50' : ''}`}>
                <td className="py-3 font-serif text-champagne">{p.style_name}</td>
                <td className="py-3 font-sans text-xs text-zinc-400">{p.sku || '—'}</td>
                <td className="py-3 font-sans text-xs text-zinc-400 capitalize">{p.category}</td>
                <td className="py-3 font-sans text-xs text-zinc-400 capitalize">{p.silhouette?.replace(/_/g, ' ') || '—'}</td>
                <td className="py-3 font-sans text-sm text-zinc-300">{p.msrp ? `$${Number(p.msrp).toLocaleString()}` : '—'}</td>
                <td className="py-3">
                  <button
                    onClick={() => handleToggle(p.id, p.is_active)}
                    disabled={isPending}
                    className="group relative"
                    title={p.is_active ? 'Click to deactivate' : 'Click to activate'}
                  >
                    {p.is_active
                      ? <span className="text-emerald-400 group-hover:text-emerald-300">&#9679;</span>
                      : <span className="text-zinc-600 group-hover:text-zinc-400">&#9679;</span>
                    }
                  </button>
                </td>
                <td className="py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => { setEditingProduct(p); setShowForm(false) }}
                      className="text-zinc-500 hover:text-champagne font-sans text-xs transition-colors px-2 py-1 rounded hover:bg-zinc-800"
                    >
                      Edit
                    </button>
                    {confirmDelete === p.id ? (
                      <span className="flex items-center gap-1">
                        <button onClick={() => handleDelete(p.id)} disabled={isPending} className="text-red-400 hover:text-red-300 font-sans text-xs px-2 py-1 rounded bg-red-600/10 hover:bg-red-600/20">
                          Confirm
                        </button>
                        <button onClick={() => setConfirmDelete(null)} className="text-zinc-500 font-sans text-xs px-2 py-1">
                          Cancel
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(p.id)}
                        className="text-zinc-600 hover:text-red-400 font-sans text-xs transition-colors px-2 py-1 rounded hover:bg-zinc-800"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-zinc-500 py-8 font-sans">No products match your filters</p>}
      </div>
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
        <h3 className="font-serif text-2xl text-champagne">No claims</h3>
        <p className="text-zinc-400 font-sans mt-2">All disputes have been handled</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {claims.map((claim: any) => (
        <div key={claim.id} className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-serif text-lg text-champagne">{claim.reason}</h3>
              <p className="font-sans text-xs text-zinc-500 mt-1">
                Order #{claim.order_id?.slice(0, 8)} · {claim.orders?.listings?.title || 'Unknown listing'}
              </p>
              {claim.description && <p className="font-sans text-sm text-zinc-400 mt-2">{claim.description}</p>}
            </div>
            <StatusBadge status={claim.status} />
          </div>
          {claim.status === 'open' && (
            <div className="mt-4 pt-4 border-t border-zinc-800">
              {resolveId === claim.id ? (
                <div>
                  <textarea value={resolveNotes} onChange={e => setResolveNotes(e.target.value)} placeholder="Resolution notes..." className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 font-sans text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-gold-muted min-h-[60px]" />
                  <div className="flex gap-2 mt-2">
                    <button onClick={handleResolve} disabled={isPending} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-sans text-xs uppercase tracking-widest">Resolve</button>
                    <button onClick={() => setResolveId(null)} className="text-zinc-400 font-sans text-xs">Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setResolveId(claim.id)} className="text-gold-muted font-sans text-xs hover:text-champagne transition-colors">
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
const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-zinc-600', pending_review: 'bg-yellow-600', approved: 'bg-emerald-600',
  rejected: 'bg-red-600', sold: 'bg-blue-600', archived: 'bg-zinc-500',
  open: 'bg-yellow-600', under_review: 'bg-blue-500', resolved: 'bg-emerald-600', dismissed: 'bg-zinc-500',
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`${STATUS_COLORS[status] || 'bg-zinc-600'} text-white text-xs px-2.5 py-1 rounded-full font-sans uppercase tracking-wider`}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-5 animate-pulse">
          <div className="h-4 bg-zinc-800 rounded w-1/3 mb-3" />
          <div className="h-3 bg-zinc-800 rounded w-1/2" />
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
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <div className="animate-pulse font-sans text-zinc-500">Verifying access...</div>
      </div>
    )
  }

  if (authorized === false) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="font-serif text-3xl text-champagne mb-2">Access Denied</h1>
          <p className="text-zinc-400 font-sans mb-6">You need admin or moderator privileges to access this page.</p>
          <Link href="/dashboard" className="text-gold-muted font-sans text-sm hover:text-champagne transition-colors">
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
    <div className="min-h-screen bg-obsidian">
      <header className="border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-serif text-2xl tracking-[0.3em] text-champagne">
              RE:GALIA
            </Link>
            <span className="bg-red-600/20 text-red-400 text-xs px-2.5 py-1 rounded-full font-sans uppercase tracking-wider">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="font-sans text-xs uppercase tracking-widest text-zinc-400 hover:text-champagne transition-colors">
              Dashboard
            </Link>
            <Link href="/shop" className="font-sans text-xs uppercase tracking-widest text-zinc-400 hover:text-champagne transition-colors">
              Shop
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="font-serif text-4xl text-champagne mb-8">Admin Center</h1>

        <div className="flex gap-1 mb-8 border-b border-zinc-800 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`px-5 py-3 font-sans text-sm whitespace-nowrap transition-colors relative ${tab === t.key ? 'text-champagne' : 'text-zinc-500 hover:text-zinc-300'}`}>
              <span className="mr-1.5">{t.icon}</span>
              {t.label}
              {tab === t.key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-muted" />}
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
