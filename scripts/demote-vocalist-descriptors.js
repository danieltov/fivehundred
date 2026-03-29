// scripts/demote-vocalist-descriptors.js
// Moves "male vocalist" and "female vocalist" descriptors to at least position 5
// (0-indexed: index 5+) so they don't influence accent bucket assignment.
// Usage: node scripts/demote-vocalist-descriptors.js

import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ALBUMS_PATH = join(__dirname, '..', 'data', 'albums.json')

const VOCALIST_SLUGS = new Set(['male-vocalist', 'female-vocalist'])

const catalog = JSON.parse(readFileSync(ALBUMS_PATH, 'utf8'))
let moved = 0

for (const album of catalog.albums) {
  const vocalists = album.descriptors.filter(d => VOCALIST_SLUGS.has(d.slug))
  const others = album.descriptors.filter(d => !VOCALIST_SLUGS.has(d.slug))

  // Only act if any vocalist descriptor is currently in positions 0–4
  const needsMove = album.descriptors
    .slice(0, 5)
    .some(d => VOCALIST_SLUGS.has(d.slug))

  if (!needsMove) continue

  // Insert vocalists at index 5 (after first 5 non-vocalist descriptors)
  const insertAt = Math.min(5, others.length)
  others.splice(insertAt, 0, ...vocalists)
  album.descriptors = others
  moved++
  console.log(`${album.slug}: moved ${vocalists.map(v => v.name).join(', ')} to position ${insertAt + 1}`)
}

writeFileSync(ALBUMS_PATH, JSON.stringify(catalog, null, 2))
console.log(`\nDone. ${moved} albums updated.`)
