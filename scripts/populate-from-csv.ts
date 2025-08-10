import { closePrismaConnection, importAllMusicCSV } from '../lib/csv-importer'

async function populateFromCsv() {
  try {
    console.log('📊 Starting AllMusic CSV import...')
    const { results, summary } = await importAllMusicCSV()
    console.log(`✅ Import completed: ${summary.successful} successful, ${summary.skipped} skipped, ${summary.failed} failed`)
    // Optionally print summary or results
    // console.log(results)
  } catch (error: any) {
    console.error('❌ Import error:', error)
    throw error
  } finally {
    await closePrismaConnection()
  }
}

populateFromCsv()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })

