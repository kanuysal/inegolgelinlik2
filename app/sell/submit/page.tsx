'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '@/components/ui/Navbar'
import { searchProducts, submitListing, uploadListingImage, removeListingImage, getCatalogGowns, getSizeDimensions } from './actions'

/* ── Types ── */
type Product = {
  id: string
  style_name: string
  sku: string | null
  category: string
  silhouette: string | null
  train_style: string | null
  msrp: number | null
  images: string[]
}

type UploadedImage = {
  url: string
  path: string
}

type WizardData = {
  // Step 1: Product
  product_id: string | null
  product_name: string
  // Step 2: Details
  title: string
  description: string
  category: 'bridal' | 'evening' | 'accessories'
  size_us: string
  bust_cm: string
  waist_cm: string
  hips_cm: string
  height_cm: string
  silhouette: string
  train_style: string
  stock_images: string[]
  // Step 3: Condition
  condition: '' | 'new_unworn' | 'excellent' | 'good'
  // Step 4: Photos
  images: UploadedImage[]
  // Step 5: Price
  price: string
  msrp: string
}

const INITIAL_DATA: WizardData = {
  product_id: null,
  product_name: '',
  title: '',
  description: '',
  category: 'bridal',
  size_us: '',
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
}

const STEPS = [
  { num: 1, label: 'Find Item' },
  { num: 2, label: 'Item Details' },
  { num: 3, label: 'Condition' },
  { num: 4, label: 'Photos' },
  { num: 5, label: 'Price' },
]

const CONDITIONS = [
  {
    value: 'new_unworn' as const,
    label: 'New & Unworn',
    desc: 'Never worn, tags may or may not be attached. In original condition.',
  },
  {
    value: 'excellent' as const,
    label: 'Excellent',
    desc: 'Worn once. No visible signs of wear, stains, or damage. Minor alterations OK.',
  },
  {
    value: 'good' as const,
    label: 'Good',
    desc: 'Worn, with minor signs of wear. May have alterations. Still in beautiful condition.',
  },
]

const SILHOUETTES = [
  { value: 'a_line', label: 'A-Line' },
  { value: 'ball_gown', label: 'Ball Gown' },
  { value: 'mermaid', label: 'Mermaid' },
  { value: 'trumpet', label: 'Trumpet' },
  { value: 'sheath', label: 'Sheath' },
  { value: 'fit_and_flare', label: 'Fit & Flare' },
  { value: 'empire', label: 'Empire' },
  { value: 'column', label: 'Column' },
]

const TRAIN_STYLES = [
  { value: 'none', label: 'None' },
  { value: 'sweep', label: 'Sweep' },
  { value: 'court', label: 'Court' },
  { value: 'chapel', label: 'Chapel' },
  { value: 'cathedral', label: 'Cathedral' },
  { value: 'royal', label: 'Royal' },
]

const SIZES = [
  'US 0 (EU 32)',
  'US 2 (EU 34)',
  'US 4 (EU 36)',
  'US 6 (EU 38)',
  'US 8 (EU 40)',
  'US 10 (EU 42)',
  'US 12 (EU 44)',
  'US 14 (EU 46)',
  'Custom'
]

/* ── Icons ── */
function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function UploadIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

/* ── Shared Input Style (Light Mode) ── */
const inputClass =
  'w-full px-4 py-3 border border-obsidian/10 bg-white text-obsidian placeholder:text-obsidian/20 font-sans text-sm focus:outline-none focus:border-gold-muted/40 transition-colors'
const labelClass = 'block font-sans text-[11px] font-bold uppercase text-obsidian/40 mb-2 tracking-[0.2em]'
const selectClass =
  'w-full px-4 py-3 border border-obsidian/10 bg-white text-obsidian font-sans text-sm focus:outline-none focus:border-gold-muted/40 transition-colors'

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

  /* ── Load catalog ── */
  useEffect(() => {
    getCatalogGowns().then(res => {
      if (res.gowns) setCatalogGowns(res.gowns)
    })
  }, [])

  /* ── Search products ── */
  const handleSearch = useCallback(async () => {
    if (searchQuery.length < 2) return
    setSearching(true)
    const result = await searchProducts(searchQuery)
    setSearchResults(result.products as Product[])
    setSearching(false)
  }, [searchQuery])

  /* ── Intelligent Sizing ── */
  async function handleSizeChange(sizeLabel: string) {
    setData(prev => ({ ...prev, size_us: sizeLabel }))
    if (sizeLabel === 'Custom' || !sizeLabel) return

    const res = await getSizeDimensions(sizeLabel)
    if (res.dimensions) {
      setData(prev => ({
        ...prev,
        bust_cm: res.dimensions.bust.toString(),
        waist_cm: res.dimensions.waist.toString(),
        hips_cm: res.dimensions.hips.toString(),
        height_cm: res.dimensions.height_with_shoes.toString()
      }))
    }
  }

  /* ── Select a product from search ── */
  function selectProduct(product: Product) {
    setData((prev) => ({
      ...prev,
      product_id: product.id,
      product_name: product.style_name,
      title: product.style_name,
      category: product.category as 'bridal' | 'evening' | 'accessories',
      silhouette: product.silhouette || '',
      train_style: product.train_style || '',
      msrp: product.msrp?.toString() || '',
      stock_images: product.images || [],
    }))
    setStep(2)
  }

  /* ── Skip product search (manual entry) ── */
  function skipToManual() {
    setData((prev) => ({ ...prev, product_id: null, product_name: '' }))
    setStep(2)
  }

  /* ── Photo upload ── */
  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError(null)

    for (const file of Array.from(files)) {
      if (data.images.length >= 8) {
        setError('Maximum 8 photos allowed')
        break
      }

      const formData = new FormData()
      formData.append('file', file)

      const result = await uploadListingImage(formData)
      if (result.error) {
        setError(result.error)
        break
      }

      if (result.url && result.path) {
        setData((prev) => ({
          ...prev,
          images: [...prev.images, { url: result.url!, path: result.path! }],
        }))
      }
    }

    setUploading(false)
    // Reset input
    e.target.value = ''
  }

  async function handleRemovePhoto(index: number) {
    const image = data.images[index]
    await removeListingImage(image.path)
    setData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  /* ── Submit ── */
  async function handleSubmit() {
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

  /* ── Step validation ── */
  function canProceed(): boolean {
    switch (step) {
      case 1:
        return true // can always proceed (skip or select)
      case 2:
        return data.title.length > 0 && data.category.length > 0
      case 3:
        return data.condition !== ''
      case 4:
        return data.images.length >= 1
      case 5:
        return parseFloat(data.price) > 0
      default:
        return false
    }
  }

  /* ── Commission calc ── */
  const price = parseFloat(data.price) || 0
  const commissionRate = price >= 10000 ? 15 : price >= 6000 ? 18 : price >= 3000 ? 20 : 25
  const commission = price * (commissionRate / 100)
  const payout = price - commission

  /* ── Success State ── */
  if (submitted) {
    return (
      <main className="min-h-screen bg-silk">
        <Navbar />
        <section className="pt-32 pb-20 px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="w-20 h-20 rounded-full border border-emerald-500/30 flex items-center justify-center mx-auto mb-8">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-400">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-light text-obsidian/90 mb-4 tracking-wider">
              Listing Submitted
            </h1>
            <p className="font-sans text-sm text-obsidian/40 mb-4 leading-relaxed">
              Your <span className="text-gold-muted font-bold">{data.title}</span> has been submitted for review.
            </p>
            <p className="font-sans text-xs text-obsidian/25 mb-10">
              Our authentication team will review your listing within 24–72 hours.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/shop"
                className="px-8 py-3 border border-white/15 font-sans text-xs uppercase tracking-[0.2em] text-white/50 hover:text-white hover:border-white/30 transition-all"
              >
                BROWSE GOWNS
              </Link>
              <Link
                href="/sell/submit"
                onClick={() => {
                  setData(INITIAL_DATA)
                  setStep(1)
                  setSubmitted(false)
                }}
                className="px-8 py-3 bg-white text-obsidian font-sans text-xs uppercase tracking-[0.2em] hover:bg-champagne transition-all"
              >
                SUBMIT ANOTHER
              </Link>
            </div>
          </motion.div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-silk">
      <Navbar />

      <div className="pt-28 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-gold-muted mb-3">
              List Your Gown
            </p>
            <h1 className="font-serif text-3xl md:text-5xl font-light text-obsidian tracking-wider">
              Couture Submission
            </h1>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-20 relative">
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-obsidian/5 -translate-y-1/2" />
            <div
              className="absolute top-1/2 left-0 h-[1px] bg-gold-muted/40 -translate-y-1/2 transition-all duration-700 ease-in-out"
              style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
            />
            {STEPS.map((s) => (
              <div key={s.num} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${step >= s.num ? 'bg-gold-muted shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'bg-obsidian/10'
                    }`}
                />
                <span
                  className={`absolute top-8 whitespace-nowrap font-sans text-[10px] font-bold tracking-[0.2em] uppercase transition-colors duration-500 ${step === s.num ? 'text-obsidian' : 'text-obsidian/20'
                    }`}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 border border-red-500/30 bg-red-500/5 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Steps */}
          <AnimatePresence mode="wait">
            {/* ── STEP 1: Find Item ── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white p-10 shadow-[0_4px_40px_rgba(0,0,0,0.03)] border border-obsidian/5"
              >
                <h2 className="font-serif text-2xl text-obsidian/90 mb-2">Identify Your Masterpiece</h2>
                <p className="font-sans text-xs text-obsidian/40 mb-8 lowercase tracking-wide">
                  Select your Galia Lahav style from our archive or enter custom details.
                </p>

                {/* Catalog dropdown */}
                <div className="mb-10">
                  <label className={labelClass}>Collection Archive</label>
                  <p className="font-sans text-[10px] text-obsidian/20 mb-4 uppercase tracking-[0.1em]">Select your gown style for instant authentication sync</p>
                  <select
                    onChange={(e) => {
                      const gown = catalogGowns.find(g => g.id === e.target.value)
                      if (gown) {
                        setData(prev => ({
                          ...prev,
                          product_id: gown.id,
                          product_name: gown.name,
                          title: gown.name,
                          stock_images: gown.images || [],
                          description: gown.description || '',
                          silhouette: gown.silhouette || '',
                          category: gown.collection === 'Evening' ? 'evening' : 'bridal'
                        }))
                        setStep(2)
                      }
                    }}
                    className={`${selectClass} h-14 border-obsidian/5 focus:border-[#FF6448]/40`}
                  >
                    <option value="">Search the Galia Lahav Archive...</option>
                    {catalogGowns.map(gown => (
                      <option key={gown.id} value={gown.id}>{gown.name.toUpperCase()} — {gown.collection}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-4 mb-10">
                  <div className="flex-1 h-[1px] bg-obsidian/5" />
                  <span className="font-sans text-[10px] text-obsidian/20 uppercase tracking-widest font-bold">or find by search</span>
                  <div className="flex-1 h-[1px] bg-obsidian/5" />
                </div>

                {/* Search */}
                <div className="flex gap-3 mb-12">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Type style name (e.g. Artemis)..."
                      className={`${inputClass} h-14 border-obsidian/5 focus:border-[#FF6448]/40`}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-obsidian/20">
                      <SearchIcon />
                    </span>
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={searchQuery.length < 2 || searching}
                    className="px-10 py-3 bg-obsidian text-white font-sans text-[11px] font-bold uppercase tracking-[0.3em] disabled:opacity-30 hover:bg-[#FF6448] transition-all"
                  >
                    {searching ? '...' : 'Search'}
                  </button>
                </div>

                {/* Results */}
                {searchResults.length > 0 && (
                  <div className="mb-12">
                    <p className="font-sans text-[10px] text-obsidian/30 tracking-[0.2em] uppercase mb-8 font-bold">
                      ARCHIVAL MATCHES FOUND
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                      {searchResults.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => selectProduct(product)}
                          className="group text-left"
                        >
                          <div className="relative aspect-[3/4] overflow-hidden bg-silk rounded-2xl border border-obsidian/5 group-hover:border-[#FF6448]/40 transition-all duration-500">
                            {product.images && product.images[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.style_name}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center opacity-10">
                                <UploadIcon />
                              </div>
                            )}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-obsidian via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                              <span className="font-sans text-[10px] font-bold tracking-[0.3em] text-[#FF6448] uppercase">
                                Select Style →
                              </span>
                            </div>
                          </div>
                          <div className="mt-4">
                            <h3 className="font-serif text-xl text-obsidian/80 group-hover:text-[#FF6448] transition-colors italic">
                              {product.style_name}
                            </h3>
                            <p className="font-sans text-[9px] text-obsidian/30 uppercase tracking-[0.2em] mt-2 font-bold">
                              {product.category}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skip to manual */}
                <div className="border-t border-obsidian/5 pt-10 text-center">
                  <p className="font-sans text-[11px] text-obsidian/30 mb-5 tracking-wide uppercase font-bold">
                    Can&apos;t find your gown?
                  </p>
                  <button
                    onClick={skipToManual}
                    className="px-10 py-4 border border-obsidian/10 rounded-full font-sans text-[10px] font-bold text-obsidian hover:text-white hover:bg-obsidian transition-all tracking-[0.3em] uppercase"
                  >
                    Enter Manually →
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: Details ── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white p-10 shadow-[0_4px_40px_rgba(0,0,0,0.03)] border border-obsidian/5"
              >
                <h2 className="font-serif text-2xl text-obsidian/90 mb-2">Heritage Details</h2>
                <p className="font-sans text-xs text-obsidian/40 mb-8 lowercase tracking-wide">
                  {data.product_name
                    ? `Archival data for "${data.product_name}" synchronized. Verify details below.`
                    : 'Specify the characteristics of your Galia Lahav gown.'}
                </p>

                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className={labelClass}>Style Name / Title *</label>
                    <input
                      type="text"
                      value={data.title}
                      onChange={(e) => setData((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. Almeria, Brianna, Avena"
                      className={inputClass}
                    />
                  </div>

                  {/* Category + Size */}
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>Category *</label>
                      <select
                        value={data.category}
                        onChange={(e) =>
                          setData((prev) => ({
                            ...prev,
                            category: e.target.value as 'bridal' | 'evening' | 'accessories',
                          }))
                        }
                        className={selectClass}
                      >
                        <option value="bridal">Bridal Gown</option>
                        <option value="evening">Evening Wear</option>
                        <option value="accessories">Accessories</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Size (US)</label>
                      <select
                        value={data.size_us}
                        onChange={(e) => handleSizeChange(e.target.value)}
                        className={selectClass}
                      >
                        <option value="">Select size</option>
                        {SIZES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <p className="font-sans text-[9px] text-obsidian/20 mt-2 uppercase tracking-widest italic">Dimensions auto-populated based on Galia Lahav size chart</p>
                    </div>
                  </div>

                  {/* Silhouette + Train */}
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>Silhouette</label>
                      <select
                        value={data.silhouette}
                        onChange={(e) => setData((prev) => ({ ...prev, silhouette: e.target.value }))}
                        className={selectClass}
                      >
                        <option value="">Select silhouette</option>
                        {SILHOUETTES.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Train Style</label>
                      <select
                        value={data.train_style}
                        onChange={(e) => setData((prev) => ({ ...prev, train_style: e.target.value }))}
                        className={selectClass}
                      >
                        <option value="">Select train</option>
                        {TRAIN_STYLES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Measurements */}
                  <div>
                    <label className={labelClass}>Measurements (cm) — optional</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {(['bust_cm', 'waist_cm', 'hips_cm', 'height_cm'] as const).map((field) => (
                        <input
                          key={field}
                          type="number"
                          value={data[field]}
                          onChange={(e) => setData((prev) => ({ ...prev, [field]: e.target.value }))}
                          placeholder={field.replace('_cm', '')}
                          className={inputClass}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Stock Photos Section */}
                  {data.stock_images.length > 0 && (
                    <div className="pt-6 border-t border-obsidian/5">
                      <label className={labelClass}>Archival Editorial Imagery</label>
                      <p className="font-sans text-[10px] text-obsidian/20 mb-4 uppercase tracking-[0.2em]">
                        Syncing stock photos for certification
                      </p>
                      <div className="grid grid-cols-4 gap-4">
                        {data.stock_images.map((img, i) => (
                          <div key={i} className="aspect-[3/4] bg-silk border border-obsidian/5 overflow-hidden">
                            <img src={img} alt={`Stock ${i}`} className="w-full h-full object-cover opacity-60 transition-opacity hover:opacity-100" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description / Atelier Notice */}
                  <div className="pt-6 border-t border-obsidian/5">
                    {data.product_id ? (
                      <div className="p-8 bg-gold-muted/[0.03] border border-gold-muted/10 resonance-panel rounded-none">
                        <p className="font-serif text-lg text-gold-muted italic mb-2 tracking-wide">Editorial Curation</p>
                        <p className="font-sans text-[12px] text-obsidian/50 leading-relaxed tracking-wide">
                          The official Galia Lahav descriptive assets for your <span className="text-obsidian font-bold">"{data.product_name}"</span> gown will be meticulously curated by the RE:GALIA editorial team. Your submission focus remains on condition verification and unique seller imagery.
                        </p>
                      </div>
                    ) : (
                      <div>
                        <label className={labelClass}>Gown Description *</label>
                        <textarea
                          value={data.description}
                          onChange={(e) => setData((prev) => ({ ...prev, description: e.target.value }))}
                          placeholder="Please provide details about the style, silhouette, and history of this piece..."
                          rows={4}
                          className={`${inputClass} resize-none`}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: Condition ── */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white p-10 shadow-[0_4px_40px_rgba(0,0,0,0.03)] border border-obsidian/5"
              >
                <h2 className="font-serif text-2xl text-obsidian/90 mb-2">Preservation Condition</h2>
                <p className="font-sans text-xs text-obsidian/40 mb-8 lowercase tracking-wide">
                  Select the condition tier that accurately reflects your gown's history.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {CONDITIONS.map((cond, idx) => {
                    const resalePct = idx === 0 ? '85%' : idx === 1 ? '75%' : '60%';
                    return (
                      <button
                        key={cond.value}
                        onClick={() => setData((prev) => ({ ...prev, condition: cond.value }))}
                        className={`text-left p-8 border transition-all duration-500 flex flex-col h-full rounded-sm ${data.condition === cond.value
                          ? 'border-gold-muted bg-gold-muted/[0.04] shadow-[0_10px_30px_rgba(212,175,55,0.08)]'
                          : 'border-obsidian/5 bg-white hover:border-obsidian/10'
                          }`}
                      >
                        <div className="flex-1">
                          <div className="font-serif text-xl text-obsidian/90 mb-4">{cond.label}</div>
                          <div className="font-sans text-[12px] text-obsidian/40 leading-relaxed min-h-[60px]">
                            {cond.desc}
                          </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-obsidian/5">
                          <p className="font-sans text-[9px] text-obsidian/20 uppercase tracking-widest mb-1 font-bold">Resale Potential</p>
                          <p className="font-serif text-2xl text-gold-muted">{resalePct} <span className="text-[10px] font-sans text-obsidian/20 italic font-normal">of MSRP</span></p>
                        </div>

                        {data.condition === cond.value && (
                          <div className="mt-4 flex justify-end">
                            <div className="text-gold-muted scale-125">
                              <CheckIcon />
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── STEP 4: Photos ── */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white p-10 shadow-[0_4px_40px_rgba(0,0,0,0.03)] border border-obsidian/5"
              >
                <div className="grid md:grid-cols-2 gap-12">
                  <div>
                    <h2 className="font-serif text-2xl text-obsidian/90 mb-2">Couture Perspective</h2>
                    <p className="font-sans text-[11px] text-obsidian/30 mb-8 leading-relaxed uppercase tracking-widest font-bold">
                      required frames for certification
                    </p>

                    <ul className="space-y-6 mb-10">
                      {[
                        { label: 'Architectural Frontier', desc: 'Full frontal gown silhouette in natural lighting' },
                        { label: 'The Heritage Label', desc: 'Clear macro-shot of the internal atelier tags' },
                        { label: 'Details & Accents', desc: 'Focus on beading, lace, or unique modifications' },
                        { label: 'The Grand Train', desc: 'Composition of the train and rear detailing' },
                      ].map((item, i) => (
                        <li key={i} className="flex gap-5 group">
                          <div className="w-10 h-10 border border-obsidian/5 bg-silk flex items-center justify-center text-[10px] font-bold group-hover:border-gold-muted/30 transition-colors shrink-0">
                            {i + 1}
                          </div>
                          <div>
                            <span className="block font-serif text-[14px] text-obsidian/70 group-hover:text-gold-muted transition-colors uppercase tracking-wider">{item.label}</span>
                            {item.desc && <span className="block font-sans text-[9px] text-obsidian/40 mt-1 uppercase tracking-widest leading-relaxed">{item.desc}</span>}
                          </div>
                        </li>
                      ))}
                    </ul>

                    {/* Mobile Hint */}
                    <div className="p-6 border border-gold-muted/10 bg-gold-muted/[0.01] flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-7 h-11 border border-white/20 rounded-[4px] relative bg-white/5 overflow-hidden">
                          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-[0.5px] bg-white/40" />
                          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full border border-white/20" />
                          <div className="absolute inset-0 bg-gold-muted/5 opacity-40 animate-pulse" />
                        </div>
                        <p className="font-sans text-[9px] text-white/30 uppercase tracking-[0.2em] leading-relaxed">
                          MOBILE SYNC ACTIVE<br /><span className="text-white/10 italic normal-case tracking-normal">Sync with your device for instant camera access</span>
                        </p>
                      </div>
                      <div className="h-6 w-[1px] bg-white/5 mx-2" />
                      <span className="text-[10px] text-gold-muted/50 font-serif italic">Syncing...</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Upload zone */}
                    <label
                      className={`block aspect-[3/4] border-2 border-dashed border-obsidian/5 hover:border-gold-muted/30 bg-silk flex flex-col items-center justify-center cursor-pointer transition-all duration-700 relative group rounded-sm overflow-hidden ${uploading ? 'opacity-50 pointer-events-none' : ''
                        }`}
                    >
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={handlePhotoUpload}
                        className="hidden"
                        disabled={uploading || data.images.length >= 8}
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      <div className="relative z-10 text-gold-muted/20 group-hover:text-gold-muted/50 transition-colors duration-500 scale-125 group-hover:scale-150 transform transition-transform duration-700">
                        <UploadIcon />
                      </div>
                      <div className="relative z-10 mt-6 text-center">
                        <p className="font-sans text-[10px] text-obsidian/30 uppercase tracking-[0.3em] group-hover:text-obsidian transition-colors font-bold">
                          {uploading ? 'UPLOADING...' : 'ARCHIVE PHOTOS'}
                        </p>
                        <p className="font-sans text-[8px] text-obsidian/10 uppercase tracking-widest mt-2 block">
                          Up to 8 high-resolution frames
                        </p>
                      </div>
                    </label>

                    {/* Image Previews */}
                    {data.images.length > 0 && (
                      <div className="grid grid-cols-3 gap-3">
                        {data.images.map((img, i) => (
                          <div key={i} className="relative aspect-[3/4] group border border-white/5 overflow-hidden">
                            <img src={img.url} alt={`Upload ${i}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-obsidian/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <button
                              onClick={() => handleRemovePhoto(i)}
                              className="absolute top-2 right-2 w-7 h-7 bg-obsidian/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-gold-muted hover:text-obsidian"
                            >
                              <XIcon />
                            </button>
                            {i === 0 && (
                              <div className="absolute bottom-0 left-0 right-0 bg-gold-muted/90 py-1 text-center">
                                <span className="font-sans text-[8px] tracking-[0.2em] text-obsidian font-bold uppercase">Cover</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 5: Price & Submit ── */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white p-10 shadow-[0_4px_40px_rgba(0,0,0,0.03)] border border-obsidian/5"
              >
                <h2 className="font-serif text-2xl text-obsidian/90 mb-2">Investment & Value</h2>
                <p className="font-sans text-[11px] text-obsidian/30 mb-10 leading-relaxed uppercase tracking-widest font-bold">
                  Define your market position
                </p>

                <div className="grid md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div>
                      <label className={labelClass}>Original Retail Price (USD)</label>
                      <input
                        type="number"
                        value={data.msrp}
                        onChange={(e) => setData((prev) => ({ ...prev, msrp: e.target.value }))}
                        placeholder="e.g. 8500"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Your Asking Price (USD) *</label>
                      <input
                        type="number"
                        value={data.price}
                        onChange={(e) => setData((prev) => ({ ...prev, price: e.target.value }))}
                        placeholder="e.g. 4500"
                        className={inputClass}
                      />
                    </div>

                    {/* Commission Advisor */}
                    {price > 0 && (
                      <div className="p-8 border border-gold-muted/10 bg-gold-muted/[0.02] resonance-panel rounded-none">
                        <div className="flex justify-between items-end mb-8">
                          <div>
                            <p className="font-sans text-[10px] text-obsidian/20 uppercase tracking-[0.2em] mb-2 font-bold">Your Earnings</p>
                            <p className="font-serif text-4xl text-gold-muted font-light">${payout.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-sans text-[10px] text-obsidian/20 uppercase tracking-[0.2em] mb-2 font-bold">Service Fee</p>
                            <p className="font-sans text-xs text-obsidian/40 tracking-wider font-light">{commissionRate}% Tier</p>
                          </div>
                        </div>

                        <div className="space-y-4 pt-6 border-t border-obsidian/5">
                          <div className="flex justify-between text-[11px] font-sans tracking-wide">
                            <span className="text-obsidian/30 lowercase italic">Listing amount</span>
                            <span className="text-obsidian/60 font-bold">${price.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-[11px] font-sans tracking-wide">
                            <span className="text-obsidian/30 lowercase italic">RE:GALIA curation fee</span>
                            <span className="text-obsidian/30">-${commission.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Final Review */}
                  <div className="border border-obsidian/5 bg-silk p-10 h-full flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif text-xl text-obsidian/80 mb-8 italic">Heritage Review</h3>
                      <div className="space-y-8">
                        <div className="flex justify-between border-b border-obsidian/5 pb-4">
                          <span className="font-sans text-[10px] text-obsidian/20 uppercase tracking-widest font-bold">Style Identification</span>
                          <span className="font-serif text-[15px] text-obsidian/70 tracking-wide">{data.title || '—'}</span>
                        </div>
                        <div className="flex justify-between border-b border-obsidian/5 pb-4">
                          <span className="font-sans text-[10px] text-obsidian/20 uppercase tracking-widest font-bold">State of Preservation</span>
                          <span className="font-sans text-[11px] text-obsidian/70 uppercase tracking-wider font-bold">{CONDITIONS.find(c => c.value === data.condition)?.label || '—'}</span>
                        </div>
                        <div className="flex justify-between border-b border-obsidian/5 pb-4">
                          <span className="font-sans text-[10px] text-obsidian/20 uppercase tracking-widest font-bold">Measurement Sync</span>
                          <span className="font-sans text-[11px] text-obsidian/70 font-bold">{data.size_us || '—'}</span>
                        </div>
                        <div className="flex justify-between border-b border-obsidian/5 pb-4">
                          <span className="font-sans text-[10px] text-obsidian/20 uppercase tracking-widest font-bold">Seller Imagery</span>
                          <span className="font-sans text-[11px] text-obsidian/70 font-bold">{data.images.length} Archival Frames</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-12 p-6 border border-gold-muted/10 bg-gold-muted/[0.02]">
                      <p className="font-sans text-[10px] text-obsidian/30 leading-relaxed italic text-center">
                        Our internal curation atelier will review your submission for heritage certification within 24 hours.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Navigation ── */}
          <div className="flex justify-between items-center mt-12">
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              className={`px-8 py-4 border border-obsidian/10 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-obsidian/40 hover:text-obsidian hover:border-obsidian/20 transition-all ${step === 1 ? 'invisible' : ''
                }`}
            >
              ← Back
            </button>

            {step < 5 ? (
              <button
                onClick={() => setStep((s) => Math.min(5, s + 1))}
                disabled={!canProceed()}
                className="px-10 py-4 bg-obsidian text-white font-sans text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-gold-muted transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-obsidian/10"
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || submitting}
                className="px-12 py-4 bg-gold-muted text-white font-sans text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-obsidian transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-gold-muted/20"
              >
                {submitting ? 'Authenticating...' : 'Submit to Atelier'}
              </button>
            )}
          </div>

          <p className="font-sans text-[10px] text-white/15 text-center mt-6 tracking-wider">
            Your listing will be reviewed within 24–72 hours before going live.
          </p>
        </div>
      </div>
    </main>
  )
}
