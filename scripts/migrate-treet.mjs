#!/usr/bin/env node
/**
 * Treet → RE:GALIA Migration Script
 * ==================================
 * Imports users and listings from Treet CSV exports into Supabase.
 *
 * Prerequisites:
 *   1. Run 008_treet_migration.sql in Supabase SQL Editor first
 *   2. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 *
 * Usage:
 *   node scripts/migrate-treet.mjs
 *
 * Safe to re-run — skips already-imported records (keyed on treet_user_id / treet_listing_id).
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

// Load .env.local
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

// ── CSV Parser ──────────────────────────────────────────
function parseCSV(filepath) {
  const raw = readFileSync(filepath, 'utf-8')
  const lines = raw.split('\n').filter(line => line.trim())
  if (lines.length < 2) return []

  // Parse header — handle quoted headers with special chars
  const headers = parseCSVLine(lines[0])
  const rows = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    const row = {}
    for (let j = 0; j < headers.length; j++) {
      row[headers[j].trim()] = (values[j] || '').trim()
    }
    rows.push(row)
  }
  return rows
}

function parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

// ── Field Mapping ───────────────────────────────────────
const CONDITION_MAP = {
  'EXCELLENT': 'excellent',
  'NEW_WITHOUT_TAGS': 'new_unworn',
  'GOOD': 'good',
}

const STATE_MAP = {
  'OPEN': 'approved',
  'PENDING_APPROVAL': 'pending_review',
  'CLOSED': 'archived',
}

function mapCondition(raw) {
  return CONDITION_MAP[raw?.toUpperCase()] || 'excellent'
}

function mapState(raw) {
  return STATE_MAP[raw?.toUpperCase()] || 'archived'
}

function mapListingType(isBrandDirect) {
  return isBrandDirect === 'true' ? 'brand_direct' : 'peer_to_peer'
}

function parsePrice(raw) {
  const n = parseFloat(raw)
  if (isNaN(n) || n <= 0) return null
  return Math.round(n * 100) / 100  // round to 2 decimals
}

function isValidEmail(email) {
  return email && email.includes('@') && email.includes('.')
}

// ── Build Auth Email Map ────────────────────────────────
async function buildExistingAuthMap() {
  const map = new Map()
  let page = 1
  while (true) {
    const { data } = await supabase.auth.admin.listUsers({ page, perPage: 1000 })
    if (!data?.users?.length) break
    for (const u of data.users) {
      if (u.email) map.set(u.email.toLowerCase(), u.id)
    }
    if (data.users.length < 1000) break
    page++
  }
  return map
}

// ── Import Users ────────────────────────────────────────
async function importUsers() {
  console.log('\n=== Importing Users ===')
  const csvPath = resolve(ROOT, 'public/migration/users.csv')
  const rows = parseCSV(csvPath)
  console.log(`Parsed ${rows.length} rows from users.csv`)

  // Build map of existing auth users (email → id) ONCE upfront
  console.log('Loading existing auth users...')
  const existingAuthByEmail = await buildExistingAuthMap()
  console.log(`  Found ${existingAuthByEmail.size} existing auth users`)

  // Get existing treet_user_ids to skip duplicates
  const { data: existing } = await supabase
    .from('profiles')
    .select('treet_user_id, id')
    .not('treet_user_id', 'is', null)
  const existingTreetIds = new Map((existing || []).map(p => [p.treet_user_id, p.id]))

  let created = 0, skipped = 0, errors = 0
  const emailToUserId = new Map()

  for (const row of rows) {
    const email = row['Email']?.toLowerCase()
    const name = row['Customer Name']
    const treetId = row['ID']

    if (!isValidEmail(email)) {
      console.log(`  SKIP (invalid email): ${email}`)
      skipped++
      continue
    }

    // Already imported via treet_user_id
    if (existingTreetIds.has(treetId)) {
      emailToUserId.set(email, existingTreetIds.get(treetId))
      skipped++
      continue
    }

    try {
      let userId

      // Check if auth user already exists with this email
      if (existingAuthByEmail.has(email)) {
        userId = existingAuthByEmail.get(email)
      } else {
        // Create new auth user
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: { full_name: name || '' },
        })

        if (authError) {
          if (authError.message?.includes('already been registered') || authError.message?.includes('already exists')) {
            // Refresh the map and try to find
            const refreshed = await buildExistingAuthMap()
            userId = refreshed.get(email)
            if (!userId) {
              console.log(`  ERROR (${email}): ${authError.message} — not found after refresh`)
              errors++
              continue
            }
          } else {
            console.log(`  ERROR (${email}): ${authError.message}`)
            errors++
            continue
          }
        } else {
          userId = authUser.user.id
          existingAuthByEmail.set(email, userId) // Update local map
        }
      }

      // Wait for handle_new_user trigger to create profile
      await new Promise(r => setTimeout(r, 150))

      // Update profile with Treet data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          display_name: name || null,
          full_name: name || null,
          treet_user_id: treetId,
        })
        .eq('id', userId)

      if (profileError) {
        // Profile might not exist yet — try upsert
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            display_name: name || null,
            full_name: name || null,
            treet_user_id: treetId,
          })

        if (upsertError) {
          console.log(`  ERROR updating profile (${email}): ${upsertError.message}`)
          errors++
          continue
        }
      }

      emailToUserId.set(email, userId)
      created++

      if (created % 50 === 0) {
        console.log(`  Progress: ${created} users created...`)
      }
    } catch (err) {
      console.log(`  ERROR (${email}): ${err.message}`)
      errors++
    }
  }

  console.log(`\nUsers: ${created} created, ${skipped} skipped, ${errors} errors`)
  return emailToUserId
}

// ── Import Listings ─────────────────────────────────────
async function importListings(emailToUserId) {
  console.log('\n=== Importing Listings ===')
  const csvPath = resolve(ROOT, 'public/migration/listings.csv')
  const rows = parseCSV(csvPath)
  console.log(`Parsed ${rows.length} rows from listings.csv`)

  // If emailToUserId is empty, build it from existing profiles
  if (emailToUserId.size === 0) {
    console.log('Building email→userId map from existing auth users...')
    let page = 1
    while (true) {
      const { data } = await supabase.auth.admin.listUsers({ page, perPage: 1000 })
      if (!data?.users?.length) break
      for (const u of data.users) {
        if (u.email) emailToUserId.set(u.email.toLowerCase(), u.id)
      }
      if (data.users.length < 1000) break
      page++
    }
    console.log(`  Found ${emailToUserId.size} auth users`)
  }

  // Get existing treet_listing_ids
  const { data: existing } = await supabase
    .from('listings')
    .select('treet_listing_id')
    .not('treet_listing_id', 'is', null)
  const existingTreetIds = new Set((existing || []).map(l => l.treet_listing_id))

  let created = 0, skipped = 0, errors = 0

  for (const row of rows) {
    const treetListingId = row['id']
    const email = row['email']?.toLowerCase()
    const title = row['title']?.trim()
    const priceRaw = row['price']
    const conditionRaw = row['condition']
    const stateRaw = row['state']
    const isBrandDirect = row['is_brand_direct']
    const createdAt = row['created_at']
    const notes = row['internal_brand_notes']

    // Skip already imported
    if (existingTreetIds.has(treetListingId)) {
      skipped++
      continue
    }

    // Validate price
    const price = parsePrice(priceRaw)
    if (!price) {
      console.log(`  SKIP (invalid price "${priceRaw}"): ${title}`)
      skipped++
      continue
    }

    // Find seller
    const sellerId = emailToUserId.get(email)
    if (!sellerId) {
      console.log(`  SKIP (no user for ${email}): ${title}`)
      skipped++
      continue
    }

    if (!title) {
      console.log(`  SKIP (no title): treet_id=${treetListingId}`)
      skipped++
      continue
    }

    try {
      const listing = {
        seller_id: sellerId,
        title,
        category: 'bridal',
        listing_type: mapListingType(isBrandDirect),
        condition: mapCondition(conditionRaw),
        price,
        status: mapState(stateRaw),
        treet_listing_id: treetListingId,
        description: notes || null,
        images: [],
      }

      // Preserve original created_at if valid
      if (createdAt && !isNaN(Date.parse(createdAt))) {
        listing.created_at = new Date(createdAt).toISOString()
      }

      const { error } = await supabase.from('listings').insert(listing)

      if (error) {
        console.log(`  ERROR (${title}): ${error.message}`)
        errors++
      } else {
        created++
        if (created % 50 === 0) {
          console.log(`  Progress: ${created} listings created...`)
        }
      }
    } catch (err) {
      console.log(`  ERROR (${title}): ${err.message}`)
      errors++
    }
  }

  console.log(`\nListings: ${created} created, ${skipped} skipped, ${errors} errors`)
}

// ── Main ────────────────────────────────────────────────
async function main() {
  console.log('RE:GALIA — Treet Migration')
  console.log('==========================')
  console.log(`Supabase URL: ${SUPABASE_URL}`)
  console.log()

  const emailToUserId = await importUsers()
  await importListings(emailToUserId)

  console.log('\n==========================')
  console.log('Migration complete!')
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
