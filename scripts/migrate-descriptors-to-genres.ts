/* eslint-disable no-console */
import { promises as fs } from 'fs'

import prisma from '../lib/prisma'

// Types
interface MigrationResult {
  descriptorName: string
  descriptorId: string
  genreId: string
  albumCount: number
  timestamp: string
}

interface MigrationStats {
  totalDescriptorsChecked: number
  matchingDescriptorsFound: number
  albumsMigrated: number
  descriptorsDeleted: number
}

// Utility functions
const createTimestamp = (): string => new Date().toISOString().replace(/[:.]/g, '-')

const setupLogging = async (): Promise<string> => {
  const timestamp = createTimestamp()
  const logsDir = `${process.cwd()}/logs`

  await fs.mkdir(logsDir, { recursive: true })

  return `${logsDir}/descriptor-to-genre-migration-${timestamp}.json`
}

const findMatchingDescriptorsAndGenres = async () => {
  console.log('🔍 Finding descriptors that match existing genres...')

  // Get all descriptors and genres
  const descriptors = await prisma.descriptor.findMany({
    include: {
      albums: {
        select: { id: true, title: true },
      },
    },
  })

  const genres = await prisma.genre.findMany({
    select: { id: true, name: true },
  })

  // Create a map of genre names to genre IDs for quick lookup
  const genreMap = new Map(genres.map((genre) => [genre.name.toLowerCase(), genre]))

  // Find descriptors that match genre names (case-insensitive)
  const matches: Array<{
    descriptor: (typeof descriptors)[0]
    matchingGenre: (typeof genres)[0]
  }> = []

  for (const descriptor of descriptors) {
    const matchingGenre = genreMap.get(descriptor.name.toLowerCase())
    if (matchingGenre) {
      matches.push({ descriptor, matchingGenre })
      console.log(
        `📋 Found match: Descriptor "${descriptor.name}" matches Genre "${matchingGenre.name}" (${descriptor.albums.length} albums affected)`
      )
    }
  }

  return matches
}

const migrateDescriptorToGenre = async (
  descriptorId: string,
  descriptorName: string,
  genreId: string
): Promise<MigrationResult> => {
  console.log(`🔄 Migrating descriptor "${descriptorName}" to genre...`)

  // Get all albums currently linked to this descriptor
  const albumsWithDescriptor = await prisma.album.findMany({
    where: {
      descriptors: {
        some: { id: descriptorId },
      },
    },
    include: {
      genres: { select: { id: true } },
      descriptors: { select: { id: true } },
    },
  })

  let migratedCount = 0

  for (const album of albumsWithDescriptor) {
    // Check if the album already has this genre
    const alreadyHasGenre = album.genres.some((genre) => genre.id === genreId)

    if (!alreadyHasGenre) {
      // Add the genre to the album
      await prisma.album.update({
        where: { id: album.id },
        data: {
          genres: {
            connect: { id: genreId },
          },
        },
      })
      migratedCount++
      console.log(`  ✅ Added genre to album: ${album.title}`)
    } else {
      console.log(`  ℹ️  Album "${album.title}" already has this genre`)
    }

    // Remove the descriptor from the album
    await prisma.album.update({
      where: { id: album.id },
      data: {
        descriptors: {
          disconnect: { id: descriptorId },
        },
      },
    })
  }

  // Delete the descriptor (this will automatically remove all relationships)
  await prisma.descriptor.delete({
    where: { id: descriptorId },
  })

  console.log(
    `✅ Successfully migrated descriptor "${descriptorName}" - ${migratedCount} albums updated, descriptor deleted`
  )

  return {
    descriptorName,
    descriptorId,
    genreId,
    albumCount: albumsWithDescriptor.length,
    timestamp: new Date().toISOString(),
  }
}

const runMigration = async (dryRun: boolean = false): Promise<MigrationStats> => {
  const stats: MigrationStats = {
    totalDescriptorsChecked: 0,
    matchingDescriptorsFound: 0,
    albumsMigrated: 0,
    descriptorsDeleted: 0,
  }

  try {
    console.log('🚀 Starting descriptor to genre migration...')
    if (dryRun) {
      console.log('🔍 DRY RUN MODE - No changes will be made to the database')
    }

    // Find matching descriptors and genres
    const matches = await findMatchingDescriptorsAndGenres()

    stats.totalDescriptorsChecked = await prisma.descriptor.count()
    stats.matchingDescriptorsFound = matches.length

    if (matches.length === 0) {
      console.log('✨ No descriptors found that match existing genres. Database is clean!')
      return stats
    }

    console.log(`\n📊 Found ${matches.length} descriptors that match existing genres:`)
    for (const match of matches) {
      console.log(
        `  - "${match.descriptor.name}" → "${match.matchingGenre.name}" (${match.descriptor.albums.length} albums)`
      )
    }

    if (dryRun) {
      console.log('\n🔍 DRY RUN COMPLETE - No changes made')
      return stats
    }

    // Set up logging
    const logFile = await setupLogging()
    const migrationResults: MigrationResult[] = []

    console.log('\n🔄 Starting migration process...')

    // Migrate each matching descriptor
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i]
      console.log(`\n[${i + 1}/${matches.length}] Processing: ${match.descriptor.name}`)

      try {
        const result = await migrateDescriptorToGenre(
          match.descriptor.id,
          match.descriptor.name,
          match.matchingGenre.id
        )

        migrationResults.push(result)
        stats.albumsMigrated += result.albumCount
        stats.descriptorsDeleted++
      } catch (error) {
        console.error(`❌ Error migrating descriptor "${match.descriptor.name}":`, error)
      }
    }

    // Write log file
    if (migrationResults.length > 0) {
      await fs.writeFile(logFile, JSON.stringify(migrationResults, null, 2))
      console.log(`\n📝 Wrote migration results to ${logFile}`)
    }

    return stats
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

const printStats = (stats: MigrationStats, dryRun: boolean): void => {
  console.log(`\n📊 Migration Summary:`)
  console.log(`Total descriptors checked: ${stats.totalDescriptorsChecked}`)
  console.log(`Matching descriptors found: ${stats.matchingDescriptorsFound}`)
  if (!dryRun) {
    console.log(`Albums migrated: ${stats.albumsMigrated}`)
    console.log(`Descriptors deleted: ${stats.descriptorsDeleted}`)
  }
}

const printUsage = (): void => {
  console.log('❌ Invalid command. Available commands:')
  console.log('  dry-run - Preview what would be migrated without making changes')
  console.log('  migrate - Actually perform the migration')
  console.log('')
  console.log('Examples:')
  console.log('  yarn scripts:migrate-descriptors dry-run')
  console.log('  yarn scripts:migrate-descriptors migrate')
}

// Main execution logic
const main = async (): Promise<void> => {
  const args = process.argv.slice(2)
  const command = args[0]

  try {
    switch (command) {
      case 'dry-run': {
        const stats = await runMigration(true)
        printStats(stats, true)
        break
      }

      case 'migrate': {
        console.log('⚠️  This will permanently modify your database.')
        console.log('🚨 Make sure you have a backup before proceeding!')
        console.log('')

        const stats = await runMigration(false)
        printStats(stats, false)
        break
      }

      default: {
        printUsage()
        process.exit(1)
      }
    }

    console.log('\n🎉 Migration completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('💥 Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Execute with proper error handling
main()
