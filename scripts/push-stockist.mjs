#!/usr/bin/env node
/**
 * Push cached stockist dresses directly to Supabase.
 * Run: node scripts/push-stockist.mjs
 */

import { readFileSync } from 'fs'

const SUPABASE_URL = 'https://acfsgzumjwqatzqureuq.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjZnNnenVtandxYXR6cXVyZXVxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTIzNjg3OCwiZXhwIjoyMDg2ODEyODc4fQ.rWYsImIS3JAi1wAdsmiqBek27twQsV0gniPjWSrLNUw'

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=minimal',
}

// ── Mapping helpers ──

const silhouetteMap = {
  Ballgown: 'ball_gown',
  Mermaid: 'mermaid',
  'A-line': 'a_line',
  'A-Line': 'a_line',
  Sheath: 'sheath',
  'Fit & Flare': 'fit_and_flare',
  Trumpet: 'trumpet',
  Empire: 'empire',
  Column: 'column',
  Mini: 'sheath',
}

const trainMap = {
  Cathedral: 'cathedral',
  Chapel: 'chapel',
  Court: 'court',
  Sweep: 'sweep',
  Royal: 'royal',
  None: 'none',
}

function categoryFromLine(lineName) {
  if (lineName.includes('Evening') || lineName.includes('Luxury') || lineName.includes('Design')) return 'evening'
  return 'bridal'
}

function groupHashtags(hashtags) {
  const groups = {}
  for (const h of hashtags || []) {
    const code = h.categoryCode
    if (!groups[code]) groups[code] = []
    groups[code].push(h.name)
  }
  return groups
}

// ── Supabase helpers ──

async function supabaseGet(table, select, filters = '') {
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=${select}${filters}`
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`GET ${table}: ${res.status} ${await res.text()}`)
  return res.json()
}

async function supabaseUpsert(table, rows) {
  const url = `${SUPABASE_URL}/rest/v1/${table}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(rows),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`UPSERT ${table}: ${res.status} ${text}`)
  }
}

// ── Main ──

async function main() {
  console.log('Loading cached stockist dresses...')
  const dresses = JSON.parse(readFileSync('/tmp/stockist_dresses.json', 'utf8'))
  console.log(`Loaded ${dresses.length} dresses`)

  // Get existing products for matching
  console.log('Fetching existing products...')
  const existing = await supabaseGet('products', 'id,style_name,stockist_id')
  const byStockistId = new Map()
  const byName = new Map()
  for (const p of existing) {
    if (p.stockist_id) byStockistId.set(p.stockist_id, p.id)
    byName.set(p.style_name.toLowerCase(), p.id)
  }
  console.log(`Found ${existing.length} existing products (${byStockistId.size} with stockist_id)`)

  // Build rows
  const toInsert = []
  const toUpdate = []

  for (const dress of dresses) {
    const hashtags = groupHashtags(dress.hashtags)
    const shape = (hashtags['shape'] || [])[0] || ''
    const train = (hashtags['train'] || [])[0] || ''

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

    const images = (dress.images || []).map((img) => img.url)

    const row = {
      style_name: dress.name,
      category: categoryFromLine(dress.collection?.collectionLineName || ''),
      silhouette: silhouetteMap[shape] || null,
      train_style: trainMap[train] || null,
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
      toUpdate.push({ ...row, id: existingId })
    } else {
      toInsert.push(row)
    }
  }

  console.log(`To insert: ${toInsert.length}, To update: ${toUpdate.length}`)

  // Insert new products in batches of 50
  let inserted = 0
  for (let i = 0; i < toInsert.length; i += 50) {
    const batch = toInsert.slice(i, i + 50)
    try {
      await supabaseUpsert('products', batch)
      inserted += batch.length
      process.stdout.write(`\rInserted: ${inserted}/${toInsert.length}`)
    } catch (e) {
      console.error(`\nInsert batch error at ${i}:`, e.message)
      // Try one by one for this batch
      for (const row of batch) {
        try {
          await supabaseUpsert('products', [row])
          inserted++
        } catch (e2) {
          console.error(`  Failed to insert "${row.style_name}":`, e2.message)
        }
      }
    }
  }
  if (toInsert.length > 0) console.log()

  // Update existing products in batches of 50
  let updated = 0
  for (let i = 0; i < toUpdate.length; i += 50) {
    const batch = toUpdate.slice(i, i + 50)
    // For updates, we need to do individual PATCH requests
    for (const row of batch) {
      const id = row.id
      delete row.id
      const url = `${SUPABASE_URL}/rest/v1/products?id=eq.${id}`
      const res = await fetch(url, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(row),
      })
      if (res.ok) {
        updated++
      } else {
        console.error(`  Failed to update "${row.style_name}":`, await res.text())
      }
    }
    process.stdout.write(`\rUpdated: ${updated}/${toUpdate.length}`)
  }
  if (toUpdate.length > 0) console.log()

  console.log(`\nDone! Inserted: ${inserted}, Updated: ${updated}`)
}

main().catch((e) => {
  console.error('Fatal:', e)
  process.exit(1)
})
