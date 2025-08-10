/**
 * Music platform API utilities for Spotify and Apple Music
 */

// Spotify Web API types
interface SpotifySearchResponse {
  albums: {
    items: Array<{
      id: string
      name: string
      artists: Array<{ name: string }>
      uri: string
    }>
  }
}

interface SpotifyTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

// Apple Music API types
interface AppleMusicSearchResponse {
  results: {
    albums?: {
      data: Array<{
        id: string
        attributes: {
          name: string
          artistName: string
          url: string
        }
      }>
    }
  }
}

/**
 * Get Spotify access token using client credentials flow
 */
async function getSpotifyAccessToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials not configured')
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    throw new Error(`Spotify token request failed: ${response.status}`)
  }

  const data: SpotifyTokenResponse = await response.json()
  return data.access_token
}

/**
 * Search for album on Spotify and return URI
 */
export async function searchSpotifyAlbum(artist: string, title: string): Promise<string | null> {
  try {
    const accessToken = await getSpotifyAccessToken()
    const query = encodeURIComponent(`album:"${title}" artist:"${artist}"`)

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${query}&type=album&limit=5`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      console.error(`Spotify search failed: ${response.status}`)
      return null
    }

    const data: SpotifySearchResponse = await response.json()

    // Find best match by comparing artist and title
    const exactMatch = data.albums.items.find(
      (album) =>
        album.artists.some((a) => a.name.toLowerCase() === artist.toLowerCase()) &&
        album.name.toLowerCase() === title.toLowerCase()
    )

    if (exactMatch) {
      return exactMatch.uri
    }

    // Fallback to first result if no exact match
    return data.albums.items[0]?.uri || null
  } catch (error) {
    console.error('Spotify search error:', error)
    return null
  }
}

/**
 * Search for album on Apple Music and return storefront URL
 */
export async function searchAppleMusicAlbum(artist: string, title: string): Promise<string | null> {
  try {
    const token = process.env.APPLE_MUSIC_JWT_TOKEN

    if (!token) {
      throw new Error('Apple Music JWT token not configured')
    }

    const query = encodeURIComponent(`${artist} ${title}`)
    const response = await fetch(
      `https://api.music.apple.com/v1/catalog/us/search?term=${query}&types=albums&limit=5`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
      console.error(`Apple Music search failed: ${response.status}`)
      return null
    }

    const data: AppleMusicSearchResponse = await response.json()
    const albums = data.results.albums?.data || []

    // Find best match by comparing artist and title
    const exactMatch = albums.find(
      (album) =>
        album.attributes.artistName.toLowerCase() === artist.toLowerCase() &&
        album.attributes.name.toLowerCase() === title.toLowerCase()
    )

    if (exactMatch) {
      return exactMatch.attributes.url
    }

    // Fallback to first result if no exact match
    return albums[0]?.attributes.url || null
  } catch (error) {
    console.error('Apple Music search error:', error)
    return null
  }
}
