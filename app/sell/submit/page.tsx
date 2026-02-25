'use client'

import { useState, useCallback, useEffect } from 'react'
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

    for (const file of Array.from(files)) {
      if (data.images.length >= 8) {
        setError('Maximum 8 photos allowed')
        break
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
      case 2: return data.title.length > 0 && data.size_us.length > 0
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
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-12 shadow-xl border border-gray-100 max-w-lg text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl material-symbols-outlined">check_circle</div>
          <h1 className="font-display text-4xl mb-4">Listing Submitted</h1>
          <p className="text-gray-500 mb-8">Your piece <span className="font-semibold text-gray-800">{data.title}</span> is now pending authentication by our editorial team.</p>
          <div className="flex justify-center gap-4">
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
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="font-display italic text-2xl tracking-tight">Galia Lahav</span>
            <span className="text-[10px] uppercase tracking-widest text-accent font-semibold ml-2 border-l border-gray-200 pl-3">Resale Archive</span>
          </div>
          <Link href="/" className="text-sm font-medium hover:opacity-70 transition-opacity flex items-center gap-2">
            Save & Exit <span className="material-symbols-outlined text-sm">close</span>
          </Link>
        </div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between text-[11px] uppercase tracking-[0.2em] font-medium text-gray-400 py-3 overflow-x-auto no-scrollbar">
            {STEPS.map((s, idx) => (
              <span key={s.num} className={`flex items-center gap-2 shrink-0 ${step === s.num ? 'text-primary border-b-2 border-primary pb-1' : step > s.num ? 'text-primary' : ''}`}>
                {step > s.num && <span className="material-symbols-outlined text-[14px]">check_circle</span>}
                {s.label}
              </span>
            ))}
          </div>
          <div className="w-full bg-gray-100 h-[2px]">
            <div className="bg-primary h-[2px] transition-all duration-500" style={{ width: `${(step / 5) * 100}%` }}></div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
        {error && <div className="p-4 mb-8 bg-red-50 text-red-600 border border-red-200 rounded text-center text-sm">{error}</div>}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="font-display text-4xl lg:text-5xl mb-6 leading-tight">Identify Your Piece</h1>
                <p className="text-gray-500 font-light text-lg">Search our master archive to automatically import your gown's specifications, original retail price, and professional imagery.</p>
              </div>
              <div className="max-w-3xl mx-auto">
                <div className="relative group mb-12">
                  <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-gray-400 group-focus-within:text-primary transition-colors">search</span>
                  </div>
                  <input
                    className="w-full pl-16 pr-32 py-5 bg-white border-gray-200 focus:ring-accent focus:border-accent text-lg shadow-sm rounded-xl"
                    placeholder="Search by gown name (e.g. 'Fabiana')"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <div className="absolute inset-y-0 right-2 flex items-center">
                    <button onClick={handleSearch} className="px-6 py-2 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-lg">Search</button>
                  </div>
                </div>

                {searchResults.length > 0 && (
                  <div className="bg-white shadow-xl rounded-xl border border-gray-100 overflow-hidden mb-12">
                    {searchResults.map((product) => (
                      <div key={product.id} onClick={() => selectProduct(product)} className="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer flex items-center gap-6 transition-colors group">
                        <div className="w-16 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          {product.images?.[0] ?
                            <img src={product.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" /> :
                            <div className="w-full h-full flex items-center justify-center text-gray-300">No Img</div>
                          }
                        </div>
                        <div className="flex-1">
                          <p className="font-serif text-xl">{product.style_name}</p>
                          <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">{product.category}</p>
                        </div>
                        <div className="pr-4"><span className="material-symbols-outlined text-gray-300 group-hover:text-primary">arrow_forward_ios</span></div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="text-center pt-8 border-t border-gray-200 border-dashed">
                  <p className="text-sm text-gray-500 mb-4">Can't find your gown?</p>
                  <button onClick={skipToManual} className="text-accent hover:text-primary underline text-sm font-medium tracking-wide">Enter Details Manually</button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="grid lg:grid-cols-12 gap-16 items-start">
                <div className="lg:col-span-4 space-y-8">
                  <h1 className="font-display text-4xl leading-tight">Gown Details & Size</h1>
                  <p className="text-gray-500 font-light leading-relaxed">Tell us about your masterpiece. Providing accurate details and sizing ensures the right bride finds her dream dress.</p>
                  {data.product_id && (
                    <div className="p-6 bg-accent/5 border border-accent/20 rounded-lg">
                      <h3 className="text-xs uppercase tracking-widest font-semibold text-accent mb-2">Archive Match</h3>
                      <p className="text-sm italic text-gray-600">Archival specs for <b>{data.product_name}</b> have been loaded. Please fill in your specific sizing.</p>
                    </div>
                  )}
                </div>

                <div className="lg:col-span-8 bg-white border border-gray-100 shadow-xl rounded-xl">
                  <div className="p-8 lg:p-12 space-y-10">

                    {!data.product_id && (
                      <div className="space-y-6">
                        <h2 className="text-xl font-medium border-b border-gray-100 pb-2">Basic Info</h2>
                        <div className="space-y-2">
                          <label className="text-[11px] uppercase tracking-widest font-semibold text-gray-500">Style Name / Title *</label>
                          <input value={data.title} onChange={e => setData({ ...data, title: e.target.value })} className="w-full bg-transparent border-0 border-b border-gray-200 py-3 px-0 focus:ring-0 focus:border-accent text-sm" placeholder="e.g. Fabiana" />
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-2">
                            <label className="text-[11px] uppercase tracking-widest font-semibold text-gray-500">Category *</label>
                            <select value={data.category} onChange={e => setData({ ...data, category: e.target.value as any })} className="w-full bg-transparent border-0 border-b border-gray-200 py-3 px-0 focus:ring-0 focus:border-accent appearance-none text-sm">
                              <option value="bridal">Bridal Gown</option>
                              <option value="evening">Evening Wear</option>
                              <option value="accessories">Accessories</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[11px] uppercase tracking-widest font-semibold text-gray-500">Silhouette</label>
                            <select value={data.silhouette} onChange={e => setData({ ...data, silhouette: e.target.value })} className="w-full bg-transparent border-0 border-b border-gray-200 py-3 px-0 focus:ring-0 focus:border-accent appearance-none text-sm">
                              <option value="">Select</option>
                              <option value="a_line">A-Line</option>
                              <option value="mermaid">Mermaid</option>
                              <option value="ball_gown">Ball Gown</option>
                              <option value="sheath">Sheath</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-6 pt-6 border-t border-gray-100">
                      <h2 className="text-xl font-medium border-b border-gray-100 pb-2">Sizing</h2>
                      <div className="space-y-2">
                        <label className="block text-xs uppercase tracking-widest font-semibold text-gray-500">Label Size (US)</label>
                        <select value={data.size_us} onChange={e => handleSizeChange(e.target.value)} className="w-full bg-gray-50 border-gray-200 rounded-lg py-3 text-sm focus:ring-accent">
                          <option value="">Select Size</option>
                          {['US 0 (EU 32)', 'US 2 (EU 34)', 'US 4 (EU 36)', 'US 6 (EU 38)', 'US 8 (EU 40)', 'US 10 (EU 42)', 'Custom'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {[{ lbl: 'Bust', fld: 'bust_cm' }, { lbl: 'Waist', fld: 'waist_cm' }, { lbl: 'Hips', fld: 'hips_cm' }, { lbl: 'Height', fld: 'height_cm' }].map(m => (
                          <div key={m.fld} className="space-y-2">
                            <label className="text-xs uppercase tracking-widest font-semibold text-gray-500">{m.lbl}</label>
                            <div className="relative">
                              <input type="number" value={(data as any)[m.fld]} onChange={e => setData({ ...data, [m.fld]: e.target.value })} className="w-full bg-transparent border-0 border-b border-gray-200 py-2 px-0 text-lg font-light focus:ring-0 focus:border-accent" placeholder="00.0" />
                              <span className="absolute right-0 bottom-2 text-[10px] text-gray-400 uppercase">CM</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6 pt-6 border-t border-gray-100">
                      <label className="text-[11px] uppercase tracking-widest font-semibold text-gray-500">The Story / Description</label>
                      <textarea value={data.description} onChange={e => setData({ ...data, description: e.target.value })} className="w-full bg-gray-50 border-gray-200 focus:ring-accent rounded text-sm p-4 placeholder:text-gray-400" placeholder="Describe the gown, its fit, how it felt to wear, and any special memories..." rows={5}></textarea>
                    </div>

                  </div>
                  <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-between">
                    <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-primary font-medium">Back</button>
                    <button onClick={() => setStep(3)} disabled={!canProceed()} className="px-8 py-3 bg-primary text-white text-xs uppercase tracking-widest font-semibold hover:bg-zinc-800 transition-all rounded shadow-md disabled:opacity-50">Save & Continue</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="grid lg:grid-cols-12 gap-16 items-start">
                <div className="lg:col-span-4 space-y-8">
                  <h1 className="font-display text-4xl leading-tight">Gown Condition</h1>
                  <p className="text-gray-500 font-light leading-relaxed">Please select the tier that most accurately reflects the current state of your gown.</p>
                </div>
                <div className="lg:col-span-8 bg-white border border-gray-100 shadow-xl rounded-xl">
                  <div className="p-8 lg:p-12 space-y-6">
                    {[
                      { v: 'new_unworn', title: 'Pristine & Unworn', sub: 'Collector Quality', desc: 'Never worn, no alterations. Original tags attached. Stored in a climate-controlled environment.' },
                      { v: 'excellent', title: 'Excellent', sub: 'Worn Once', desc: 'Worn for a wedding or event. Professionally dry-cleaned immediately after use. No visible stains.' },
                      { v: 'good', title: 'Good', sub: 'Minor Wear', desc: 'Previously worn with minor wear. Includes deep dry cleaning. Any remaining minor imperfections must be disclosed.' }
                    ].map(c => (
                      <label key={c.v} className="relative block cursor-pointer group">
                        <input type="radio" name="condition" checked={data.condition === c.v} onChange={() => setData({ ...data, condition: c.v as any })} className="sr-only peer" />
                        <div className="p-6 border-2 border-gray-100 rounded-lg transition-all hover:border-accent peer-checked:border-primary">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="text-lg font-semibold tracking-tight">{c.title}</h3>
                              <p className="text-xs uppercase tracking-widest text-accent font-medium mt-1">{c.sub}</p>
                            </div>
                            <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center peer-checked:bg-primary">
                              <div className="w-2.5 h-2.5 rounded-full bg-primary opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 mt-2">{c.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-between">
                    <button onClick={() => setStep(2)} className="text-sm text-gray-500 hover:text-primary font-medium">Back</button>
                    <button onClick={() => setStep(4)} disabled={!canProceed()} className="px-8 py-3 bg-primary text-white text-xs uppercase tracking-widest font-semibold hover:bg-zinc-800 transition-all rounded shadow-md disabled:opacity-50">Save & Continue</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="grid lg:grid-cols-12 gap-16 items-start">
                <div className="lg:col-span-4 space-y-8">
                  <h1 className="font-display text-4xl leading-tight">Couture Imagery</h1>
                  <p className="text-gray-500 font-light leading-relaxed">High-quality imagery is crucial for authentication and attracting buyers. Follow our perspective guide for the best results.</p>
                  <ul className="space-y-4">
                    <li><b className="block text-sm">1. Architectural Frontier</b><span className="text-xs text-gray-500">Full frontal gown silhouette</span></li>
                    <li><b className="block text-sm">2. The Heritage Label</b><span className="text-xs text-gray-500">Clear macro-shot of internal tags</span></li>
                    <li><b className="block text-sm">3. The Grand Train</b><span className="text-xs text-gray-500">Composition of rear detailing</span></li>
                  </ul>
                </div>
                <div className="lg:col-span-8 bg-white border border-gray-100 shadow-xl rounded-xl">
                  <div className="p-8 lg:p-12 space-y-6">
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

                    <label className={`block aspect-video lg:aspect-[2.5/1] border-2 border-dashed border-gray-200 bg-gray-50 hover:border-accent hover:bg-accent/5 flex flex-col items-center justify-center cursor-pointer transition-all rounded-xl ${uploading ? 'opacity-50' : ''}`}>
                      <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" disabled={uploading || data.images.length >= 8} />
                      <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">cloud_upload</span>
                      <span className="text-sm font-semibold">{uploading ? 'Uploading...' : 'Click or drag photos to upload'}</span>
                      <span className="text-xs text-gray-500 mt-1">Up to 8 high-res images (JPEG, PNG, WEBP)</span>
                    </label>

                    {data.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                        {data.images.map((img, i) => (
                          <div key={i} className="relative aspect-[3/4] border border-gray-200 rounded overflow-hidden group">
                            <img src={img.url} alt="" className="w-full h-full object-cover" />
                            <button onClick={() => handleRemovePhoto(i)} className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                            {i === 0 && <div className="absolute bottom-0 left-0 right-0 bg-primary/90 text-white text-[10px] py-1 text-center uppercase tracking-widest font-bold">Cover</div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-between">
                    <button onClick={() => setStep(3)} className="text-sm text-gray-500 hover:text-primary font-medium">Back</button>
                    <button onClick={() => setStep(5)} disabled={!canProceed()} className="px-8 py-3 bg-primary text-white text-xs uppercase tracking-widest font-semibold hover:bg-zinc-800 transition-all rounded shadow-md disabled:opacity-50">Save & Continue</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="grid lg:grid-cols-12 gap-16 items-start">
                <div className="lg:col-span-4 space-y-8">
                  <h1 className="font-display text-4xl leading-tight">Pricing & Post</h1>
                  <p className="text-gray-500 font-light leading-relaxed">Set your asking price based on condition and original retail value. Our tiered commission structure rewards higher-value pieces.</p>
                </div>
                <div className="lg:col-span-8 bg-white border border-gray-100 shadow-xl rounded-xl">
                  <div className="p-8 lg:p-12 space-y-10">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-widest font-semibold text-gray-500">Retail Price (MSRP)</label>
                        <div className="relative">
                          <span className="absolute left-0 top-3 text-gray-400">$</span>
                          <input type="number" value={data.msrp} onChange={e => setData({ ...data, msrp: e.target.value })} className="w-full bg-transparent border-0 border-b border-gray-200 py-3 pl-5 focus:ring-0 focus:border-accent text-xl" placeholder="8500" />
                        </div>
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

                    <div className="bg-accent/5 p-6 rounded-lg text-sm text-accent leading-relaxed italic border border-accent/20">
                      Our internal curation atelier will review your submission for heritage certification within 24 hours before it's published to the marketplace.
                    </div>
                  </div>
                  <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                    <button onClick={() => setStep(4)} className="text-sm text-gray-500 hover:text-primary font-medium">Back</button>
                    <form onSubmit={handleSubmit}>
                      <button type="submit" disabled={!canProceed() || submitting} className="px-10 py-4 bg-primary text-white text-xs uppercase tracking-widest font-semibold hover:bg-zinc-800 transition-all shadow-lg rounded disabled:opacity-50">
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
