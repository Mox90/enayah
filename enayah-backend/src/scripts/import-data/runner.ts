import { runImport } from './importer'

async function main() {
  console.log('🚀 Starting HR data import...')

  try {
    await runImport()
    console.log('✅ Import completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('❌ Import failed:', error)
    process.exit(1)
  }
}

main()
