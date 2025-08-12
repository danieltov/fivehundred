import prisma from '../lib/prisma'

// Replace these with actual album titles from your collection
const top50AlbumTitles = [
  'Hounds of Love',
  'In a Silent Way',
  'Kala',
  'Another Green World',
  'Purple Rain',
  'My Beautiful Dark Twisted Fantasy',
  'Abbey Road',
  'Remain in Light',
  'Blue',
  'The Velvet Underground & Nico',
  'Blonde on Blonde',
  'Pet Sounds',
  'Kind of Blue',
  'Illinois',
  'Homogenic',
  'Kid A',
  'Murmur',
  'The Rise and Fall of Ziggy Stardust',
  'Songs in the Key of Life',
  'Selected Ambient Works Volume II',
  'The Black Saint and the Sinner Lady',
  'Discovery',
  'Sticky Fingers',
  'The Queen is Dead',
  'Rust Never Sleeps',
  'Pink Moon',
  'Heaven or Las Vegas',
  'Loveless',
  'good kid, m.A.A.d city',
  'A Love Supreme',
  'Renaissance',
  'Dummy',
  'The Idler Wheel',
  'Rumours',
  'The Low End Theory',
  'Funeral',
  'Is This It',
  'Aja',
  'Yeezus',
  'Future Days',
  'In the Aeroplane Over the Sea',
  'Sound of Silver',
  'Modern Vampires of the City',
  'I Never Loved a Man the Way I Love You',
  "If You're Feeling Sinister",
  'Emotion',
  'Art Angels',
  'Ray of Light',
  'Horses',
  'The Woods',
]

interface ProcessingStats {
  total: number
  updated: number
  failed: number
  cleared: number
  notFound: number
}

const updateTop50Rankings = async () => {
  const stats: ProcessingStats = { total: 0, updated: 0, failed: 0, cleared: 0, notFound: 0 }

  try {
    console.log('🏆 Starting Top 50 rankings update...')

    // Step 1: Clear existing rankings
    console.log('🧹 Clearing existing Top 50 rankings...')
    const clearResult = await prisma.album.updateMany({
      data: { topRanking: null },
    })
    stats.cleared = clearResult.count
    console.log(`✅ Cleared ${stats.cleared} existing rankings`)

    // Validate album titles array
    if (top50AlbumTitles.length === 0 || top50AlbumTitles[0] === 'Abbey Road') {
      console.log(
        '⚠️  Using example album titles. Please update the top50AlbumTitles array with your actual top 50 albums.'
      )
    }

    stats.total = top50AlbumTitles.length
    console.log(`📀 Setting rankings for ${stats.total} albums`)

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const logsDir = `${process.cwd()}/logs`
    const logFile = `${logsDir}/top50-update-${timestamp}.json`
    const failLogFile = `${logsDir}/top50-failures-${timestamp}.json`
    const notFoundLogFile = `${logsDir}/top50-not-found-${timestamp}.json`
    await import('fs/promises').then((fs) => fs.mkdir(logsDir, { recursive: true }))

    const successfulUpdates: any[] = []
    const failedUpdates: any[] = []
    const notFoundAlbums: any[] = []

    // Step 2: Set new rankings
    console.log('🎯 Setting new Top 50 rankings...')

    for (let i = 0; i < top50AlbumTitles.length; i++) {
      const albumTitle = top50AlbumTitles[i]
      const ranking = i + 1

      console.log(`[${ranking}/50] Searching for album: "${albumTitle}"`)

      try {
        // First search for the album by title (case-insensitive)
        const existingAlbums = await prisma.album.findMany({
          where: {
            title: {
              contains: albumTitle,
              mode: 'insensitive',
            },
          },
          include: {
            artist: { select: { name: true } },
          },
        })

        if (existingAlbums.length === 0) {
          console.log(`❌ Album not found: "${albumTitle}"`)
          stats.notFound++
          notFoundAlbums.push({
            title: albumTitle,
            ranking,
            reason: 'Album not found in database',
            timestamp: new Date().toISOString(),
          })
          continue
        }

        // If multiple albums found, use the first one and log the ambiguity
        let selectedAlbum = existingAlbums[0]
        if (existingAlbums.length > 1) {
          console.log(
            `⚠️  Multiple albums found for "${albumTitle}", using: "${selectedAlbum.title}" by ${selectedAlbum.artist[0]?.name}`
          )

          // Try to find exact match first
          const exactMatch = existingAlbums.find(
            (album) => album.title.toLowerCase() === albumTitle.toLowerCase()
          )
          if (exactMatch) {
            selectedAlbum = exactMatch
            console.log(
              `✅ Found exact match: "${selectedAlbum.title}" by ${selectedAlbum.artist[0]?.name}`
            )
          }
        }

        // Update the ranking
        await prisma.album.update({
          where: { id: selectedAlbum.id },
          data: { topRanking: ranking },
        })

        console.log(
          `✅ Set "${selectedAlbum.title}" by ${selectedAlbum.artist[0]?.name} to rank #${ranking}`
        )
        stats.updated++

        successfulUpdates.push({
          albumId: selectedAlbum.id,
          title: selectedAlbum.title,
          artist: selectedAlbum.artist[0]?.name,
          searchTerm: albumTitle,
          ranking,
          isExactMatch: selectedAlbum.title.toLowerCase() === albumTitle.toLowerCase(),
          alternativesFound: existingAlbums.length - 1,
          timestamp: new Date().toISOString(),
        })
      } catch (error) {
        console.error(`❌ Error processing album "${albumTitle}":`, error)
        stats.failed++
        failedUpdates.push({
          title: albumTitle,
          ranking,
          reason: String(error),
          timestamp: new Date().toISOString(),
        })
      }
    }

    // Write success log
    if (successfulUpdates.length > 0) {
      await import('fs/promises').then((fs) =>
        fs.writeFile(logFile, JSON.stringify(successfulUpdates, null, 2))
      )
      console.log(`📝 Wrote ${successfulUpdates.length} successful updates to ${logFile}`)
    }

    // Write failures log if any
    if (failedUpdates.length > 0) {
      await import('fs/promises').then((fs) =>
        fs.writeFile(failLogFile, JSON.stringify(failedUpdates, null, 2))
      )
      console.log(`❗️ Wrote ${failedUpdates.length} failures to ${failLogFile}`)
    }

    // Write not found log if any
    if (notFoundAlbums.length > 0) {
      await import('fs/promises').then((fs) =>
        fs.writeFile(notFoundLogFile, JSON.stringify(notFoundAlbums, null, 2))
      )
      console.log(`🔍 Wrote ${notFoundAlbums.length} not found albums to ${notFoundLogFile}`)
    }
  } catch (error) {
    console.error('❌ Top 50 update failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()

    // Step 3: Display final statistics
    console.log('\n📊 Top 50 Update Summary:')
    console.log(`Rankings cleared: ${stats.cleared}`)
    console.log(`Total albums processed: ${stats.total}`)
    console.log(`Successfully updated: ${stats.updated}`)
    console.log(`Not found in database: ${stats.notFound}`)
    console.log(`Failed to update: ${stats.failed}`)
    if (stats.total > 0) {
      console.log(`Success rate: ${((stats.updated / stats.total) * 100).toFixed(1)}%`)
      console.log(
        `Found rate: ${(((stats.updated + stats.failed) / stats.total) * 100).toFixed(1)}%`
      )
    }
  }
}

// Execute with proper error handling
updateTop50Rankings()
  .then(() => {
    console.log('🎉 Top 50 rankings updated successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Top 50 update failed:', error)
    process.exit(1)
  })
