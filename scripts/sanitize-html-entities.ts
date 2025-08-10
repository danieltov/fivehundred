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

async function sanitizeEntities() {
  const changes: any[] = []
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const logsDir = path.join(process.cwd(), 'logs')
    await fs.mkdir(logsDir, { recursive: true })

    // Album.title
    const albums = await prisma.album.findMany()
    for (const album of albums) {
      const decoded = decodeHtmlEntities(album.title)
      if (decoded !== album.title) {
        await prisma.album.update({ where: { id: album.id }, data: { title: decoded } })
        changes.push({ table: 'Album', id: album.id, from: album.title, to: decoded })
        console.log(`[Album] ${album.title} -> ${decoded}`)
      }
    }

    // Genre.name
    const genres = await prisma.genre.findMany()
    for (const genre of genres) {
      const decoded = decodeHtmlEntities(genre.name)
      if (decoded !== genre.name) {
        // Check if decoded name already exists
        const existing = await prisma.genre.findUnique({ where: { name: decoded } })
        if (existing) {
          // CONSOLIDATE: Transfer relationships and delete duplicate
          const albumsWithEncodedGenre = await prisma.album.findMany({
            where: { genres: { some: { id: genre.id } } }
          })

          for (const album of albumsWithEncodedGenre) {
            await prisma.album.update({
              where: { id: album.id },
              data: {
                genres: {
                  connect: { id: existing.id },
                  disconnect: { id: genre.id }
                }
              }
            })
          }

          // Delete the duplicate encoded genre
          await prisma.genre.delete({ where: { id: genre.id } })
          console.log(`[Genre] Consolidated ${genre.name} -> ${decoded} (${albumsWithEncodedGenre.length} albums transferred)`)
          changes.push({ table: 'Genre', action: 'consolidated', from: genre.name, to: decoded, transferredAlbums: albumsWithEncodedGenre.length })
        } else {
          // NO EXISTING: Just rename
          await prisma.genre.update({ where: { id: genre.id }, data: { name: decoded } })
          changes.push({ table: 'Genre', action: 'renamed', id: genre.id, from: genre.name, to: decoded })
          console.log(`[Genre] ${genre.name} -> ${decoded}`)
        }
      }
    }

    // Descriptor.name
    const descriptors = await prisma.descriptor.findMany()
    for (const descriptor of descriptors) {
      const decoded = decodeHtmlEntities(descriptor.name)
      if (decoded !== descriptor.name) {
        // Check if decoded name already exists
        const existing = await prisma.descriptor.findUnique({ where: { name: decoded } })
        if (existing) {
          // CONSOLIDATE: Transfer relationships and delete duplicate
          const albumsWithEncodedDescriptor = await prisma.album.findMany({
            where: { descriptors: { some: { id: descriptor.id } } }
          })

          for (const album of albumsWithEncodedDescriptor) {
            await prisma.album.update({
              where: { id: album.id },
              data: {
                descriptors: {
                  connect: { id: existing.id },
                  disconnect: { id: descriptor.id }
                }
              }
            })
          }

          // Delete the duplicate encoded descriptor
          await prisma.descriptor.delete({ where: { id: descriptor.id } })
          console.log(`[Descriptor] Consolidated ${descriptor.name} -> ${decoded} (${albumsWithEncodedDescriptor.length} albums transferred)`)
          changes.push({ table: 'Descriptor', action: 'consolidated', from: descriptor.name, to: decoded, transferredAlbums: albumsWithEncodedDescriptor.length })
        } else {
          // NO EXISTING: Just rename
          await prisma.descriptor.update({ where: { id: descriptor.id }, data: { name: decoded } })
          changes.push({ table: 'Descriptor', action: 'renamed', id: descriptor.id, from: descriptor.name, to: decoded })
          console.log(`[Descriptor] ${descriptor.name} -> ${decoded}`)
        }
      }
    }

    // Artist.name
    const artists = await prisma.artist.findMany()
    for (const artist of artists) {
      const decoded = decodeHtmlEntities(artist.name)
      if (decoded !== artist.name) {
        // Check if decoded name already exists
        const existing = await prisma.artist.findUnique({ where: { name: decoded } })
        if (existing) {
          // CONSOLIDATE: Transfer relationships and delete duplicate
          const albumsWithEncodedArtist = await prisma.album.findMany({
            where: { artist: { some: { id: artist.id } } }
          })

          for (const album of albumsWithEncodedArtist) {
            await prisma.album.update({
              where: { id: album.id },
              data: {
                artist: {
                  connect: { id: existing.id },
                  disconnect: { id: artist.id }
                }
              }
            })
          }

          // Delete the duplicate encoded artist
          await prisma.artist.delete({ where: { id: artist.id } })
          console.log(`[Artist] Consolidated ${artist.name} -> ${decoded} (${albumsWithEncodedArtist.length} albums transferred)`)
          changes.push({ table: 'Artist', action: 'consolidated', from: artist.name, to: decoded, transferredAlbums: albumsWithEncodedArtist.length })
        } else {
          // NO EXISTING: Just rename
          await prisma.artist.update({ where: { id: artist.id }, data: { name: decoded } })
          changes.push({ table: 'Artist', action: 'renamed', id: artist.id, from: artist.name, to: decoded })
          console.log(`[Artist] ${artist.name} -> ${decoded}`)
        }
      }
    }

    // Write changes to a file for audit
    if (changes.length > 0) {
      const logFile = path.join(logsDir, `sanitized-entities-${timestamp}.json`)
      await fs.writeFile(logFile, JSON.stringify(changes, null, 2))
      console.log(`\n✅ Sanitized ${changes.length} values. See ${logFile} for details.`)
    } else {
      console.log('No HTML entities found to sanitize.')
    }
  } catch (error) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const logsDir = path.join(process.cwd(), 'logs')
    await fs.mkdir(logsDir, { recursive: true })
    const errorFile = path.join(logsDir, `sanitized-entities-error-${timestamp}.json`)
    await fs.writeFile(errorFile, JSON.stringify({ error: String(error) }, null, 2))
    console.error('Sanitization script error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

sanitizeEntities()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Script failed:', err)
    process.exit(1)
  })
