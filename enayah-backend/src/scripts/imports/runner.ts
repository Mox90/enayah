import { runImport } from './run-import'

async function main() {
  console.log('🚀 Starting HR data import...')

  try {
    //await runImport(2, './Iqama.xlsx')
    //await runImport('employee-database', './Database.xlsx')
    await runImport('jawazat-database', './Iqama.xlsx')
    console.log('✅ Import completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('❌ Import failed:', error)
    process.exit(1)
  }
}

main()
