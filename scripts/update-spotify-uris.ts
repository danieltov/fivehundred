import { PrismaClient } from '@prisma/client'
import { searchSpotifyAlbum } from '../lib/music-apis'

const prisma = new PrismaClient()

interface ProcessingStats {
  total: number
  updated: number
  failed: number
  skipped: number
}

async function updateSpotifyUris() {
  const stats: ProcessingStats = { total: 0, updated: 0, failed: 0, skipped: 0 }

  try {
    console.log('🎵 Starting Spotify URI migration...')

    // Step 4: Query albums missing Spotify URIs
    const albumsWithoutUri = await prisma.album.findMany({
      where: {
        spotifyUri: null,
      },
      include: {
        artist: true, // Include artist relation
      },
    })

    stats.total = albumsWithoutUri.length
    console.log(`📀 Found ${stats.total} albums without Spotify URIs`)

    if (stats.total === 0) {
      console.log('✅ All albums already have Spotify URIs!')
      return
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const logsDir = `${process.cwd()}/logs`
    const failLogFile = `${logsDir}/spotify-uri-failures-${timestamp}.json`
    await import('fs/promises').then((fs) => fs.mkdir(logsDir, { recursive: true }))
    const failedAlbums: any[] = []

    // Step 5: Process each album with rate limiting
    for (let i = 0; i < albumsWithoutUri.length; i++) {
      const album = albumsWithoutUri[i]

      // Handle albums with no artists
      if (!album.artist || album.artist.length === 0) {
        console.log(`⚠️  Skipping "${album.title}" - no artists found`)
        stats.skipped++
        failedAlbums.push({ id: album.id, title: album.title, reason: 'No artists found' })
        continue
      }

      // Use first artist for search (albums can have multiple artists)
      const primaryArtist = album.artist[0].name

      console.log(`[${i + 1}/${stats.total}] Searching: ${primaryArtist} - ${album.title}`)

      try {
        // Step 6: Call Spotify API
        const spotifyUri = await searchSpotifyAlbum(primaryArtist, album.title)

        if (spotifyUri) {
          // Step 7: Update database
          await prisma.album.update({
            where: { id: album.id },
            data: { spotifyUri },
          })

          console.log(`✅ Updated with URI: ${spotifyUri}`)
          stats.updated++
        } else {
          console.log(`❌ No Spotify match found`)
          stats.failed++
          failedAlbums.push({
            id: album.id,
            title: album.title,
            artist: primaryArtist,
            reason: 'No Spotify match found',
          })
        }
      } catch (error) {
        console.error(`❌ Error processing ${album.title}:`, error)
        stats.failed++
        failedAlbums.push({
          id: album.id,
          title: album.title,
          artist: primaryArtist,
          reason: String(error),
        })
      }

      // Step 8: Rate limiting (100ms between requests)
      if (i < albumsWithoutUri.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }

    // Write failures log if any
    if (failedAlbums.length > 0) {
      await import('fs/promises').then((fs) =>
        fs.writeFile(failLogFile, JSON.stringify(failedAlbums, null, 2))
      )
      console.log(`❗️ Wrote ${failedAlbums.length} failures to ${failLogFile}`)
    }
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()

    // Step 9: Display final statistics
    console.log('\n📊 Migration Summary:')
    console.log(`Total albums processed: ${stats.total}`)
    console.log(`Successfully updated: ${stats.updated}`)
    console.log(`Failed to find: ${stats.failed}`)
    console.log(`Skipped (no artist): ${stats.skipped}`)
    console.log(`Success rate: ${((stats.updated / stats.total) * 100).toFixed(1)}%`)
  }
}

// Step 10: Execute with proper error handling
updateSpotifyUris()
  .then(() => {
    console.log('🎉 Migration completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error)
    process.exit(1)
  })
