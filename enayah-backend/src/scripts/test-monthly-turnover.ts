import { HrDashboardRepository } from '../modules/hr/dashboard/repository/hr-dashboard.repository'

const main = async () => {
  const year = Number(process.argv[2] ?? 2026)
  const month = Number(process.argv[3] ?? 7)

  console.log(`Testing monthly turnover: ${year}-${month}`)

  const rows = await HrDashboardRepository.getMonthlyTurnover(year, month)

  console.table(
    rows.map((row: any) => ({
      department: row.departmentNameEn,
      workforce: row.workforceCategory,
      established: Number(row.establishedPositions),
      occupied: Number(row.occupiedPositions),
      vacant: Number(row.vacantPositions),
    })),
  )

  const totals = rows.reduce(
    (result: any, row: any) => {
      result.established += Number(row.establishedPositions)

      result.occupied += Number(row.occupiedPositions)

      result.vacant += Number(row.vacantPositions)

      return result
    },
    {
      established: 0,
      occupied: 0,
      vacant: 0,
    },
  )

  console.log('\nTotals:')
  console.table([totals])

  console.log('\nValidation:')

  let valid = true

  for (const row of rows as any[]) {
    const established = Number(row.establishedPositions)
    const occupied = Number(row.occupiedPositions)
    const vacant = Number(row.vacantPositions)

    if (established !== occupied + vacant) {
      valid = false

      console.error(`❌ ${row.departmentNameEn} / ${row.workforceCategory}`, {
        established,
        occupied,
        vacant,
      })
    }

    if (occupied > established) {
      valid = false

      console.error(`❌ Occupied exceeds established: ${row.departmentNameEn}`)
    }

    if (vacant < 0) {
      valid = false

      console.error(`❌ Negative vacancy: ${row.departmentNameEn}`)
    }
  }

  if (totals.established !== totals.occupied + totals.vacant) {
    valid = false

    console.error('❌ Overall totals do not balance.', totals)
  }

  if (valid) {
    console.log('✅ All turnover consistency checks passed.')
  } else {
    console.error('❌ Monthly turnover validation failed.')

    process.exitCode = 1
  }
}

main()
  .then(() => {
    process.exit()
  })
  .catch((error) => {
    console.error('Monthly turnover test failed:')
    console.error(error)

    process.exit(1)
  })
