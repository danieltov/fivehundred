/**
 * MusicBrainz integration for cover art and streaming URLs only
 * Metadata (genres/descriptors) now sourced from AllMusic CSV
 */

import { getAllMusicAlbumData } from './allmusic'

// MusicBrainz API types
interface MusicBrainzSearchResponse {
  'release-groups': Array<{
    id: string
    title: string
    'primary-type': string
    'artist-credit': Array<{
      artist: {
        name: string
      }
    }>
    score: number
  }>
}

interface MusicBrainzRelationshipsResponse {
  relations: Array<{
    type: string
    'type-id': string
    url: {
      resource: string
    }
  }>
}

interface StreamingUrls {
  spotifyUri: string | null
  appleMusicUrl: string | null
}

interface AlbumMetadata {
  genres: string[]
  descriptors: string[]
}

/**
 * Search MusicBrainz for release-group by artist and title
 */
export async function searchMusicBrainzReleaseGroup(
  artist: string,
  title: string
): Promise<string | null> {
  try {
    const query = encodeURIComponent(`releasegroup:"${title}" AND artist:"${artist}"`)
    const url = `https://musicbrainz.org/ws/2/release-group?query=${query}&fmt=json&limit=5`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'FiveHundred/1.0.0 (https://github.com/danieltov/fivehundred)',
      },
    })

    if (!response.ok) {
      console.error(`MusicBrainz search failed: ${response.status}`)
      return null
    }

    const data: MusicBrainzSearchResponse = await response.json()

    // Find best match by score and exact title/artist match
    const exactMatch = data['release-groups'].find(
      (rg) => rg['primary-type'] === 'album' &&
        rg['artist-credit'][0]?.artist.name.toLowerCase() === artist.toLowerCase() &&
        rg.title.toLowerCase() === title.toLowerCase()
    )

    if (exactMatch) {
      return exactMatch.id
    }

    // Fallback to highest scoring result
    return data['release-groups'][0]?.id || null
  } catch (error) {
    console.error('MusicBrainz search error:', error)
    return null
  }
}

/**
 * Get cover art URL from MusicBrainz Cover Art Archive
 */
export async function getCoverArtFromMBID(mbid: string): Promise<string | null> {
  try {
    // Try different sizes, prefer 500px
    const sizes = ['500', '1200', '250', '']

    for (const size of sizes) {
      const url = `https://coverartarchive.org/release-group/${mbid}/front${size ? `-${size}` : ''}`

      try {
        const response = await fetch(url, { method: 'HEAD' })
        if (response.ok) {
          return url
        }
      } catch {
        // Continue to next size
      }
    }

    return null
  } catch (error) {
    console.error('Cover Art Archive error:', error)
    return null
  }
}

/**
 * Get relationships from MusicBrainz release-group
 */
async function getMusicBrainzRelationships(
  mbid: string
): Promise<MusicBrainzRelationshipsResponse | null> {
  try {
    const url = `https://musicbrainz.org/ws/2/release-group/${mbid}?inc=url-rels&fmt=json`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'FiveHundred/1.0.0 (https://github.com/danieltov/fivehundred)',
      },
    })

    if (!response.ok) {
      console.error(`MusicBrainz relationships failed: ${response.status}`)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('MusicBrainz relationships error:', error)
    return null
  }
}

/**
 * Get metadata from AllMusic CSV (replaces MusicBrainz tags/genres)
 */
async function getAllMusicMetadata(artist: string, title: string): Promise<AlbumMetadata> {
  const allMusicData = await getAllMusicAlbumData(artist, title)
  return {
    genres: allMusicData.genres,
    descriptors: allMusicData.descriptors,
  }
}

/**
 * Main function to get complete album metadata from MusicBrainz
 */
export async function getMusicBrainzAlbumData(
  artist: string,
  title: string
): Promise<{
  coverArt: string | null
  streamingUrls: StreamingUrls
  genres: string[]
  descriptors: string[]
}> {
  const result = {
    coverArt: null as string | null,
    streamingUrls: {
      spotifyUri: null,
      appleMusicUrl: null,
    } as StreamingUrls,
    genres: [] as string[],
    descriptors: [] as string[],
  }

  try {
    console.log(`Searching MusicBrainz for: "${title}" by "${artist}"`)

    // Step 1: Always get AllMusic metadata
    const allMusicMetadata = await getAllMusicMetadata(artist, title)
    result.genres = allMusicMetadata.genres
    result.descriptors = allMusicMetadata.descriptors

    // Step 2: Search MusicBrainz for release-group (for cover art and streaming URLs)
    const mbid = await searchMusicBrainzReleaseGroup(artist, title)
    if (!mbid) {
      console.log('No MusicBrainz release-group found - using AllMusic metadata only')
      return result
    }

    console.log(`Found MusicBrainz release-group: ${mbid}`)

    // Step 3: Get cover art and relationships from MusicBrainz
    const [coverArt, relationships] = await Promise.all([
      getCoverArtFromMBID(mbid),
      getMusicBrainzRelationships(mbid),
    ])

    // Process cover art
    if (coverArt) {
      result.coverArt = coverArt
      console.log(`Found cover art: ${coverArt}`)
    }

    console.log(`Found ${result.genres.length} genres:`, result.genres.slice(0, 3))
    console.log(`Found ${result.descriptors.length} descriptors:`, result.descriptors.slice(0, 3))

    // Step 4: Check for direct streaming platform relationships
    if (relationships?.relations) {
      for (const rel of relationships.relations) {
        const url = rel.url.resource

        // Check for direct Spotify relationships
        if (url.includes('spotify.com/album/')) {
          const albumId = url.split('/album/')[1]?.split('?')[0]?.split('/')[0]
          if (albumId && albumId.length > 10) {
            result.streamingUrls.spotifyUri = `spotify:album:${albumId}`
            console.log(`Found direct Spotify URI: ${result.streamingUrls.spotifyUri}`)
          }
        }

        // Check for Apple Music relationships
        if (url.includes('music.apple.com')) {
          result.streamingUrls.appleMusicUrl = url
          console.log(`Found Apple Music URL: ${result.streamingUrls.appleMusicUrl}`)
        }
      }
    }

    // Add delay to be respectful to APIs
    await new Promise((resolve) => setTimeout(resolve, 1000))
  } catch (error) {
    console.error('MusicBrainz lookup error:', error)
  }

  return result
}
