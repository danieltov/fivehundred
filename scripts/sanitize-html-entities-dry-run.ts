import { PrismaClient } from '@prisma/client'
import * as fs from 'fs/promises'
import * as path from 'path'

const prisma = new PrismaClient()

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
    // Add more as needed
}

async function dryRunSanitizeEntities() {
  const changes: any[] = []
  const consolidations: any[] = []

  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const logsDir = path.join(process.cwd(), 'logs')
    await fs.mkdir(logsDir, { recursive: true })
    console.log('🧪 DRY RUN MODE - No actual changes will be made\n')

    // Album.title
    console.log('📀 Checking Albums...')
    const albums = await prisma.album.findMany()
    let albumChanges = 0
    for (const album of albums) {
      const decoded = decodeHtmlEntities(album.title)
      if (decoded !== album.title) {
        albumChanges++
        changes.push({ table: 'Album', action: 'rename', id: album.id, from: album.title, to: decoded })
        console.log(`[Album] WOULD RENAME: ${album.title} -> ${decoded}`)
      }
    }
    console.log(`Found ${albumChanges} albums to rename\n`)

    // Genre.name
    console.log('🎵 Checking Genres...')
    const genres = await prisma.genre.findMany()
    let genreRenames = 0
    let genreConsolidations = 0

    for (const genre of genres) {
      const decoded = decodeHtmlEntities(genre.name)
      if (decoded !== genre.name) {
        // Check if decoded name already exists
        const existing = await prisma.genre.findUnique({ where: { name: decoded } })
        if (existing) {
          // WOULD CONSOLIDATE: Check relationships
          const albumsWithEncodedGenre = await prisma.album.findMany({
            where: { genres: { some: { id: genre.id } } },
            select: { id: true, title: true }
          })

          genreConsolidations++
          consolidations.push({
            table: 'Genre',
            action: 'consolidate',
            from: genre.name,
            to: decoded,
            duplicateId: genre.id,
            existingId: existing.id,
            affectedAlbums: albumsWithEncodedGenre.length,
            albums: albumsWithEncodedGenre.map(a => a.title)
          })

          console.log(`[Genre] WOULD CONSOLIDATE: ${genre.name} -> ${decoded}`)
          console.log(`  - Would transfer ${albumsWithEncodedGenre.length} album relationships`)
          console.log(`  - Would delete duplicate genre (ID: ${genre.id})`)
          if (albumsWithEncodedGenre.length > 0) {
            console.log(`  - Affected albums: ${albumsWithEncodedGenre.slice(0, 3).map(a => a.title).join(', ')}${albumsWithEncodedGenre.length > 3 ? '...' : ''}`)
          }
        } else {
          // WOULD RENAME
          genreRenames++
          changes.push({ table: 'Genre', action: 'rename', id: genre.id, from: genre.name, to: decoded })
          console.log(`[Genre] WOULD RENAME: ${genre.name} -> ${decoded}`)
        }
      }
    }
    console.log(`Found ${genreRenames} genres to rename, ${genreConsolidations} to consolidate\n`)

    // Descriptor.name
    console.log('🏷️  Checking Descriptors...')
    const descriptors = await prisma.descriptor.findMany()
    let descriptorRenames = 0
    let descriptorConsolidations = 0

    for (const descriptor of descriptors) {
      const decoded = decodeHtmlEntities(descriptor.name)
      if (decoded !== descriptor.name) {
        // Check if decoded name already exists
        const existing = await prisma.descriptor.findUnique({ where: { name: decoded } })
        if (existing) {
          // WOULD CONSOLIDATE: Check relationships
          const albumsWithEncodedDescriptor = await prisma.album.findMany({
            where: { descriptors: { some: { id: descriptor.id } } },
            select: { id: true, title: true }
          })

          descriptorConsolidations++
          consolidations.push({
            table: 'Descriptor',
            action: 'consolidate',
            from: descriptor.name,
            to: decoded,
            duplicateId: descriptor.id,
            existingId: existing.id,
            affectedAlbums: albumsWithEncodedDescriptor.length,
            albums: albumsWithEncodedDescriptor.map(a => a.title)
          })

          console.log(`[Descriptor] WOULD CONSOLIDATE: ${descriptor.name} -> ${decoded}`)
          console.log(`  - Would transfer ${albumsWithEncodedDescriptor.length} album relationships`)
          console.log(`  - Would delete duplicate descriptor (ID: ${descriptor.id})`)
          if (albumsWithEncodedDescriptor.length > 0) {
            console.log(`  - Affected albums: ${albumsWithEncodedDescriptor.slice(0, 3).map(a => a.title).join(', ')}${albumsWithEncodedDescriptor.length > 3 ? '...' : ''}`)
          }
        } else {
          // WOULD RENAME
          descriptorRenames++
          changes.push({ table: 'Descriptor', action: 'rename', id: descriptor.id, from: descriptor.name, to: decoded })
          console.log(`[Descriptor] WOULD RENAME: ${descriptor.name} -> ${decoded}`)
        }
      }
    }
    console.log(`Found ${descriptorRenames} descriptors to rename, ${descriptorConsolidations} to consolidate\n`)

    // Artist.name
    console.log('👤 Checking Artists...')
    const artists = await prisma.artist.findMany()
    let artistRenames = 0
    let artistConsolidations = 0

    for (const artist of artists) {
      const decoded = decodeHtmlEntities(artist.name)
      if (decoded !== artist.name) {
        // Check if decoded name already exists
        const existing = await prisma.artist.findUnique({ where: { name: decoded } })
        if (existing) {
          // WOULD CONSOLIDATE: Check relationships
          const albumsWithEncodedArtist = await prisma.album.findMany({
            where: { artist: { some: { id: artist.id } } },
            select: { id: true, title: true }
          })

          artistConsolidations++
          consolidations.push({
            table: 'Artist',
            action: 'consolidate',
            from: artist.name,
            to: decoded,
            duplicateId: artist.id,
            existingId: existing.id,
            affectedAlbums: albumsWithEncodedArtist.length,
            albums: albumsWithEncodedArtist.map(a => a.title)
          })

          console.log(`[Artist] WOULD CONSOLIDATE: ${artist.name} -> ${decoded}`)
          console.log(`  - Would transfer ${albumsWithEncodedArtist.length} album relationships`)
          console.log(`  - Would delete duplicate artist (ID: ${artist.id})`)
          if (albumsWithEncodedArtist.length > 0) {
            console.log(`  - Affected albums: ${albumsWithEncodedArtist.slice(0, 3).map(a => a.title).join(', ')}${albumsWithEncodedArtist.length > 3 ? '...' : ''}`)
          }
        } else {
          // WOULD RENAME
          artistRenames++
          changes.push({ table: 'Artist', action: 'rename', id: artist.id, from: artist.name, to: decoded })
          console.log(`[Artist] WOULD RENAME: ${artist.name} -> ${decoded}`)
        }
      }
    }
    console.log(`Found ${artistRenames} artists to rename, ${artistConsolidations} to consolidate\n`)

    // Write dry run results to files
    const dryRunResults = {
      summary: {
        totalChanges: changes.length,
        totalConsolidations: consolidations.length,
        albums: { renames: albumChanges },
        genres: { renames: genreRenames, consolidations: genreConsolidations },
        descriptors: { renames: descriptorRenames, consolidations: descriptorConsolidations },
        artists: { renames: artistRenames, consolidations: artistConsolidations }
      },
      changes,
      consolidations
    }
    const logFile = path.join(logsDir, `sanitize-dry-run-results-${timestamp}.json`)
    await fs.writeFile(logFile, JSON.stringify(dryRunResults, null, 2))

    // Summary
    console.log('📊 DRY RUN SUMMARY:')
    console.log(`Total operations planned: ${changes.length + consolidations.length}`)
    console.log(`  - Simple renames: ${changes.length}`)
    console.log(`  - Consolidations: ${consolidations.length}`)
    console.log(`\n📄 Detailed results saved to: ${logFile}`)
    console.log('\n✅ Dry run completed - no actual changes made!')

  } catch (error) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const logsDir = path.join(process.cwd(), 'logs')
    await fs.mkdir(logsDir, { recursive: true })
    const errorFile = path.join(logsDir, `sanitize-dry-run-error-${timestamp}.json`)
    await fs.writeFile(errorFile, JSON.stringify({ error: String(error) }, null, 2))
    console.error('Dry run error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

dryRunSanitizeEntities()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Dry run failed:', err)
    process.exit(1)
  })
