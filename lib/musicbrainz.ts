/**
 * MusicBrainz integration for cover art and streaming URLs only
 * Metadata (genres/descriptors) now sourced from AllMusic CSV
 */

import { getAllMusicAlbumData } from './parse-allmusic-csv'

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
    // Try multiple query strategies for better results
    const queries = [
      `release:"${title}" AND artist:"${artist}"`,
      `release:"${title}"`,
      `"${title}" AND artist:"${artist}"`,
      `"${title}"`,
    ]

    for (const [index, queryString] of queries.entries()) {
      const query = encodeURIComponent(queryString)
      const url = `https://musicbrainz.org/ws/2/release-group/?query=${query}&fmt=json&limit=3`

      console.log(`Trying MusicBrainz query ${index + 1}/${queries.length}: ${queryString}`)

      // Retry logic for 503 errors (rate limiting)
      let response: Response | null = null
      let retryCount = 0
      const maxRetries = 3

      while (retryCount <= maxRetries) {
        try {
          response = await fetch(url, {
            headers: {
              'User-Agent': 'FiveHundred/1.0.0 (https://github.com/danieltov/fivehundred)',
            },
          })

          if (response.ok) {
            break
          } else if (response.status === 503) {
            // Rate limited - wait longer before retrying
            const waitTime = Math.min(1000 * Math.pow(2, retryCount), 8000) // Exponential backoff, max 8 seconds
            console.log(
              `Rate limited (503), waiting ${waitTime}ms before retry ${retryCount + 1}/${maxRetries}`
            )
            await new Promise((resolve) => setTimeout(resolve, waitTime))
            retryCount++
          } else {
            console.error(`MusicBrainz search failed: ${response.status}`)
            break
          }
        } catch (fetchError) {
          console.error(`Network error on attempt ${retryCount + 1}:`, fetchError)
          if (retryCount === maxRetries) throw fetchError
          await new Promise((resolve) => setTimeout(resolve, 1000))
          retryCount++
        }
      }

      if (!response || !response.ok) {
        console.error(`All retries failed for query ${index + 1}`)
        continue
      }

      const data: MusicBrainzSearchResponse = await response.json()

      if (!data['release-groups'] || data['release-groups'].length === 0) {
        console.log(`No results for query ${index + 1}`)
        continue
      }

      console.log(`Found ${data['release-groups'].length} results for query ${index + 1}`)

      // Filter for albums only
      const albumResults = data['release-groups'].filter((rg) => rg['primary-type'] === 'Album')
      console.log(`${albumResults.length} album results`)

      if (albumResults.length === 0) {
        console.log(`No album results for query ${index + 1}`)
        continue
      }

      // Strategy 1: Look for perfect score matches first
      const perfectMatch = albumResults.find((rg) => rg.score === 100)
      if (perfectMatch) {
        console.log(
          `Found perfect score match: ${perfectMatch.title} by ${perfectMatch['artist-credit'][0]?.artist.name} (score: ${perfectMatch.score})`
        )
        return perfectMatch.id
      }

      // Strategy 2: Look for exact artist and high score
      const exactArtistMatch = albumResults.find(
        (rg) =>
          rg['artist-credit'][0]?.artist.name.toLowerCase() === artist.toLowerCase() &&
          rg.score >= 80
      )
      if (exactArtistMatch) {
        console.log(
          `Found exact artist match: ${exactArtistMatch.title} by ${exactArtistMatch['artist-credit'][0]?.artist.name} (score: ${exactArtistMatch.score})`
        )
        return exactArtistMatch.id
      }

      // Strategy 3: Look for high score matches (relaxed artist matching)
      const highScoreMatch = albumResults.find((rg) => rg.score >= 90)
      if (highScoreMatch) {
        console.log(
          `Found high-score match: ${highScoreMatch.title} by ${highScoreMatch['artist-credit'][0]?.artist.name} (score: ${highScoreMatch.score})`
        )
        return highScoreMatch.id
      }

      // Add delay between queries to be respectful
      if (index < queries.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    console.log('No suitable matches found in any query')
    return null
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
    // Try different sizes, prefer 1200px
    const sizes = ['1200', '500', '250', '']

    for (const size of sizes) {
      const url = `https://coverartarchive.org/release-group/${mbid}/front${size ? `-${size}` : ''}`

      // Retry logic for 503 errors
      let retryCount = 0
      const maxRetries = 3

      while (retryCount <= maxRetries) {
        try {
          const response = await fetch(url, { method: 'HEAD' })
          if (response.ok) {
            return url
          } else if (response.status === 503) {
            const waitTime = Math.min(1000 * Math.pow(2, retryCount), 5000)
            console.log(`Cover Art Archive rate limited, waiting ${waitTime}ms`)
            await new Promise((resolve) => setTimeout(resolve, waitTime))
            retryCount++
          } else {
            // Not found or other error, try next size
            break
          }
        } catch (fetchError) {
          if (retryCount === maxRetries) break
          await new Promise((resolve) => setTimeout(resolve, 1000))
          retryCount++
        }
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
