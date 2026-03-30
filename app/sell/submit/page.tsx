'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '@/components/ui/Navbar'
import { searchProducts, submitListing, getCatalogGowns, getSizeDimensions, getProductByName } from './actions'
import { createClient } from '@/lib/supabase/client'

type Product = {
  id: string
  style_name: string
  sku: string | null
  category: string
  silhouette: string | null
  train_style: string | null
  msrp: number | null
  images: string[]
  description: string | null
  stockist_data: any | null
}

type UploadedImage = {
  url: string
  path: string
}

type WizardData = {
  product_id: string | null
  product_name: string
  title: string
  description: string
  category: 'bridal' | 'evening' | 'accessories'
  size_us: string
  size_eu: string
  bust_cm: string
  waist_cm: string
  hips_cm: string
  height_cm: string
  silhouette: string
  train_style: string
  order_number: string
  stock_images: string[]
  condition: '' | 'new_unworn' | 'excellent' | 'good'
  images: UploadedImage[]
  price: string
  msrp: string
  color: string
}

const INITIAL_DATA: WizardData = {
  product_id: null,
  product_name: '',
  title: '',
  description: '',
  category: 'bridal',
  size_us: '',
  size_eu: '',
  bust_cm: '',
  waist_cm: '',
  hips_cm: '',
  height_cm: '',
  silhouette: '',
  train_style: '',
  order_number: '',
  stock_images: [],
  condition: '',
  images: [],
  price: '',
  msrp: '',
  color: 'Ivory'
}

const STEPS = [
  { num: 1, label: '01 Find Gown' },
  { num: 2, label: '02 Details & Size' },
  { num: 3, label: '03 Condition' },
  { num: 4, label: '04 Photos' },
  { num: 5, label: '05 Price' },
]

// Custom dropdown component (replaces native select)
function CustomDropdown({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select...'
}: {
  label?: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find(o => o.value === value)
  const displayText = selectedOption?.label || placeholder

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full bg-transparent border-0 border-b border-gray-200 py-3 px-0 focus:ring-0 focus:border-accent text-sm text-left flex justify-between items-center"
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>{displayText}</span>
        <span className="material-symbols-outlined text-lg text-gray-400">
          {open ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {open && (
        <div
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl z-[100] max-h-72 overflow-y-scroll overscroll-contain"
          onWheel={(e) => e.stopPropagation()}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value)
                setOpen(false)
              }}
              className={`w-full text-left px-5 py-4 text-sm hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 ${value === opt.value ? 'bg-slate-50 font-semibold text-primary' : 'text-slate-700'
                }`}
            >
              <div className="flex justify-between items-center">
                <span>{opt.label}</span>
                {value === opt.value && <span className="material-symbols-outlined text-sm text-primary">check</span>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function SellWizardPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [data, setData] = useState<WizardData>(INITIAL_DATA)
  const [catalogGowns, setCatalogGowns] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [searching, setSearching] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    getCatalogGowns().then(res => {
      if (res.gowns) setCatalogGowns(res.gowns)
    })
  }, [])

  const handleSearch = useCallback(async () => {
    if (searchQuery.length < 2) return
    setSearching(true)
    const result = await searchProducts(searchQuery)
    setSearchResults(result.products as Product[])
    setSearching(false)
  }, [searchQuery])

  // Real-time search: trigger search as user types (debounced)
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      return
    }

    const timeoutId = setTimeout(() => {
      handleSearch()
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [searchQuery, handleSearch])

  async function handleSizeChange(sizeLabel: string) {
    if (sizeLabel === 'Custom' || !sizeLabel) {
      setData(prev => ({ ...prev, size_us: sizeLabel, bust_cm: '', waist_cm: '', hips_cm: '', height_cm: '' }))
      return
    }
    const res = await getSizeDimensions(sizeLabel)
    if (res.dimensions) {
      setData(prev => ({
        ...prev,
        size_us: sizeLabel,
        bust_cm: res.dimensions.bust.toString(),
        waist_cm: res.dimensions.waist.toString(),
        hips_cm: res.dimensions.hips.toString(),
        height_cm: res.dimensions.height_with_shoes.toString()
      }))
    } else {
      setData(prev => ({ ...prev, size_us: sizeLabel }))
    }
  }

  function selectProduct(product: Product) {
    const retailPrice = product.stockist_data?.retailPrice?.amount
    const msrp = product.msrp || retailPrice || null

    setData((prev) => ({
      ...prev,
      product_id: product.id,
      product_name: product.style_name,
      title: product.style_name,
      category: (product.category as any) || 'bridal',
      silhouette: product.silhouette || '',
      train_style: product.train_style || '',
      description: product.description || '',
      msrp: msrp?.toString() || '',
      stock_images: product.images || [],
    }))
    setStep(2)
  }

  function skipToManual() {
    setData((prev) => ({ ...prev, product_id: null, product_name: '' }))
    setStep(2)
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Please sign in to upload photos')
      setUploading(false)
      return
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    const maxSizeBytes = 5 * 1024 * 1024 // 5MB

    for (const file of Array.from(files)) {
      if (data.images.length >= 8) {
        setError('Maximum 8 photos allowed')
        break
      }

       // Basic client-side validation before upload
      if (!allowedTypes.includes(file.type)) {
        setError('Only JPEG, PNG, and WebP images are allowed')
        continue
      }

      if (file.size > maxSizeBytes) {
        setError('Each image must be under 5MB')
        continue
      }

      const ext = file.name.split('.').pop() || 'jpg'
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('listing-images')
        .upload(fileName, file, { cacheControl: '3600', upsert: false })

      if (uploadError) {
        setError('Failed to upload image')
        break
      }

      const { data: { publicUrl } } = supabase.storage
        .from('listing-images')
        .getPublicUrl(uploadData.path)

      setData((prev) => ({
        ...prev,
        images: [...prev.images, { url: publicUrl, path: uploadData.path }],
      }))
    }

    setUploading(false)
    e.target.value = ''
  }

  async function handleRemovePhoto(index: number) {
    const image = data.images[index]
    const supabase = createClient()
    await supabase.storage.from('listing-images').remove([image.path])
    setData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const result = await submitListing({
      title: data.title,
      description: data.description || undefined,
      category: data.category,
      condition: data.condition as 'new_unworn' | 'excellent' | 'good',
      size_us: data.size_us || undefined,
      bust_cm: data.bust_cm ? parseFloat(data.bust_cm) : null,
      waist_cm: data.waist_cm ? parseFloat(data.waist_cm) : null,
      hips_cm: data.hips_cm ? parseFloat(data.hips_cm) : null,
      height_cm: data.height_cm ? parseFloat(data.height_cm) : null,
      silhouette: data.silhouette || null,
      train_style: data.train_style || null,
      price: parseFloat(data.price),
      msrp: data.msrp ? parseFloat(data.msrp) : null,
      product_id: data.product_id,
      order_number: data.order_number,
      images: data.images.map((img) => img.url),
    })

    if (result.error) {
      setError(result.error)
      setSubmitting(false)
      return
    }

    setSubmitted(true)
    setSubmitting(false)
  }

  function canProceed(): boolean {
    switch (step) {
      case 1: return true
      case 2: {
        if (!data.title || !data.size_us) return false
        if (data.size_us === 'Custom') {
          return parseFloat(data.bust_cm) > 0 && parseFloat(data.waist_cm) > 0 && parseFloat(data.hips_cm) > 0
        }
        return true
      }
      case 3: return data.condition !== ''
      case 4: return data.images.length >= 1
      case 5: return parseFloat(data.price) > 0
      default: return false
    }
  }

  const commissionRate = parseFloat(data.price) >= 10000 ? 15 : parseFloat(data.price) >= 6000 ? 18 : parseFloat(data.price) >= 3000 ? 20 : 25
  const commission = parseFloat(data.price) * (commissionRate / 100)
  const payout = parseFloat(data.price) - commission

  if (submitted) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white p-6 md:p-12 shadow-xl border border-gray-100 max-w-lg w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl material-symbols-outlined">check_circle</div>
          <h1 className="font-display text-3xl md:text-4xl mb-4">Listing Submitted</h1>
          <p className="text-gray-500 mb-8 text-sm md:text-base">Your piece <span className="font-semibold text-gray-800">{data.title}</span> is now pending authentication by our editorial team.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button onClick={() => { setData(INITIAL_DATA); setStep(1); setSubmitted(false) }} className="px-6 py-3 border border-gray-200 text-xs font-semibold uppercase tracking-widest text-gray-600 hover:bg-gray-50">Submit Another</button>
            <Link href="/dashboard" className="px-6 py-3 bg-primary text-white text-xs font-semibold uppercase tracking-widest hover:bg-zinc-800 shadow-lg shadow-black/10">View Dashboard</Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-gray-900">
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="font-display italic text-lg md:text-2xl tracking-tight">Galia Lahav</span>
            <span className="text-[8px] md:text-[10px] uppercase tracking-widest text-accent font-semibold ml-1 md:ml-2 border-l border-gray-200 pl-2 md:pl-3">Resale Archive</span>
          </div>
          <Link href="/" className="text-sm font-medium hover:opacity-70 transition-opacity flex items-center gap-1">
            Exit <span className="material-symbols-outlined text-sm">close</span>
          </Link>
        </div>
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {/* Mobile: show step number only, Desktop: full labels */}
          <div className="flex justify-between text-[9px] md:text-[11px] uppercase tracking-[0.15em] md:tracking-[0.2em] font-medium text-gray-400 py-2 md:py-3 overflow-x-auto no-scrollbar gap-1 md:gap-0">
            {STEPS.map((s) => (
              <span key={s.num} className={`flex items-center gap-1 md:gap-2 shrink-0 px-1 ${step === s.num ? 'text-primary' : step > s.num ? 'text-primary' : ''}`}>
                <span className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${step === s.num ? 'border-primary' : step > s.num ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                  {step > s.num && <span className="material-symbols-outlined text-white text-[10px] md:text-[12px]">check</span>}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{s.label.split(' ')[0]}</span>
              </span>
            ))}
          </div>
          <div className="w-full bg-gray-100 h-[2px]">
            <div className="bg-primary h-[2px] transition-all duration-500" style={{ width: `${(step / 5) * 100}%` }}></div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 lg:py-16">
        {error && <div className="p-3 md:p-4 mb-6 md:mb-8 bg-red-50 text-red-600 border border-red-200 rounded text-center text-sm">{error}</div>}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-4xl mx-auto">
              <div className="text-center mb-8 md:mb-12">
                <h1 className="font-display text-3xl md:text-4xl lg:text-5xl mb-4 md:mb-6 leading-tight">Identify Your Piece</h1>
                <p className="text-gray-500 font-light text-sm md:text-lg px-2">Search our master archive to automatically import your gown's specifications, original retail price, and professional imagery.</p>
              </div>
              <div className="max-w-3xl mx-auto">
                <div className="relative group mb-8 md:mb-12">
                  <div className="absolute inset-y-0 left-4 md:left-6 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-gray-400 group-focus-within:text-primary transition-colors">search</span>
                  </div>
                  <input
                    className="w-full pl-12 md:pl-16 pr-4 md:pr-32 py-4 md:py-5 bg-white border-gray-200 focus:ring-accent focus:border-accent text-sm md:text-lg shadow-sm rounded-xl"
                    placeholder="Search by gown name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <div className="hidden md:flex absolute inset-y-0 right-2 items-center">
                    <button onClick={handleSearch} className="px-6 py-2 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-lg">Search</button>
                  </div>
                </div>

                {searching && (
                  <div className="text-center py-8 text-gray-400 text-sm">Searching...</div>
                )}

                {searchResults.length > 0 && (
                  <div className="bg-white shadow-xl rounded-xl border border-gray-100 overflow-hidden mb-8 md:mb-12">
                    {searchResults.map((product) => (
                      <div key={product.id} onClick={() => selectProduct(product)} className="p-3 md:p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer flex items-center gap-3 md:gap-6 transition-colors group">
                        <div className="w-12 h-16 md:w-16 md:h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          {product.images?.[0] ?
                            <img src={product.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" /> :
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Img</div>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-serif text-base md:text-xl truncate">{product.style_name}</p>
                          <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-widest mt-1">{product.category}</p>
                        </div>
                        <div className="pr-1 md:pr-4"><span className="material-symbols-outlined text-gray-300 group-hover:text-primary text-sm md:text-base">arrow_forward_ios</span></div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="text-center pt-6 md:pt-8 border-t border-gray-200 border-dashed">
                  <p className="text-sm text-gray-500 mb-4">Can't find your gown?</p>
                  <button onClick={skipToManual} className="text-accent hover:text-primary underline text-sm font-medium tracking-wide">Enter Details Manually</button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-start">
                <div className="lg:col-span-4 space-y-4 lg:space-y-8">
                  <h1 className="font-display text-3xl md:text-4xl leading-tight">Gown Details & Size</h1>
                  <p className="text-gray-500 font-light text-sm md:text-base leading-relaxed">Tell us about your masterpiece. Providing accurate details and sizing ensures the right bride finds her dream dress.</p>
                  {data.product_id && (
                    <div className="p-4 md:p-6 bg-accent/5 border border-accent/20 rounded-lg">
                      <h3 className="text-xs uppercase tracking-widest font-semibold text-accent mb-2">Archive Match</h3>
                      <p className="text-sm italic text-gray-600">Archival specs for <b>{data.product_name}</b> have been loaded. Please fill in your specific sizing.</p>
                    </div>
                  )}
                </div>

                <div className="lg:col-span-8 bg-white border border-gray-100 shadow-xl rounded-xl">
                  <div className="p-5 md:p-8 lg:p-12 space-y-8 md:space-y-10">

                    {!data.product_id && (
                      <div className="space-y-6">
                        <h2 className="text-lg md:text-xl font-medium border-b border-gray-100 pb-2">Basic Info</h2>
                        <div className="space-y-2">
                          <label className="text-[11px] uppercase tracking-widest font-semibold text-gray-500">Style Name / Title *</label>
                          <input value={data.title} onChange={e => setData({ ...data, title: e.target.value })} className="w-full bg-transparent border-0 border-b border-gray-200 py-3 px-0 focus:ring-0 focus:border-accent text-sm" placeholder="e.g. Fabiana" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                          <div className="space-y-2">
                            <label className="text-[11px] uppercase tracking-widest font-semibold text-gray-500">Category *</label>
                            <CustomDropdown
                              value={data.category}
                              onChange={(v) => setData({ ...data, category: v as any })}
                              options={[
                                { value: 'bridal', label: 'Bridal Gown' },
                                { value: 'evening', label: 'Evening Wear' },
                                { value: 'accessories', label: 'Accessories' }
                              ]}
                              placeholder="Select Category"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[11px] uppercase tracking-widest font-semibold text-gray-500">Silhouette</label>
                            <CustomDropdown
                              value={data.silhouette}
                              onChange={(v) => setData({ ...data, silhouette: v })}
                              options={[
                                { value: '', label: 'Select' },
                                { value: 'a_line', label: 'A-Line' },
                                { value: 'mermaid', label: 'Mermaid' },
                                { value: 'ball_gown', label: 'Ball Gown' },
                                { value: 'sheath', label: 'Sheath' }
                              ]}
                              placeholder="Select Silhouette"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-6 pt-6 border-t border-gray-100">
                      <h2 className="text-lg md:text-xl font-medium border-b border-gray-100 pb-2">Sizing</h2>
                      <div className="space-y-2">
                        <label className="block text-xs uppercase tracking-widest font-semibold text-gray-500">Label Size (US)</label>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4">
                          <CustomDropdown
                            value={data.size_us}
                            onChange={handleSizeChange}
                            options={[
                              { value: '', label: 'Select Size' },
                              ...['US 0 (EU 32)', 'US 2 (EU 34)', 'US 4 (EU 36)', 'US 6 (EU 38)', 'US 8 (EU 40)', 'US 10 (EU 42)', 'US 12 (EU 44)', 'US 14 (EU 46)', 'US 16 (EU 48)', 'Custom'].map(s => ({ value: s, label: s }))
                            ]}
                            placeholder="Select Size"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {[{ lbl: 'Bust', fld: 'bust_cm' }, { lbl: 'Waist', fld: 'waist_cm' }, { lbl: 'Hips', fld: 'hips_cm' }, { lbl: 'Height', fld: 'height_cm' }].map(m => (
                          <div key={m.fld} className="space-y-2">
                            <label className="text-[10px] md:text-xs uppercase tracking-widest font-semibold text-gray-500">{m.lbl}</label>
                            <div className="relative">
                              <input type="number" value={(data as any)[m.fld]} onChange={e => setData({ ...data, [m.fld]: e.target.value })} className="w-full bg-transparent border-0 border-b border-gray-200 py-2 px-0 text-base md:text-lg font-light focus:ring-0 focus:border-accent" placeholder="00.0" />
                              <span className="absolute right-0 bottom-2 text-[10px] text-gray-400 uppercase">CM</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4 md:space-y-6 pt-6 border-t border-gray-100">
                      <label className="text-[11px] uppercase tracking-widest font-semibold text-gray-500">The Story / Description</label>
                      <textarea value={data.description} onChange={e => setData({ ...data, description: e.target.value })} className="w-full bg-gray-50 border-gray-200 focus:ring-accent rounded text-sm p-3 md:p-4 placeholder:text-gray-400" placeholder="Describe the gown, its fit, how it felt to wear, and any special memories..." rows={4}></textarea>
                    </div>

                    <div className="space-y-2 pt-6 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <label className="text-[11px] uppercase tracking-widest font-semibold text-gray-500">Order Number <span className="text-red-500">*</span></label>
                        <div className="relative group">
                          <span className="material-symbols-outlined text-gray-400 text-sm cursor-help">help</span>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-[#1c1c1c] text-white text-xs rounded-lg px-4 py-3 leading-relaxed opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                            You can find your order number on your order confirmation from your store or on the inner label of your dress.
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1c1c1c] rotate-45 -mt-1"></div>
                          </div>
                        </div>
                      </div>
                      <input
                        value={data.order_number}
                        onChange={e => setData({ ...data, order_number: e.target.value })}
                        className="w-full bg-transparent border-0 border-b border-gray-200 py-3 px-0 focus:ring-0 focus:border-accent text-sm"
                        placeholder="e.g. GL-2024-00123"
                        maxLength={100}
                        required
                      />
                    </div>

                  </div>
                  <div className="p-4 md:p-8 bg-gray-50 border-t border-gray-100 flex justify-between">
                    <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-primary font-medium">Back</button>
                    <button onClick={() => setStep(3)} disabled={!canProceed()} className="px-5 md:px-8 py-3 bg-primary text-white text-[10px] md:text-xs uppercase tracking-widest font-semibold hover:bg-zinc-800 transition-all rounded shadow-md disabled:opacity-50">Save & Continue</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-start">
                <div className="lg:col-span-4 space-y-4 lg:space-y-8">
                  <h1 className="font-display text-3xl md:text-4xl leading-tight">Gown Condition</h1>
                  <p className="text-gray-500 font-light text-sm md:text-base leading-relaxed">Please select the tier that most accurately reflects the current state of your gown.</p>
                </div>
                <div className="lg:col-span-8 bg-white border border-gray-100 shadow-xl rounded-xl">
                  <div className="p-5 md:p-8 lg:p-12 space-y-4 md:space-y-6">
                    {[
                      { v: 'new_unworn', title: 'Pristine & Unworn', sub: 'Collector Quality', desc: 'Never worn, no alterations. Original tags attached. Stored in a climate-controlled environment.' },
                      { v: 'excellent', title: 'Excellent', sub: 'Worn Once', desc: 'Worn for a wedding or event. Professionally dry-cleaned immediately after use. No visible stains.' },
                      { v: 'good', title: 'Good', sub: 'Minor Wear', desc: 'Previously worn with minor wear. Includes deep dry cleaning. Any remaining minor imperfections must be disclosed.' }
                    ].map(c => {
                      const isSelected = data.condition === c.v
                      return (
                        <label key={c.v} className="relative block cursor-pointer group">
                          <input type="radio" name="condition" checked={isSelected} onChange={() => setData({ ...data, condition: c.v as any })} className="sr-only" />
                          <div className={`p-4 md:p-6 border-2 rounded-lg transition-all hover:border-accent ${isSelected ? 'border-primary' : 'border-gray-100'}`}>
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="text-base md:text-lg font-semibold tracking-tight">{c.title}</h3>
                                <p className="text-[10px] md:text-xs uppercase tracking-widest text-accent font-medium mt-1">{c.sub}</p>
                              </div>
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-2 transition-colors ${isSelected ? 'border-primary' : 'border-gray-300'}`}>
                                <div className={`w-2.5 h-2.5 rounded-full transition-colors ${isSelected ? 'bg-primary' : 'bg-transparent'}`}></div>
                              </div>
                            </div>
                            <p className="text-xs md:text-sm text-gray-500 mt-2">{c.desc}</p>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                  <div className="p-4 md:p-8 bg-gray-50 border-t border-gray-100 flex justify-between">
                    <button onClick={() => setStep(2)} className="text-sm text-gray-500 hover:text-primary font-medium">Back</button>
                    <button onClick={() => setStep(4)} disabled={!canProceed()} className="px-5 md:px-8 py-3 bg-primary text-white text-[10px] md:text-xs uppercase tracking-widest font-semibold hover:bg-zinc-800 transition-all rounded shadow-md disabled:opacity-50">Save & Continue</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-start">
                <div className="lg:col-span-4 space-y-4 lg:space-y-8">
                  <h1 className="font-display text-3xl md:text-4xl leading-tight">Couture Imagery</h1>
                  <p className="text-gray-500 font-light text-sm md:text-base leading-relaxed">High-quality imagery is crucial for authentication and attracting buyers.</p>
                  <ul className="space-y-3 md:space-y-4">
                    <li><b className="block text-sm">1. Architectural Frontier</b><span className="text-xs text-gray-500">Full frontal gown silhouette</span></li>
                    <li><b className="block text-sm">2. The Heritage Label</b><span className="text-xs text-gray-500">Clear macro-shot of internal tags</span></li>
                    <li><b className="block text-sm">3. The Grand Train</b><span className="text-xs text-gray-500">Composition of rear detailing</span></li>
                  </ul>
                </div>
                <div className="lg:col-span-8 bg-white border border-gray-100 shadow-xl rounded-xl">
                  <div className="p-5 md:p-8 lg:p-12 space-y-6">
                    {data.stock_images && data.stock_images.length > 0 && (
                      <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-3 mb-4">
                          <span className="material-symbols-outlined text-blue-600 text-xl">info</span>
                          <div>
                            <h3 className="text-sm font-bold text-blue-900 mb-1">Reference Photos from Catalog</h3>
                            <p className="text-xs text-blue-800">These are the professional stock photos of {data.product_name}. Upload similar photos of <strong>yourself wearing the dress</strong> to help buyers visualize the fit.</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3 mt-4">
                          {data.stock_images.slice(0, 3).map((img, i) => (
                            <div key={i} className="aspect-[3/4] border border-blue-200 rounded overflow-hidden">
                              <img src={img} alt={`Stock photo ${i + 1}`} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 text-amber-800">
                        <span className="material-symbols-outlined text-lg">warning</span>
                        <p className="text-xs font-bold">Required: At least 2 photos of you wearing the dress</p>
                      </div>
                      <p className="text-xs text-amber-700 mt-1">Photos must clearly show you wearing the gown. Stock photos alone will not be accepted.</p>
                    </div>

                    <label className={`block aspect-[4/3] md:aspect-video lg:aspect-[2.5/1] border-2 border-dashed border-gray-200 bg-gray-50 hover:border-accent hover:bg-accent/5 flex flex-col items-center justify-center cursor-pointer transition-all rounded-xl ${uploading ? 'opacity-50' : ''}`}>
                      <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" disabled={uploading || data.images.length >= 8} />
                      <span className="material-symbols-outlined text-3xl md:text-4xl text-gray-400 mb-2">cloud_upload</span>
                      <span className="text-xs md:text-sm font-semibold text-center px-4">{uploading ? 'Uploading...' : 'Tap to upload photos'}</span>
                      <span className="text-[10px] md:text-xs text-gray-500 mt-1">Up to 8 images (JPEG, PNG, WEBP)</span>
                    </label>

                    {data.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-6 md:mt-8">
                        {data.images.map((img, i) => (
                          <div key={i} className="relative aspect-[3/4] border border-gray-200 rounded overflow-hidden group">
                            <img src={img.url} alt="" className="w-full h-full object-cover" />
                            <button onClick={() => handleRemovePhoto(i)} className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                              <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                            {i === 0 && <div className="absolute bottom-0 left-0 right-0 bg-primary/90 text-white text-[10px] py-1 text-center uppercase tracking-widest font-bold">Cover</div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="p-4 md:p-8 bg-gray-50 border-t border-gray-100 flex justify-between">
                    <button onClick={() => setStep(3)} className="text-sm text-gray-500 hover:text-primary font-medium">Back</button>
                    <button onClick={() => setStep(5)} disabled={!canProceed()} className="px-5 md:px-8 py-3 bg-primary text-white text-[10px] md:text-xs uppercase tracking-widest font-semibold hover:bg-zinc-800 transition-all rounded shadow-md disabled:opacity-50">Save & Continue</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-start">
                <div className="lg:col-span-4 space-y-4 lg:space-y-8">
                  <h1 className="font-display text-3xl md:text-4xl leading-tight">Pricing & Post</h1>
                  <p className="text-gray-500 font-light text-sm md:text-base leading-relaxed">Set your asking price based on condition and original retail value. Our tiered commission structure rewards higher-value pieces.</p>
                </div>
                <div className="lg:col-span-8 bg-white border border-gray-100 shadow-xl rounded-xl">
                  <div className="p-5 md:p-8 lg:p-12 space-y-8 md:space-y-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[11px] uppercase tracking-widest font-semibold text-gray-500">Retail Price (MSRP)</label>
                          {data.product_id && (
                            <span className="text-[9px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-bold uppercase tracking-widest flex items-center gap-1">
                              <span className="material-symbols-outlined text-[10px]">verified</span>
                              Verified Archive
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <span className="absolute left-0 top-3 text-gray-400">$</span>
                          <input
                            type="number"
                            value={data.msrp}
                            readOnly={!!data.product_id}
                            onChange={e => setData({ ...data, msrp: e.target.value })}
                            className={`w-full bg-transparent border-0 border-b border-gray-200 py-3 pl-5 focus:ring-0 focus:border-accent text-xl ${data.product_id ? 'text-gray-400 cursor-not-allowed font-medium' : ''}`}
                            placeholder="8500"
                          />
                          {data.product_id && (
                            <span className="absolute right-0 top-4 material-symbols-outlined text-gray-300 text-sm">lock</span>
                          )}
                        </div>
                        {data.product_id && (
                          <p className="text-[10px] text-gray-400 italic">This is the official archival release price. High-value pieces earn higher status.</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-widest font-semibold text-gray-500">Your Asking Price *</label>
                        <div className="relative">
                          <span className="absolute left-0 top-3 text-gray-400">$</span>
                          <input type="number" value={data.price} onChange={e => setData({ ...data, price: e.target.value })} className="w-full bg-transparent border-0 border-b border-gray-200 py-3 pl-5 focus:ring-0 focus:border-accent text-xl font-medium" placeholder="4500" />
                        </div>
                      </div>
                    </div>

                    {parseFloat(data.price) > 0 && (
                      <div className="p-6 bg-gray-50 border border-gray-100 rounded-lg space-y-4">
                        <div className="flex justify-between items-end border-b border-gray-200 pb-4">
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Your Earnings</p>
                            <p className="font-serif text-3xl">${payout.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Service Fee</p>
                            <p className="text-sm text-gray-600">{commissionRate}%</p>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Listing amount</span>
                          <span className="font-semibold">${parseFloat(data.price).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">RE:GALIA curation fee</span>
                          <span className="text-gray-500">-${commission.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        </div>
                      </div>
                    )}

                    <div className="bg-accent/5 p-4 md:p-6 rounded-lg text-xs md:text-sm text-accent leading-relaxed italic border border-accent/20">
                      Our internal curation atelier will review your submission for heritage certification within 24 hours before it's published to the marketplace.
                    </div>
                  </div>
                  <div className="p-4 md:p-8 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                    <button onClick={() => setStep(4)} className="text-sm text-gray-500 hover:text-primary font-medium">Back</button>
                    <form onSubmit={handleSubmit}>
                      <button type="submit" disabled={!canProceed() || submitting} className="px-6 md:px-10 py-3 md:py-4 bg-primary text-white text-[10px] md:text-xs uppercase tracking-widest font-semibold hover:bg-zinc-800 transition-all shadow-lg rounded disabled:opacity-50">
                        {submitting ? 'Authenticating...' : 'Submit to Atelier'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  )
}
