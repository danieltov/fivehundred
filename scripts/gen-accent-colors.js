// scripts/gen-accent-colors.js
// One-off: generates data/album-accent-colors.json
// Usage: node scripts/gen-accent-colors.js
// Requires ANTHROPIC_API_KEY in environment.
// Checkpoints to data/accent-colors-checkpoint.json on every write.

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import https from 'https'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const ALBUMS_PATH   = join(ROOT, 'data', 'albums.json')
const OUTPUT_PATH   = join(ROOT, 'data', 'album-accent-colors.json')
const CKPT_PATH     = join(ROOT, 'data', 'accent-colors-checkpoint.json')

const BUCKETS = ['cold', 'warm', 'dreamy', 'fierce', 'pastoral']
const BUCKET_DEFS = {
  cold:     'dark, nocturnal, bleak, icy, industrial, minimal',
  warm:     'sensual, celebratory, hedonistic, sunny, groovy, soulful',
  dreamy:   'ethereal, hypnotic, spacey, hazy, ambient, floating',
  fierce:   'confrontational, urgent, visceral, aggressive, cathartic',
  pastoral: 'autumnal, gentle, wistful, acoustic, folk-tinged, bittersweet',
}
const DELAY_MS = 1000

const { albums } = JSON.parse(readFileSync(ALBUMS_PATH, 'utf8'))

const existing = existsSync(OUTPUT_PATH)
  ? JSON.parse(readFileSync(OUTPUT_PATH, 'utf8'))
  : {}

const checkpoint = existsSync(CKPT_PATH)
  ? new Set(JSON.parse(readFileSync(CKPT_PATH, 'utf8')))
  : new Set()

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

function callClaude(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 20,
      messages: [{ role: 'user', content: prompt }],
    })
    const req = https.request({
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body),
      },
    }, res => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data)
          resolve(parsed?.content?.[0]?.text?.trim() ?? null)
        } catch { resolve(null) }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

async function getBucket(album) {
  const leadingDescriptors = album.descriptors.slice(0, 6).join(', ')
  const prompt = `Album: "${album.title}" by ${album.artist[0]?.name}
Leading descriptors: ${leadingDescriptors}

Assign ONE emotional temperature bucket. The buckets:
- cold: ${BUCKET_DEFS.cold}
- warm: ${BUCKET_DEFS.warm}
- dreamy: ${BUCKET_DEFS.dreamy}
- fierce: ${BUCKET_DEFS.fierce}
- pastoral: ${BUCKET_DEFS.pastoral}
- null: genuinely mixed or emotionally neutral — no clear bucket

Reply with exactly one word: cold, warm, dreamy, fierce, pastoral, or null.`

  const result = await callClaude(prompt)
  if (!result) return null
  const clean = result.toLowerCase().replace(/[^a-z]/g, '')
  return BUCKETS.includes(clean) ? clean : null
}

async function main() {
  console.log(`Processing ${albums.length} albums...`)
  let processed = 0

  for (const album of albums) {
    if (checkpoint.has(album.slug)) {
      processed++
      continue
    }

    const bucket = await getBucket(album)
    existing[album.slug] = bucket
    checkpoint.add(album.slug)
    processed++

    writeFileSync(OUTPUT_PATH, JSON.stringify(existing, null, 2))
    writeFileSync(CKPT_PATH, JSON.stringify([...checkpoint], null, 2))

    console.log(`[${processed}/${albums.length}] ${album.slug} → ${bucket ?? 'null'}`)
    await sleep(DELAY_MS)
  }

  console.log('Done. Output:', OUTPUT_PATH)
}

main().catch(console.error)
