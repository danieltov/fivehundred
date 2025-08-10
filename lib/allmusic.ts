/**
 * AllMusic CSV integration for album metadata
 */

import fs from 'fs'
import path from 'path'

interface AllMusicRecord {
  publishedDate: string
  amgId: string
  artist: string
  album: string
  genre: string
  styles: string
  moods: string
  themes: string
}

interface AllMusicMetadata {
  genres: string[]
  descriptors: string[]
}

let allMusicData: AllMusicRecord[] | null = null

/**
 * Parse CSV row handling quoted values that may contain commas
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
        // Handle escaped quotes
        current += '"'
        i += 2
        continue
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }

    i++
  }

  // Add the last field
  result.push(current.trim())

  return result
}

/**
 * Load and parse the AllMusic CSV data
 */
function loadAllMusicData(): AllMusicRecord[] {
  if (allMusicData !== null) {
    return allMusicData
  }

  try {
    const csvPath = path.join(process.cwd(), 'album-info-1.csv')
    const csvContent = fs.readFileSync(csvPath, 'utf8')
    const lines = csvContent.split('\n').filter((line) => line.trim())

    // Skip header row
    const dataLines = lines.slice(1)

    allMusicData = dataLines.map((line) => {
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

    console.log(`Loaded ${allMusicData.length} AllMusic records`)
    return allMusicData
  } catch (error) {
    console.error('Error loading AllMusic data:', error)
    return []
  }
}

/**
 * Parse comma-separated values from AllMusic fields
 */
function parseAllMusicField(field: string): string[] {
  if (!field || field.trim() === '') {
    return []
  }

  return field
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

/**
 * Find AllMusic record by artist and album title
 */
function findAllMusicRecord(artist: string, album: string): AllMusicRecord | null {
  const data = loadAllMusicData()

  // Normalize for comparison
  const normalizeString = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()

  const normalizedArtist = normalizeString(artist)
  const normalizedAlbum = normalizeString(album)

  // Try exact match first
  let match = data.find(
    (record) =>
      normalizeString(record.artist) === normalizedArtist &&
      normalizeString(record.album) === normalizedAlbum
  )

  if (match) {
    return match
  }

  // Try partial matches
  match = data.find((record) => {
    const recordArtist = normalizeString(record.artist)
    const recordAlbum = normalizeString(record.album)

    return (
      (recordArtist.includes(normalizedArtist) || normalizedArtist.includes(recordArtist)) &&
      (recordAlbum.includes(normalizedAlbum) || normalizedAlbum.includes(recordAlbum))
    )
  })

  return match
}

/**
 * Get metadata from AllMusic CSV data
 */
export async function getAllMusicAlbumData(
  artist: string,
  title: string
): Promise<AllMusicMetadata> {
  const result: AllMusicMetadata = {
    genres: [],
    descriptors: [],
  }

  try {
    console.log(`Looking up AllMusic data for: "${title}" by "${artist}"`)

    const record = findAllMusicRecord(artist, title)

    if (!record) {
      console.log('No AllMusic record found')
      return result
    }

    console.log(`Found AllMusic record: ${record.artist} - ${record.album}`)

    // Map Genre + Styles to genres
    const genreItems = parseAllMusicField(record.genre)
    const styleItems = parseAllMusicField(record.styles)
    result.genres = [...genreItems, ...styleItems]

    // Map Moods + Themes to descriptors
    const moodItems = parseAllMusicField(record.moods)
    const themeItems = parseAllMusicField(record.themes)
    result.descriptors = [...moodItems, ...themeItems]

    console.log(`Found ${result.genres.length} genres:`, result.genres.slice(0, 5))
    console.log(`Found ${result.descriptors.length} descriptors:`, result.descriptors.slice(0, 5))
  } catch (error) {
    console.error('AllMusic lookup error:', error)
  }

  return result
}
