'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '@/components/ui/Navbar'
import { searchProducts, submitListing, uploadListingImage, removeListingImage } from './actions'

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
  condition: '',
  images: [],
  price: '',
  msrp: '',
}

const STEPS = [
  { num: 1, label: 'Find Item' },
  { num: 2, label: 'Details' },
  { num: 3, label: 'Condition' },
  { num: 4, label: 'Photos' },
  { num: 5, label: 'Price & Submit' },
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

const SIZES = ['0', '2', '4', '6', '8', '10', '12', '14', '16', '18', '20', 'Custom']

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

/* ── Shared Input Style ── */
const inputClass =
  'w-full px-4 py-3 border border-white/10 bg-white/[0.03] text-white/80 placeholder:text-white/15 font-sans text-sm focus:outline-none focus:border-gold-muted/40 transition-colors'
const labelClass = 'block font-sans text-xs text-white/40 mb-2 tracking-wider'
const selectClass =
  'w-full px-4 py-3 border border-white/10 bg-white/[0.03] text-white/80 font-sans text-sm focus:outline-none focus:border-gold-muted/40 transition-colors'

export default function SellWizardPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [data, setData] = useState<WizardData>(INITIAL_DATA)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [searching, setSearching] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  /* ── Search products ── */
  const handleSearch = useCallback(async () => {
    if (searchQuery.length < 2) return
    setSearching(true)
    const result = await searchProducts(searchQuery)
    setSearchResults(result.products as Product[])
    setSearching(false)
  }, [searchQuery])

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
      <main className="min-h-screen bg-obsidian">
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
            <h1 className="font-serif text-4xl md:text-5xl font-light text-white/90 mb-4 tracking-wider">
              Listing Submitted
            </h1>
            <p className="font-sans text-sm text-white/40 mb-4 leading-relaxed">
              Your <span className="text-champagne">{data.title}</span> has been submitted for review.
            </p>
            <p className="font-sans text-xs text-white/25 mb-10">
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
    <main className="min-h-screen bg-obsidian">
      <Navbar />

      <div className="pt-28 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-gold-muted/50 mb-3">
              List Your Gown
            </p>
            <h1 className="font-serif text-3xl md:text-4xl font-light text-white/90 tracking-wider">
              Consignment Submission
            </h1>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-12 max-w-xl mx-auto">
            {STEPS.map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all duration-300 ${
                      step > s.num
                        ? 'bg-gold-muted text-obsidian'
                        : step === s.num
                        ? 'border-2 border-gold-muted text-gold-muted'
                        : 'border border-white/15 text-white/20'
                    }`}
                  >
                    {step > s.num ? <CheckIcon /> : s.num}
                  </div>
                  <span
                    className={`font-sans text-[9px] tracking-widest uppercase mt-2 ${
                      step >= s.num ? 'text-white/40' : 'text-white/15'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`w-8 md:w-16 h-[1px] mx-1 md:mx-2 mb-5 transition-colors ${
                      step > s.num ? 'bg-gold-muted/40' : 'bg-white/10'
                    }`}
                  />
                )}
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
                className="border border-white/10 bg-white/[0.02] p-8"
              >
                <h2 className="font-serif text-xl text-white/80 mb-2">Find Your Galia Lahav Gown</h2>
                <p className="font-sans text-xs text-white/30 mb-8">
                  Search our catalog to match your gown, or enter details manually.
                </p>

                {/* Search */}
                <div className="flex gap-3 mb-6">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Search by style name or SKU..."
                      className={inputClass}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20">
                      <SearchIcon />
                    </span>
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={searchQuery.length < 2 || searching}
                    className="px-6 py-3 bg-gold-muted text-obsidian font-sans text-xs uppercase tracking-widest disabled:opacity-30 hover:bg-champagne transition-colors"
                  >
                    {searching ? '...' : 'Search'}
                  </button>
                </div>

                {/* Category filter */}
                <div className="flex gap-2 mb-6">
                  {['bridal', 'evening', 'accessories'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() =>
                        setData((prev) => ({ ...prev, category: cat as 'bridal' | 'evening' | 'accessories' }))
                      }
                      className={`px-4 py-2 text-xs tracking-widest uppercase border transition-colors ${
                        data.category === cat
                          ? 'border-gold-muted/50 text-gold-muted bg-gold-muted/5'
                          : 'border-white/10 text-white/30 hover:border-white/20'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Results */}
                {searchResults.length > 0 && (
                  <div className="space-y-2 mb-8">
                    <p className="font-sans text-[10px] text-white/25 tracking-widest uppercase mb-3">
                      {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                    </p>
                    {searchResults.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => selectProduct(product)}
                        className="w-full text-left p-4 border border-white/10 hover:border-gold-muted/30 hover:bg-white/[0.02] transition-all flex items-center justify-between group"
                      >
                        <div>
                          <div className="font-serif text-sm text-white/70 group-hover:text-white/90 transition-colors">
                            {product.style_name}
                          </div>
                          <div className="font-sans text-[10px] text-white/25 mt-1 tracking-wider">
                            {product.category} {product.sku && `· ${product.sku}`}{' '}
                            {product.msrp && `· MSRP $${product.msrp.toLocaleString()}`}
                          </div>
                        </div>
                        <span className="text-white/15 group-hover:text-gold-muted transition-colors text-xs tracking-widest">
                          SELECT →
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Skip to manual */}
                <div className="border-t border-white/5 pt-6 text-center">
                  <p className="font-sans text-xs text-white/25 mb-3">
                    Can&apos;t find your gown? No problem.
                  </p>
                  <button
                    onClick={skipToManual}
                    className="font-sans text-xs text-gold-muted hover:text-champagne transition-colors tracking-widest uppercase"
                  >
                    Enter Details Manually →
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
                className="border border-white/10 bg-white/[0.02] p-8"
              >
                <h2 className="font-serif text-xl text-white/80 mb-2">Item Details</h2>
                <p className="font-sans text-xs text-white/30 mb-8">
                  {data.product_name
                    ? `Pre-filled from ${data.product_name}. Adjust as needed.`
                    : 'Tell us about your gown.'}
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
                        <option value="bridal" className="bg-obsidian">Bridal Gown</option>
                        <option value="evening" className="bg-obsidian">Evening Wear</option>
                        <option value="accessories" className="bg-obsidian">Accessories</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Size (US)</label>
                      <select
                        value={data.size_us}
                        onChange={(e) => setData((prev) => ({ ...prev, size_us: e.target.value }))}
                        className={selectClass}
                      >
                        <option value="" className="bg-obsidian">Select size</option>
                        {SIZES.map((s) => (
                          <option key={s} value={s} className="bg-obsidian">{s}</option>
                        ))}
                      </select>
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
                        <option value="" className="bg-obsidian">Select silhouette</option>
                        {SILHOUETTES.map((s) => (
                          <option key={s.value} value={s.value} className="bg-obsidian">{s.label}</option>
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
                        <option value="" className="bg-obsidian">Select train</option>
                        {TRAIN_STYLES.map((t) => (
                          <option key={t.value} value={t.value} className="bg-obsidian">{t.label}</option>
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

                  {/* Description */}
                  <div>
                    <label className={labelClass}>Description</label>
                    <textarea
                      value={data.description}
                      onChange={(e) => setData((prev) => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      placeholder="Any additional details about your gown — alterations, special features, history..."
                      className={`${inputClass} resize-none`}
                    />
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
                className="border border-white/10 bg-white/[0.02] p-8"
              >
                <h2 className="font-serif text-xl text-white/80 mb-2">Condition</h2>
                <p className="font-sans text-xs text-white/30 mb-8">
                  Select the condition that best describes your gown.
                </p>

                <div className="space-y-3">
                  {CONDITIONS.map((cond) => (
                    <button
                      key={cond.value}
                      onClick={() => setData((prev) => ({ ...prev, condition: cond.value }))}
                      className={`w-full text-left p-6 border transition-all duration-300 ${
                        data.condition === cond.value
                          ? 'border-gold-muted/50 bg-gold-muted/5'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-serif text-lg text-white/80 mb-1">{cond.label}</div>
                          <div className="font-sans text-xs text-white/30 leading-relaxed">{cond.desc}</div>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ml-4 transition-all ${
                            data.condition === cond.value
                              ? 'border-gold-muted bg-gold-muted text-obsidian'
                              : 'border-white/20'
                          }`}
                        >
                          {data.condition === cond.value && <CheckIcon />}
                        </div>
                      </div>
                    </button>
                  ))}
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
                className="border border-white/10 bg-white/[0.02] p-8"
              >
                <h2 className="font-serif text-xl text-white/80 mb-2">Photos</h2>
                <p className="font-sans text-xs text-white/30 mb-8">
                  Upload up to 8 photos. Include front, back, close-ups, and any details or flaws.
                </p>

                {/* Upload zone */}
                <label
                  className={`block border-2 border-dashed border-white/10 hover:border-gold-muted/30 p-10 text-center cursor-pointer transition-colors ${
                    uploading ? 'opacity-50 pointer-events-none' : ''
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
                  <div className="text-white/20 mb-3 flex justify-center">
                    <UploadIcon />
                  </div>
                  <p className="font-sans text-sm text-white/40 mb-1">
                    {uploading ? 'Uploading...' : 'Click to upload or drag photos here'}
                  </p>
                  <p className="font-sans text-[10px] text-white/20">
                    JPEG, PNG, or WebP · Max 5MB each · {data.images.length}/8 photos
                  </p>
                </label>

                {/* Photo grid */}
                {data.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-3 mt-6">
                    {data.images.map((img, i) => (
                      <div key={i} className="relative aspect-square border border-white/10 overflow-hidden group">
                        <img
                          src={img.url}
                          alt={`Photo ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => handleRemovePhoto(i)}
                          className="absolute top-2 right-2 w-6 h-6 bg-obsidian/80 border border-white/20 flex items-center justify-center text-white/60 hover:text-red-400 hover:border-red-400/30 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <XIcon />
                        </button>
                        {i === 0 && (
                          <div className="absolute bottom-0 left-0 right-0 bg-obsidian/70 py-1 text-center">
                            <span className="font-sans text-[8px] tracking-widest text-gold-muted uppercase">
                              Cover
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Tips */}
                <div className="mt-8 border border-white/5 p-5">
                  <h4 className="font-sans text-[10px] tracking-[0.3em] text-gold-muted/50 uppercase mb-4">
                    Photo Tips
                  </h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      'Use natural lighting for best results',
                      'Include full front and back views',
                      'Show close-ups of beading or details',
                      'Photograph any alterations or wear',
                      'Hang the gown for better shape',
                      'Clean, neutral background preferred',
                    ].map((tip, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-gold-muted/30 text-xs mt-0.5">•</span>
                        <span className="font-sans text-xs text-white/30">{tip}</span>
                      </div>
                    ))}
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
                className="border border-white/10 bg-white/[0.02] p-8"
              >
                <h2 className="font-serif text-xl text-white/80 mb-2">Price Your Gown</h2>
                <p className="font-sans text-xs text-white/30 mb-8">
                  Set your asking price. Our commission scales down with higher prices.
                </p>

                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-5">
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
                  </div>

                  {/* Commission breakdown */}
                  {price > 0 && (
                    <div className="border border-white/10 p-6">
                      <h4 className="font-sans text-[10px] tracking-[0.3em] text-gold-muted/50 uppercase mb-5">
                        Payout Breakdown
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-sans text-sm text-white/40">Listing Price</span>
                          <span className="font-sans text-sm text-white/70">${price.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-sans text-sm text-white/40">
                            Platform Fee ({commissionRate}%)
                          </span>
                          <span className="font-sans text-sm text-white/40">
                            -${commission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                          <span className="font-sans text-sm text-white/60 font-medium">Your Payout</span>
                          <span className="font-serif text-2xl text-champagne">
                            ${payout.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  <div className="border border-white/10 p-6">
                    <h4 className="font-sans text-[10px] tracking-[0.3em] text-gold-muted/50 uppercase mb-5">
                      Listing Summary
                    </h4>
                    <div className="space-y-2 font-sans text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/30">Title</span>
                        <span className="text-white/60">{data.title || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/30">Category</span>
                        <span className="text-white/60 capitalize">{data.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/30">Condition</span>
                        <span className="text-white/60">
                          {CONDITIONS.find((c) => c.value === data.condition)?.label || '—'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/30">Size</span>
                        <span className="text-white/60">{data.size_us || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/30">Photos</span>
                        <span className="text-white/60">{data.images.length} uploaded</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Navigation ── */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              className={`px-6 py-3 border border-white/10 font-sans text-xs uppercase tracking-widest text-white/40 hover:text-white/70 hover:border-white/20 transition-colors ${
                step === 1 ? 'invisible' : ''
              }`}
            >
              ← Back
            </button>

            {step < 5 ? (
              <button
                onClick={() => setStep((s) => Math.min(5, s + 1))}
                disabled={!canProceed()}
                className="px-8 py-3 bg-gold-muted text-obsidian font-sans text-xs uppercase tracking-widest hover:bg-champagne transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || submitting}
                className="px-10 py-3 bg-white text-obsidian font-sans text-xs uppercase tracking-widest hover:bg-champagne transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit for Review'}
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
