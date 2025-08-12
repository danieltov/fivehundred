/**
 * AllMusic CSV batch importer with Prisma database population
 */

import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

import { getMusicBrainzAlbumData } from './musicbrainz'

const prisma = new PrismaClient()

interface AllMusicCSVRecord {
  publishedDate: string
  amgId: string
  artist: string
  album: string
  genre: string
  styles: string
  moods: string
  themes: string
}

interface ImportResult {
  success: boolean
  artist: string
  album: string
  error?: string
  created?: {
    album: boolean
    artist: boolean
    genresCount: number
    descriptorsCount: number
  }
}

/**
 * Generate URL-friendly slug from string
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
}

/**
 * Parse CSV row handling quoted values containing commas
 */
function parseCSVRow(row: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  let i = 0

  while (i < row.length) {
    const char = row[i]
    const nextChar = row[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"'
        i += 2
        continue
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }

    i++
  }

  result.push(current.trim())
  return result
}

/**
 * Parse comma-separated field removing quotes
 */
function parseField(field: string): string[] {
  if (!field || field.trim() === '') {
    return []
  }

  // Remove outer quotes if present
  const cleaned = field.replace(/^"|"$/g, '')

  return cleaned
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

/**
 * Parse date from various formats
 */
function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null

  try {
    // Clean the date string
    const cleaned = dateStr.trim()
    if (!cleaned) return null

    // Try parsing MM/DD/YY format
    if (cleaned.includes('/')) {
      const [month, day, year] = cleaned.split('/')
      if (month && day && year) {
        const monthNum = parseInt(month)
        const dayNum = parseInt(day)
        const yearNum = parseInt(year)

        // Validate ranges
        if (monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31) {
          return null
        }

        // Convert 2-digit year to 4-digit (reasonable range)
        let fullYear = yearNum
        if (year.length === 2) {
          fullYear = yearNum > 50 ? 1900 + yearNum : 2000 + yearNum
        }

        // Validate year range
        if (fullYear < 1900 || fullYear > new Date().getFullYear() + 10) {
          return null
        }

        return new Date(`${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
      }
    }

    // Try parsing year only
    if (/^\d{4}$/.test(cleaned)) {
      const year = parseInt(cleaned)
      if (year >= 1900 && year <= new Date().getFullYear() + 10) {
        return new Date(`${year}-01-01`)
      }
    }

    // Fallback to basic parsing with validation
    const parsed = new Date(cleaned)
    if (parsed.getFullYear() >= 1900 && parsed.getFullYear() <= new Date().getFullYear() + 10) {
      return parsed
    }

    return null
  } catch {
    return null
  }
}

/**
 * Load and parse CSV data
 */
function loadCSVRecords(): AllMusicCSVRecord[] {
  try {
    const csvPath = path.join(process.cwd(), 'album-info-1.csv')
    const csvContent = fs.readFileSync(csvPath, 'utf8')
    const lines = csvContent.split('\n').filter((line) => line.trim())

    // Skip header row
    const dataLines = lines.slice(1)

    return dataLines
      .map((line) => {
        const fields = parseCSVRow(line)

        return {
          publishedDate: fields[0] || '',
          amgId: fields[1] || '',
          artist: fields[2] || '',
          album: fields[3] || '',
          genre: fields[4] || '',
          styles: fields[5] || '',
          moods: fields[6] || '',
          themes: fields[7] || '',
        }
      })
      .filter((record) => record.artist && record.album) // Only include records with artist and album
  } catch (error) {
    console.error('Error loading CSV:', error)
    return []
  }
}

/**
 * Create or find artist by name
 */
async function createOrFindArtist(name: string) {
  const slug = generateSlug(name)

  let artist = await prisma.artist.findUnique({
    where: { slug },
  })

  if (!artist) {
    artist = await prisma.artist.create({
      data: {
        name,
        slug,
      },
    })
    return { artist, created: true }
  }

  return { artist, created: false }
}

/**
 * Create or find genre by name
 */
async function createOrFindGenre(name: string) {
  const slug = generateSlug(name)

  let genre = await prisma.genre.findUnique({
    where: { slug },
  })

  if (!genre) {
    try {
      genre = await prisma.genre.create({
        data: {
          name,
          slug,
        },
      })
    } catch (error) {
      // Handle unique constraint violation - try to find existing record
      if (error.code === 'P2002') {
        console.log(`Genre "${name}" already exists, finding existing record`)
        genre = await prisma.genre.findFirst({
          where: {
            OR: [{ name }, { slug }],
          },
        })
        if (!genre) {
          throw error // Re-throw if we still can't find it
        }
      } else {
        throw error
      }
    }
  }

  return genre
}

/**
 * Create or find descriptor by name
 */
async function createOrFindDescriptor(name: string) {
  const slug = generateSlug(name)

  let descriptor = await prisma.descriptor.findUnique({
    where: { slug },
  })

  if (!descriptor) {
    try {
      descriptor = await prisma.descriptor.create({
        data: {
          name,
          slug,
        },
      })
    } catch (error) {
      // Handle unique constraint violation - try to find existing record
      if (error.code === 'P2002') {
        console.log(`Descriptor "${name}" already exists, finding existing record`)
        descriptor = await prisma.descriptor.findFirst({
          where: {
            OR: [{ name }, { slug }],
          },
        })
        if (!descriptor) {
          throw error // Re-throw if we still can't find it
        }
      } else {
        throw error
      }
    }
  }

  return descriptor
}

/**
 * Import single record from AllMusic CSV
 */
async function importRecord(record: AllMusicCSVRecord): Promise<ImportResult> {
  try {
    console.log(`Processing: "${record.album}" by "${record.artist}"`)

    // Check if album already exists
    const existingAlbum = await prisma.album.findFirst({
      where: {
        title: record.album,
        artist: {
          some: {
            name: record.artist,
          },
        },
      },
    })

    if (existingAlbum) {
      console.log(`Album already exists, skipping: ${record.album}`)
      return {
        success: true,
        artist: record.artist,
        album: record.album,
        error: 'Already exists',
      }
    }

    // Create or find artist
    const { artist, created: artistCreated } = await createOrFindArtist(record.artist)

    // Parse genres and descriptors from AllMusic data
    const genreNames = [...parseField(record.genre), ...parseField(record.styles)]
    const descriptorNames = [...parseField(record.moods), ...parseField(record.themes)]

    // Create/find genres and descriptors with error handling
    const genres = []
    for (const name of genreNames) {
      try {
        const genre = await createOrFindGenre(name)
        genres.push(genre)
      } catch (error) {
        console.warn(`Failed to create/find genre "${name}":`, error.message)
        // Continue with other genres - don't fail the entire import
      }
    }

    const descriptors = []
    for (const name of descriptorNames) {
      try {
        const descriptor = await createOrFindDescriptor(name)
        descriptors.push(descriptor)
      } catch (error) {
        console.warn(`Failed to create/find descriptor "${name}":`, error.message)
        // Continue with other descriptors - don't fail the entire import
      }
    }

    // Get MusicBrainz data for cover art and streaming URLs
    const mbData = await getMusicBrainzAlbumData(record.artist, record.album)

    // Parse release date
    const releaseDate = parseDate(record.publishedDate) || new Date('1970-01-01')

    // Create album slug
    const albumSlug = generateSlug(`${record.artist}-${record.album}`)

    // Create album with relationships
    const album = await prisma.album.create({
      data: {
        title: record.album,
        slug: albumSlug,
        releaseDate,
        coverArt: mbData.coverArt || '',
        isAPlus: false, // true for now
        artist: {
          connect: [{ id: artist.id }],
        },
        genres: {
          connect: genres.map((genre) => ({ id: genre.id })),
        },
        descriptors: {
          connect: descriptors.map((descriptor) => ({ id: descriptor.id })),
        },
      },
    })

    // Update with streaming URLs separately if available
    if (mbData.streamingUrls.spotifyUri || mbData.streamingUrls.appleMusicUrl) {
      await prisma.album.update({
        where: { id: album.id },
        data: {
          ...(mbData.streamingUrls.spotifyUri && { spotifyUri: mbData.streamingUrls.spotifyUri }),
          ...(mbData.streamingUrls.appleMusicUrl && {
            appleMusicUrl: mbData.streamingUrls.appleMusicUrl,
          }),
        },
      })
    }

    console.log(`✓ Successfully imported: ${record.album} by ${record.artist}`)
    console.log(`  - Cover art: ${mbData.coverArt ? 'Found' : 'Not found'}`)
    console.log(`  - Genres: ${genres.length}`)
    console.log(`  - Descriptors: ${descriptors.length}`)

    return {
      success: true,
      artist: record.artist,
      album: record.album,
      created: {
        album: true,
        artist: artistCreated,
        genresCount: genres.length,
        descriptorsCount: descriptors.length,
      },
    }
  } catch (error) {
    console.error(`✗ Error importing ${record.album} by ${record.artist}:`, error.message)

    return {
      success: false,
      artist: record.artist,
      album: record.album,
      error: error.message,
    }
  }
}

/**
 * Import all records from AllMusic CSV
 */
export async function importAllMusicCSV(): Promise<{
  results: ImportResult[]
  summary: {
    total: number
    successful: number
    failed: number
    skipped: number
  }
}> {
  const records = loadCSVRecords()
  const results: ImportResult[] = []

  console.log(`Starting import of ${records.length} records from AllMusic CSV...`)

  // Process records sequentially to avoid overwhelming APIs and database
  for (let i = 0; i < records.length; i++) {
    const record = records[i]
    console.log(`Processing ${i + 1}/${records.length}: ${record.artist} - ${record.album}`)

    const result = await importRecord(record)
    results.push(result)

    // Add delay between records to be respectful to APIs
    if (i < records.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }
  }

  const successful = results.filter((r) => r.success && !r.error).length
  const failed = results.filter((r) => !r.success).length
  const skipped = results.filter((r) => r.success && r.error === 'Already exists').length

  const summary = {
    total: records.length,
    successful,
    failed,
    skipped,
  }

  console.log(`\nImport complete:`)
  console.log(`  Total: ${summary.total}`)
  console.log(`  Successful: ${summary.successful}`)
  console.log(`  Skipped: ${summary.skipped}`)
  console.log(`  Failed: ${summary.failed}`)

  return { results, summary }
}

/**
 * Cleanup function to close Prisma connection
 */
export async function closePrismaConnection() {
  await prisma.$disconnect()
}
