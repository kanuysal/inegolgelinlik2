"use client";

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
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
} from './actions';

type Tab = 'dashboard' | 'moderation' | 'inventory' | 'sellers' | 'transactions' | 'claims';

// ═══════════════════════════════════════════════════════
// OVERVIEW TAB (Dashboard)
// ═══════════════════════════════════════════════════════
function OverviewTab() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    getAdminStats().then(setStats).catch(() => setStats(null));
  }, []);

  if (!stats) return <LoadingSkeleton />;

  return (
    <div className="p-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#111] p-6 border border-slate-200 dark:border-slate-800 relative group">
          <p className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-4">Pending Review</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-light font-display">{stats.pendingReview || 0}</h3>
            <span className="text-[10px] text-slate-400">Submissions</span>
          </div>
        </div>
        <div className="bg-white dark:bg-[#111] p-6 border border-slate-200 dark:border-slate-800">
          <p className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-4">Total Listings</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-light font-display">{stats.totalListings || 0}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-[#111] p-6 border border-slate-200 dark:border-slate-800">
          <p className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-4">Total Orders</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-light font-display">{stats.totalOrders || 0}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-[#111] p-6 border border-slate-200 dark:border-slate-800">
          <p className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-4">Total Users</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-light font-display text-blue-500">{stats.totalUsers || 0}</h3>
          </div>
        </div>
      </div>
      
      {/* Rest of Overview (Placeholder charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-xl font-medium tracking-tight">Recent Activity</h2>
          <div className="relative space-y-8 before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:via-slate-200 before:to-transparent dark:before:from-slate-800 dark:before:via-slate-800">
            <div className="relative flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-[#111] ring-1 ring-slate-200 dark:ring-slate-800">
                  <span className="material-symbols-outlined text-sm text-accent">add_circle</span>
                </div>
                <div>
                  <p className="text-[13px] font-medium">Dashboard Loaded</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">Just now</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium tracking-tight">System Status</h2>
          </div>
          <div className="bg-white dark:bg-[#111] p-8 border border-slate-200 dark:border-slate-800 flex items-center justify-center h-64">
            <p className="text-slate-400 font-sans text-sm">All systems nominal</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MODERATION TAB
// ═══════════════════════════════════════════════════════
function ModerationTab() {
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Other');
  const [rejectDetails, setRejectDetails] = useState('');
  const [activeItem, setActiveItem] = useState<any | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getPendingListings().then(d => {
      setPending(d);
      if (d.length > 0) setActiveItem(d[0]);
      setLoading(false);
    });
  }, []);

  const handleApprove = (id: string) => {
    startTransition(async () => {
      const res = await approveListing(id);
      if (res.success) {
        const remaining = pending.filter(l => l.id !== id);
        setPending(remaining);
        if (activeItem?.id === id) setActiveItem(remaining[0] || null);
      }
    });
  };

  const handleReject = () => {
    if (!rejectId) return;
    const finalReason = rejectDetails ? `${rejectReason}: ${rejectDetails}` : rejectReason;
    startTransition(async () => {
      const res = await rejectListing(rejectId, finalReason);
      if (res.success) {
        const remaining = pending.filter(l => l.id !== rejectId);
        setPending(remaining);
        if (activeItem?.id === rejectId) setActiveItem(remaining[0] || null);
        setRejectId(null);
        setRejectDetails('');
      }
    });
  };

  if (loading) return <div className="p-8"><LoadingSkeleton /></div>;

  if (pending.length === 0) {
    return (
      <div className="text-center py-40">
        <div className="text-5xl mb-4 text-emerald-500">
          <span className="material-symbols-outlined text-6xl">check_circle</span>
        </div>
        <h3 className="text-xl font-medium tracking-tight">Queue Empty</h3>
        <p className="text-slate-500 text-sm mt-2">All listings have been reviewed</p>
      </div>
    );
  }

  return (
    <div className="p-8 flex gap-8">
      {/* Sidebar List */}
      <section className="w-1/3 space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-medium tracking-tight">Pending Approval</h2>
          <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em]">{pending.length} Items Remaining</span>
        </div>
        
        <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-200px)] custom-scrollbar pr-2">
          {pending.map(listing => (
            <div 
              key={listing.id}
              onClick={() => setActiveItem(listing)}
              className={`p-4 bg-white dark:bg-[#111] transition-all cursor-pointer ${
                activeItem?.id === listing.id 
                  ? 'border-l-2 border-accent shadow-sm ring-1 ring-slate-200 dark:ring-slate-800'
                  : 'border-l-2 border-transparent hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex gap-4">
                <div className="w-16 h-20 bg-slate-100 dark:bg-slate-800 rounded flex-shrink-0 overflow-hidden">
                  {listing.images?.[0] ? (
                    <img src={listing.images[0]} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">👗</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1 truncate">ID: {listing.id.slice(0,8)}</p>
                    {activeItem?.id === listing.id && (
                      <span className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[9px] px-1.5 py-0.5 font-bold uppercase tracking-wider">Review</span>
                    )}
                  </div>
                  <p className="text-sm font-medium truncate">{listing.title}</p>
                  <p className="text-xs text-slate-500 mt-1 truncate">Seller: {listing.profiles?.display_name || listing.profiles?.full_name || 'Unknown'}</p>
                  <p className="text-[10px] text-slate-400 mt-2 italic">{new Date(listing.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Detail View */}
      <section className="flex-1">
        {activeItem ? (
          <div className="bg-white dark:bg-[#111] shadow-xl ring-1 ring-slate-200 dark:ring-slate-800 min-h-[80vh] flex flex-col">
            {/* Detail Header */}
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-end">
              <div>
                <p className="text-[11px] text-slate-400 tracking-[0.3em] uppercase mb-2">Submission Details • {activeItem.id.slice(0,8)}</p>
                <h2 className="text-4xl font-light mb-2">{activeItem.title}</h2>
                <div className="flex gap-4 text-xs">
                  <span className="flex items-center gap-1 text-slate-500"><span className="material-symbols-outlined text-sm">sell</span> Asking: ${activeItem.price?.toLocaleString()}</span>
                  <span className="flex items-center gap-1 text-slate-500"><span className="material-symbols-outlined text-sm">category</span> {activeItem.category}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  disabled={isPending}
                  className="px-6 py-3 bg-red-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-50" 
                  onClick={() => setRejectId(activeItem.id)}
                >
                  Reject
                </button>
                <button 
                  disabled={isPending}
                  className="px-8 py-3 bg-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors disabled:opacity-50"
                  onClick={() => handleApprove(activeItem.id)}
                >
                  Approve Listing
                </button>
              </div>
            </div>
            
            <div className="flex-1 grid grid-cols-2 gap-px bg-slate-100 dark:bg-slate-800">
              {/* Images */}
              <div className="bg-white dark:bg-[#111] p-8">
                <h3 className="text-xs font-bold tracking-widest uppercase mb-6 text-slate-400">Imagery Verification</h3>
                <div className="grid grid-cols-2 gap-4">
                  {activeItem.images?.[0] && (
                    <img src={activeItem.images[0]} alt="Front view" className="aspect-[3/4] object-cover w-full grayscale-[0.3] hover:grayscale-0 transition-all duration-700" />
                  )}
                  <div className="space-y-4">
                    {activeItem.images?.[1] && (
                      <img src={activeItem.images[1]} alt="Detail 1" className="aspect-[3/4] object-cover w-full grayscale-[0.3] hover:grayscale-0 transition-all duration-700" />
                    )}
                    {(activeItem.images?.length || 0) > 2 && (
                      <div className="aspect-[3/4] bg-slate-50 dark:bg-white/5 flex flex-col items-center justify-center text-slate-400 rounded">
                        <span className="material-symbols-outlined mb-2">image</span>
                        <span className="text-[10px] uppercase tracking-widest">+{activeItem.images.length - 2} More Photos</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {activeItem.description && (
                  <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-bold tracking-widest uppercase mb-4 text-slate-400">Seller Note</h3>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 italic">
                      "{activeItem.description}"
                    </p>
                  </div>
                )}
              </div>
              
              {/* Specs & Seller Info */}
              <div className="bg-white dark:bg-[#111] p-8 space-y-8 overflow-y-auto">
                <div>
                  <h3 className="text-xs font-bold tracking-widest uppercase mb-4 text-slate-400">Specifications</h3>
                  <div className="grid grid-cols-2 gap-y-4">
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                      <p className="text-[10px] uppercase text-slate-400 mb-1">Color Options</p>
                      <p className="text-sm font-medium">{activeItem.color_options || '—'}</p>
                    </div>
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                      <p className="text-[10px] uppercase text-slate-400 mb-1">Condition</p>
                      <p className="text-sm font-medium">{activeItem.condition || '—'}</p>
                    </div>
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                      <p className="text-[10px] uppercase text-slate-400 mb-1">Year Purchased</p>
                      <p className="text-sm font-medium">{activeItem.year_purchased || '—'}</p>
                    </div>
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                      <p className="text-[10px] uppercase text-slate-400 mb-1">Status</p>
                      <p className="text-sm font-medium capitalize">{activeItem.status?.replace('_', ' ') || '—'}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xs font-bold tracking-widest uppercase mb-4 text-slate-400">Seller Information</h3>
                  <div className="flex items-center gap-4 p-4 border border-slate-100 dark:border-slate-800 rounded">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-display text-lg">
                      {(activeItem.profiles?.display_name || activeItem.profiles?.full_name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{activeItem.profiles?.display_name || activeItem.profiles?.full_name || 'Unknown'}</p>
                      <p className="text-xs text-slate-500">ID: {activeItem.seller_id.slice(0, 8)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {/* Reject Modal */}
      {rejectId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111] w-full max-w-md p-8 shadow-2xl">
            <h3 className="text-2xl font-display mb-4">Rejection Reason</h3>
            <p className="text-xs text-slate-500 mb-6 uppercase tracking-wider">Please specify why this listing cannot be approved. This message will be sent to the seller.</p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Reason Category</label>
                <select 
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-800 text-sm py-2 px-3 focus:ring-accent focus:border-accent"
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                >
                  <option>Insufficient Image Quality</option>
                  <option>Verification Documents Missing</option>
                  <option>Non-Galia Lahav Product</option>
                  <option>Condition Not Meeting Standards</option>
                  <option>Pricing Discrepancy</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Detailed Message</label>
                <textarea 
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-800 text-sm p-3 focus:ring-accent focus:border-accent placeholder:text-slate-400" 
                  placeholder="Provide additional details..." 
                  rows={4}
                  value={rejectDetails}
                  onChange={e => setRejectDetails(e.target.value)}
                />
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-2 gap-4">
              <button 
                className="py-3 border border-slate-300 dark:border-slate-700 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/5" 
                onClick={() => {setRejectId(null); setRejectDetails('');}}
                disabled={isPending}
              >
                Cancel
              </button>
              <button 
                className="py-3 bg-red-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-red-700 disabled:opacity-50"
                onClick={handleReject}
                disabled={isPending}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// TRANSACTIONS & LISTINGS TAB (Combined visually)
// ═══════════════════════════════════════════════════════
function TransactionsTab({ mode }: { mode: 'all' | 'transactions' }) {
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAllListings(filter).then(d => { setItems(d); setLoading(false); });
  }, [filter]);

  if (loading) return <div className="p-8"><LoadingSkeleton /></div>;

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between gap-4 bg-white dark:bg-[#111] p-4 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
            <input className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-800 focus:ring-1 focus:ring-accent focus:border-accent outline-none" placeholder="Search by details..." type="text"/>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:border-slate-800"></div>
          <select 
            className="bg-transparent border-none text-[10px] font-bold uppercase tracking-widest focus:ring-0 cursor-pointer outline-none"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending_review">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="sold">Sold</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">ID</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Title</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Seller</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Price</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map(l => (
                <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors cursor-pointer group">
                  <td className="px-6 py-4">
                    <span className="text-[11px] font-mono text-slate-400 group-hover:text-accent transition-colors">#{l.id.slice(0, 8)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-medium">{l.title}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{l.category}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs">{l.profiles?.display_name || 'Unknown'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-medium font-mono text-slate-900 dark:text-slate-100">${l.price?.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={l.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="text-[10px] text-slate-400 uppercase tracking-tighter">{new Date(l.created_at).toLocaleDateString()}</p>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">No listings found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// INVENTORY TAB (Catalog sync / products management)
// ═══════════════════════════════════════════════════════
// (Reusing the comprehensive logic we already have, but styling to match Admin)
function InventoryTab() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const refresh = () => getProducts().then(setProducts);

  useEffect(() => {
    refresh().then(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8"><LoadingSkeleton /></div>;

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between gap-4 bg-white dark:bg-[#111] p-4 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
            <input className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-800 focus:ring-1 focus:ring-accent focus:border-accent outline-none" placeholder="Search product catalog..." type="text"/>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            disabled={isPending}
            className="px-4 py-2 bg-[#1c1c1c] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#333] transition-all disabled:opacity-50"
            onClick={() => {
               startTransition(async () => {
                 await bulkImportCatalog();
                 await refresh();
               });
            }}
          >
            Import Missing
          </button>
          <button 
            disabled={isPending}
            className="px-4 py-2 bg-obsidian text-white text-[10px] font-bold uppercase tracking-widest hover:bg-obsidian/80 transition-all disabled:opacity-50"
            onClick={() => {
               startTransition(async () => {
                 await syncCatalogImages();
                 await refresh();
               });
            }}
          >
            Sync Images
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(p => (
          <div key={p.id} className="bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 p-4">
            <div className="aspect-[3/4] bg-slate-100 rounded overflow-hidden mb-4 relative">
              {p.images?.[0] ? (
                 <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">No Image</div>
              )}
              <div className="absolute top-2 left-2 flex gap-1">
                <span className="bg-white/90 backdrop-blur px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider shadow-sm">{p.category}</span>
              </div>
            </div>
            <p className="font-serif text-lg truncate mb-1">{p.style_name}</p>
            <div className="flex justify-between items-center text-xs text-slate-500">
               <span>{p.sku || 'No SKU'}</span>
               <button 
                 disabled={isPending}
                 onClick={() => {
                    startTransition(async () => {
                       await toggleProductActive(p.id, !p.is_active);
                       await refresh();
                    })
                 }}
                 className={`text-[10px] uppercase tracking-widest font-bold ${p.is_active ? 'text-emerald-500' : 'text-red-500'}`}
               >
                 {p.is_active ? 'Active' : 'Hidden'}
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// USERS/SELLERS TAB
// ═══════════════════════════════════════════════════════
function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getUsers().then(d => { setUsers(d); setLoading(false); });
  }, []);

  const handleRoleChange = (userId: string, role: 'user' | 'moderator' | 'admin') => {
    startTransition(async () => {
      await setUserRole(userId, role);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, roles: role === 'user' ? ['user'] : [role] } : u));
    });
  };

  if (loading) return <div className="p-8"><LoadingSkeleton /></div>;

  return (
    <div className="p-8 space-y-8">
      <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">User / Seller</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Joined Date</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Current Role</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u: any) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-xs font-medium">{u.display_name || u.full_name || 'No name'}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">ID: {u.id.slice(0, 8)}</p>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm ${
                      u.roles?.includes('admin') ? 'bg-purple-100 text-purple-700' :
                      u.roles?.includes('moderator') ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {u.roles?.includes('admin') ? 'Admin' : u.roles?.includes('moderator') ? 'Moderator' : 'User'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      className="bg-transparent border border-slate-200 rounded text-xs py-1 px-2 focus:border-accent outline-none"
                      value={u.roles?.includes('admin') ? 'admin' : u.roles?.includes('moderator') ? 'moderator' : 'user'}
                      onChange={e => handleRoleChange(u.id, e.target.value as any)}
                      disabled={isPending}
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
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// CLAIMS TAB
// ═══════════════════════════════════════════════════════
function ClaimsTab() {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolveId, setResolveId] = useState<string | null>(null);
  const [resolveNotes, setResolveNotes] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getClaims().then(d => { setClaims(d); setLoading(false); });
  }, []);

  const handleResolve = () => {
    if (!resolveId) return;
    startTransition(async () => {
      await resolveClaim(resolveId, resolveNotes);
      setClaims(prev => prev.map(c => c.id === resolveId ? { ...c, status: 'resolved' } : c));
      setResolveId(null);
      setResolveNotes('');
    });
  };

  if (loading) return <div className="p-8"><LoadingSkeleton /></div>;

  return (
    <div className="p-8 space-y-4">
      {claims.length === 0 ? (
         <div className="text-center py-20 bg-white border border-slate-200">
           <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">shield</span>
           <p className="text-sm text-slate-500 font-medium tracking-wide">No Active Claims</p>
         </div>
      ) : claims.map(claim => (
        <div key={claim.id} className="bg-white border border-slate-200 p-6 flex flex-col gap-4">
          <div className="flex justify-between items-start">
             <div>
               <h3 className="font-serif text-lg">{claim.reason}</h3>
               <p className="text-xs text-slate-500">Order #{claim.order_id?.slice(0, 8)}</p>
             </div>
             <StatusBadge status={claim.status} />
          </div>
          {claim.description && (
             <p className="text-sm text-slate-600">{claim.description}</p>
          )}
          
          {claim.status === 'open' && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              {resolveId === claim.id ? (
                 <div className="space-y-3">
                   <textarea 
                     value={resolveNotes} 
                     onChange={e => setResolveNotes(e.target.value)} 
                     placeholder="Resolution notes..." 
                     className="w-full text-sm p-3 border border-slate-200 bg-slate-50 outline-none focus:border-accent"
                     rows={3}
                   />
                   <div className="flex gap-2">
                     <button disabled={isPending} onClick={handleResolve} className="px-4 py-2 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest disabled:opacity-50">Resolve Claim</button>
                     <button disabled={isPending} onClick={() => setResolveId(null)} className="px-4 py-2 border border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-widest">Cancel</button>
                   </div>
                 </div>
              ) : (
                <button 
                  onClick={() => setResolveId(claim.id)} 
                  className="text-xs text-accent font-medium tracking-wide"
                >
                  Resolve Dispute →
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}


// ═══════════════════════════════════════════════════════
// SHARED UI
// ═══════════════════════════════════════════════════════
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending_review: 'bg-amber-50 text-amber-600',
    approved: 'bg-emerald-50 text-emerald-600',
    rejected: 'bg-red-50 text-red-600',
    sold: 'bg-blue-50 text-blue-600',
    draft: 'bg-slate-50 text-slate-600',
    archived: 'bg-slate-100 text-slate-400',
    open: 'bg-amber-50 text-amber-600',
    resolved: 'bg-emerald-50 text-emerald-600',
  };
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${styles[status] || styles.draft} text-[9px] font-bold uppercase tracking-widest`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-32 bg-slate-100 animate-pulse rounded" />
      <div className="h-32 bg-slate-100 animate-pulse rounded" />
    </div>
  );
}


// ═══════════════════════════════════════════════════════
// MAIN PAGE LAYOUT
// ═══════════════════════════════════════════════════════
export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    getAdminStats()
      .then(() => setAuthorized(true))
      .catch(() => setAuthorized(false));
  }, []);

  if (authorized === null) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse font-sans text-slate-400 tracking-widest uppercase text-sm">Verifying access...</div>
      </div>
    );
  }

  if (authorized === false) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center p-12 bg-white shadow-xl max-w-md">
          <div className="text-4xl mb-4">🔒</div>
          <h1 className="font-serif text-2xl text-slate-900 mb-2">Access Restricted</h1>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">Admin console is restricted to authorized personnel. Return to the marketplace.</p>
          <Link href="/" className="px-8 py-3 bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const handleTab = (t: Tab) => setTab(t);
  
  const T = {
    dashboard: 'Dashboard',
    moderation: 'Moderation Queue',
    inventory: 'Inventory Catalog',
    sellers: 'Sellers & Users',
    transactions: 'All Transactions',
    claims: 'Dispute Claims'
  };

  return (
    <div className="bg-slate-50 dark:bg-[#0a0a0a] min-h-screen">
      {/* Sidebar Layout matched from Stitch */}
      <aside className="fixed left-0 top-0 h-full w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111] z-50 flex flex-col">
        <div className="p-8">
          <h1 className="text-2xl font-medium tracking-widest uppercase border-b border-slate-100 dark:border-slate-800 pb-6 mb-8 cursor-pointer" onClick={() => window.location.href = '/'}>
            Galia Lahav
            <span className="block text-[10px] tracking-[0.3em] mt-1 text-slate-400">ADMIN CONSOLE</span>
          </h1>
          <nav className="space-y-1">
            <button onClick={() => handleTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${tab === 'dashboard' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
              <span className="material-symbols-outlined text-sm">dashboard</span>
              <span className="text-xs font-medium tracking-wider uppercase">Dashboard</span>
            </button>
            <button onClick={() => handleTab('moderation')} className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${tab === 'moderation' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
              <span className="material-symbols-outlined text-sm">verified_user</span>
              <span className="text-xs font-medium tracking-wider uppercase">Moderation</span>
            </button>
            <button onClick={() => handleTab('inventory')} className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${tab === 'inventory' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
              <span className="material-symbols-outlined text-sm">inventory_2</span>
              <span className="text-xs font-medium tracking-wider uppercase">Inventory</span>
            </button>
            <button onClick={() => handleTab('sellers')} className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${tab === 'sellers' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
              <span className="material-symbols-outlined text-sm">people_outline</span>
              <span className="text-xs font-medium tracking-wider uppercase">Sellers</span>
            </button>
            <button onClick={() => handleTab('transactions')} className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${tab === 'transactions' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
              <span className="material-symbols-outlined text-sm">payments</span>
              <span className="text-xs font-medium tracking-wider uppercase">Transactions</span>
            </button>
            <button onClick={() => handleTab('claims')} className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${tab === 'claims' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
              <span className="material-symbols-outlined text-sm">shield</span>
              <span className="text-xs font-medium tracking-wider uppercase">Claims</span>
            </button>
          </nav>
        </div>
        
        <div className="mt-auto w-full p-8 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold">A</div>
            <div>
              <p className="text-xs font-semibold">Admin User</p>
              <Link href="/dashboard" className="text-[10px] text-accent hover:underline uppercase tracking-tighter">Exit Admin</Link>
            </div>
          </div>
        </div>
      </aside>

      <main className="ml-64 min-h-screen flex flex-col">
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#111]/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400 tracking-widest uppercase">Console</span>
            <span className="h-4 w-px bg-slate-200 dark:bg-slate-800"></span>
            <span className="text-xs font-medium uppercase tracking-wider text-slate-800">{T[tab]}</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/" className="material-symbols-outlined text-slate-400 hover:text-primary transition-colors text-sm">storefront</Link>
          </div>
        </header>
        
        <div className="flex-1">
          {tab === 'dashboard' && <OverviewTab />}
          {tab === 'moderation' && <ModerationTab />}
          {tab === 'inventory' && <InventoryTab />}
          {tab === 'sellers' && <UsersTab />}
          {tab === 'transactions' && <TransactionsTab mode="all" />}
          {tab === 'claims' && <ClaimsTab />}
        </div>
      </main>
    </div>
  );
}
