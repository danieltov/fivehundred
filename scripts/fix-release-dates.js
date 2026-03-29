// scripts/fix-release-dates.js
// Looks up correct release dates for albums with bogus 1970-01-01 dates via MusicBrainz
// Usage: node scripts/fix-release-dates.js

import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import https from 'https'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ALBUMS_PATH = join(__dirname, '..', 'data', 'albums.json')
const DELAY_MS = 1100 // MusicBrainz rate limit: 1 req/sec

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

function mbFetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: { 'User-Agent': 'fivehundred/1.0 (danieltovar.dev)' }
    }, res => {
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => {
        try { resolve(JSON.parse(data)) }
        catch (e) { reject(new Error(`JSON parse error: ${e.message}`)) }
      })
      res.on('error', reject)
    }).on('error', reject)
  })
}

async function getEarliestDate(releaseGroupMbid) {
  const url = `https://musicbrainz.org/ws/2/release?release-group=${releaseGroupMbid}&fmt=json&limit=100`
  const data = await mbFetch(url)
  const releases = data.releases || []
  const dates = releases
    .map(r => r.date)
    .filter(d => d && d.length >= 4 && !d.startsWith('1970'))
    .sort()
  return dates[0] || null
}

async function searchAlbum(title, artist) {
  const q = encodeURIComponent(`release:"${title}" AND artist:"${artist}"`)
  const url = `https://musicbrainz.org/ws/2/release-group?query=${q}&fmt=json&limit=5`
  const data = await mbFetch(url)
  const rgs = data['release-groups'] || []
  // Prefer exact match on title
  const match = rgs.find(rg =>
    rg.title.toLowerCase() === title.toLowerCase() &&
    (rg['artist-credit']?.[0]?.name?.toLowerCase().includes(artist.toLowerCase().split(' ')[0]) ||
     rg['artist-credit']?.[0]?.artist?.name?.toLowerCase().includes(artist.toLowerCase().split(' ')[0]))
  ) || rgs[0]
  return match
}

async function main() {
  const catalog = JSON.parse(readFileSync(ALBUMS_PATH, 'utf8'))
  const toFix = catalog.albums.filter(a => a.releaseDate && a.releaseDate.startsWith('1970-01-01'))

  console.log(`Fixing ${toFix.length} albums with bogus 1970-01-01 dates...\n`)

  let fixed = 0
  let failed = []

  for (let i = 0; i < toFix.length; i++) {
    const album = toFix[i]
    const artistName = album.artist[0]?.name || ''
    process.stdout.write(`[${i + 1}/${toFix.length}] ${album.slug}... `)

    try {
      let date = null

      // If we already have a coverArt path with the local format,
      // try to use any existing MBID data embedded in the album
      // Otherwise search MusicBrainz
      const rg = await searchAlbum(album.title, artistName)
      await sleep(DELAY_MS)

      if (rg) {
        // Try first-release-date from release group
        if (rg['first-release-date'] && !rg['first-release-date'].startsWith('1970')) {
          date = rg['first-release-date']
        } else {
          // Fall back to searching releases
          date = await getEarliestDate(rg.id)
          await sleep(DELAY_MS)
        }
      }

      if (date) {
        // Normalize: YYYY or YYYY-MM or YYYY-MM-DD → ISO string
        let iso
        if (date.length === 4) {
          iso = `${date}-01-01T00:00:00.000Z`
        } else if (date.length === 7) {
          iso = `${date}-01T00:00:00.000Z`
        } else {
          iso = `${date}T00:00:00.000Z`
        }
        // Find and update the album in catalog
        const idx = catalog.albums.findIndex(a => a.slug === album.slug)
        catalog.albums[idx].releaseDate = iso
        fixed++
        console.log(`✓ ${date}`)
      } else {
        console.log(`✗ not found`)
        failed.push(album.slug)
      }
    } catch (err) {
      console.log(`✗ error: ${err.message}`)
      failed.push(album.slug)
      await sleep(DELAY_MS)
    }

    // Save progress every 10 albums
    if ((i + 1) % 10 === 0) {
      writeFileSync(ALBUMS_PATH, JSON.stringify(catalog, null, 2))
      console.log(`  [saved progress at ${i + 1}]`)
    }
  }

  writeFileSync(ALBUMS_PATH, JSON.stringify(catalog, null, 2))
  console.log(`\nDone. ${fixed} fixed, ${failed.length} failed.`)
  if (failed.length) {
    console.log('Failed:', failed.join(', '))
  }
}

main().catch(console.error)
