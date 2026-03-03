#!/usr/bin/env node
/**
 * Scrape Bride Photos from Live Treet Site
 * ==========================================
 * Fetches each Treet listing page and extracts the original bride-uploaded
 * photos (hosted on ucarecdn.com) plus size data, then updates Supabase.
 *
 * The page embeds JSON with distinct image arrays:
 *   - "images":[{cdnUrl:...}]  → bride's own uploaded photos (what we want)
 *   - "stockPhotoUrls":[...]   → brand catalog photos (skip)
 *   - "sizeGuideUrl":"..."     → shared size guide (skip)
 *
 * Usage:
 *   node scripts/scrape-treet-images.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

config({ path: resolve(ROOT, '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const TREET_BASE = 'https://re.galialahav.com/l/x'
const CONCURRENCY = 5
const DELAY_MS = 200

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

/**
 * Extract listing data from page HTML by parsing the embedded JSON.
 * Handles both escaped (\") and unescaped (") JSON formats.
 * Returns { images: string[], size: string|null }
 */
function extractListingData(html) {
  const result = { images: [], size: null }

  // Try escaped format first (doubly-serialized JSON state)
  const escapedMatch = html.match(/\\"imageSource\\":\\"UPLOADCARE\\",\\"images\\":\[(.*?)\],\\"/)
  if (escapedMatch) {
    const cdnRegex = /ucarecdn\.com\/([a-f0-9-]{36})/g
    let match
    while ((match = cdnRegex.exec(escapedMatch[1])) !== null) {
      const url = `https://ucarecdn.com/${match[1]}/-/format/auto/-/quality/smart/`
      if (!result.images.includes(url)) result.images.push(url)
    }
  }

  // Try unescaped format (regular JSON)
  if (result.images.length === 0) {
    const unescapedMatch = html.match(/"imageSource":"UPLOADCARE","images":\[(.*?)\],"/)
    if (unescapedMatch) {
      const cdnRegex = /ucarecdn\.com\/([a-f0-9-]{36})/g
      let match
      while ((match = cdnRegex.exec(unescapedMatch[1])) !== null) {
        const url = `https://ucarecdn.com/${match[1]}/-/format/auto/-/quality/smart/`
        if (!result.images.includes(url)) result.images.push(url)
      }
    }
  }

  // Fallback: og:image meta tags (only if above methods failed)
  if (result.images.length === 0) {
    const ogRegex = /property="og:image" content="(https:\/\/ucarecdn\.com\/[a-f0-9-]{36}\/[^"]*)"/g
    let match
    while ((match = ogRegex.exec(html)) !== null) {
      const url = match[1].split('/-/')[0] + '/-/format/auto/-/quality/smart/'
      if (!result.images.includes(url)) result.images.push(url)
    }
    // Limit og:image fallback to max 10 (to avoid pulling in recommended listings)
    if (result.images.length > 10) {
      result.images = result.images.slice(0, 10)
    }
  }

  // Extract size — try escaped first, then unescaped
  const sizeEscaped = html.match(/\\"size\\":\\"(US\s*\d+[^\\]*)\\"/);
  const sizeUnescaped = html.match(/"size":"(US\s*\d+[^"]*)"/);
  const sizeRaw = sizeEscaped?.[1] || sizeUnescaped?.[1]
  if (sizeRaw) {
    result.size = sizeRaw.trim()
  }

  return result
}

async function fetchListingData(treetId) {
  const url = `${TREET_BASE}/${treetId}`
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'RE:GALIA Migration Bot/1.0' },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return null
    const html = await res.text()
    return extractListingData(html)
  } catch {
    return null
  }
}

async function main() {
  console.log('RE:GALIA — Scrape Bride Photos from Treet')
  console.log('==========================================\n')

  const { data: listings, error } = await supabase
    .from('listings')
    .select('id, title, treet_listing_id, images, size_us')
    .not('treet_listing_id', 'is', null)

  if (error) {
    console.error('Failed to load listings:', error.message)
    process.exit(1)
  }

  console.log(`Found ${listings.length} Treet listings to scrape\n`)

  let updated = 0, noImages = 0, fetchErrors = 0, sizesFound = 0
  const imageCounts = []

  for (let i = 0; i < listings.length; i += CONCURRENCY) {
    const batch = listings.slice(i, i + CONCURRENCY)
    const results = await Promise.all(
      batch.map(async (listing) => {
        const data = await fetchListingData(listing.treet_listing_id)
        return { listing, data }
      })
    )

    for (const { listing, data } of results) {
      if (!data) {
        fetchErrors++
        continue
      }

      if (data.images.length === 0) {
        noImages++
        continue
      }

      imageCounts.push(data.images.length)
      const update = { images: data.images }

      if (data.size && !listing.size_us) {
        update.size_us = data.size
        sizesFound++
      }

      const { error: updateErr } = await supabase
        .from('listings')
        .update(update)
        .eq('id', listing.id)

      if (updateErr) {
        console.log(`  ERROR (${listing.title}): ${updateErr.message}`)
        fetchErrors++
      } else {
        updated++
      }
    }

    const progress = Math.min(i + CONCURRENCY, listings.length)
    if (progress % 50 === 0 || progress === listings.length) {
      console.log(`  Progress: ${progress}/${listings.length} (${updated} updated, ${noImages} no photos, ${fetchErrors} errors, ${sizesFound} sizes)`)
    }

    if (i + CONCURRENCY < listings.length) {
      await sleep(DELAY_MS)
    }
  }

  const avgImages = imageCounts.length > 0
    ? (imageCounts.reduce((a, b) => a + b, 0) / imageCounts.length).toFixed(1)
    : 0

  console.log(`\n==========================================`)
  console.log(`Results:`)
  console.log(`  Updated with bride photos: ${updated}`)
  console.log(`  No bride photos found:     ${noImages}`)
  console.log(`  Sizes populated:           ${sizesFound}`)
  console.log(`  Fetch errors:              ${fetchErrors}`)
  console.log(`  Avg photos per listing:    ${avgImages}`)
  console.log(`  Total:                     ${listings.length}`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
