import { PrismaClient } from '@prisma/client'

import { searchSpotifyAlbum } from './music-apis'

// Simple HTML entity decoder for common entities
function decodeHtmlEntities(str: string): string {
  if (!str) return str
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&#34;/g, '"')
    .replace(/&#38;/g, '&')
    .replace(/&#60;/g, '<')
    .replace(/&#62;/g, '>')
}

const prisma = new PrismaClient()

prisma.$use(async (params, next) => {
  // Only intercept album.create
  if (params.model === 'Album' && params.action === 'create') {
    // Sanitize title
    if (params.args.data && params.args.data.title) {
      params.args.data.title = decodeHtmlEntities(params.args.data.title)
    }
    // If spotifyUri is missing, try to fetch it
    if (
      !params.args.data.spotifyUri &&
      params.args.data.artist &&
      Array.isArray(params.args.data.artist.connect) &&
      params.args.data.artist.connect.length > 0
    ) {
      // Fetch artist name from DB
      const artistId = params.args.data.artist.connect[0].id
      const artist = await prisma.artist.findUnique({ where: { id: artistId } })
      if (artist) {
        const spotifyUri = await searchSpotifyAlbum(artist.name, params.args.data.title)
        if (spotifyUri) {
          params.args.data.spotifyUri = spotifyUri
        }
      }
    }
  }
  return next(params)
})

export default prisma
