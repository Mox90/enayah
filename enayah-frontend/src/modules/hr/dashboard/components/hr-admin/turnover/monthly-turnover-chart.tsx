// enayah-frontend/src/modules/hr/dashboard/components/hr-admin/turnover/monthly-turnover-panel.tsx

'use client'

import { useMemo } from 'react'

import { useLocale, useTranslations } from 'next-intl'

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type {
  MonthlyTurnoverRow,
  WorkforceCategory,
} from '../../../types/hr-dashboard.types'

import MonthlyTurnoverTooltip from './monthly-turnover-tooltip'

const numberFormatter = new Intl.NumberFormat('en-US')

// ==================================
// REPORT GROUP TYPES
// ==================================

type TurnoverGroupKey =
  | 'clinics'
  | 'alliedHealth'
  | 'infectionControl'
  | 'emergencyRoom'
  | 'intensiveCareUnit'
  | 'pediatricIntensiveCareUnit'
  | 'operatingRoom'
  | 'laborDelivery'
  | 'neonatalIntensiveCareUnit'
  | 'maleWard'
  | 'femaleWard'
  | 'pediatricWard'
  | 'obstetricsGynecology'
  | 'nursingOffice'
  | 'administration'
  | 'supportService'
  | 'other'

type TurnoverGroupDefinition = {
  key: TurnoverGroupKey

  departments?: string[]

  workforceCategories: WorkforceCategory[]
}

// ==================================
// DEPARTMENT NORMALIZATION
// ==================================

const normalizeDepartmentName = (value: string) => {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

// ==================================
// HISTORICAL REPORT GROUPS
// ==================================

const TURNOVER_GROUPS: TurnoverGroupDefinition[] = [
  // ----------------------------------
  // Clinics
  // ----------------------------------

  {
    key: 'clinics',

    workforceCategories: ['physician', 'nurse', 'allied_health'],

    departments: [
      'Cardiology',
      'Dermatology',
      'Family Medicine',
      'Gastroenterology',
      'General Surgery',
      'Internal Medicine',
      'Neurology',
      'Neurosurgery',
      'OB Clinic - OPD',

      'Opthalmology',
      'Ophthalmology',

      'Orthopedic Surgery',
      'Otorhinolaryngology',
      'Outpatient Clinic',
      'Pediatrics',

      'Physical Medicine & Rehabilitation',

      'Preventive Medicine',
      'Preventive Medicine Department',

      'Psychiatric Unit',
      'Pulmonology',
      'Rheumatology',
      'Urology',
      'Vascular Surgery',
    ],
  },

  // ----------------------------------
  // Allied Health
  // ----------------------------------

  {
    key: 'alliedHealth',

    workforceCategories: ['physician', 'nurse', 'allied_health'],

    departments: [
      'Anesthesiology',

      'Audiology',

      'Biomedical',
      'Biomedical Engineering Department',

      'CSSD',
      'Central Sterile Supply Department',

      'Dental',
      'Dental Services',

      'Dietary',

      'EMT & Paramedic',
      'Emergency Medical Services',

      'Health Education',
      'Health Education Section',

      'Laboratory',

      'Medical Administration',
      'Medical Records',

      'Nutrition & Dietitics',
      'Nutrition & Dietetics',

      'Patient Affairs',

      'Pharmacy',
      'Physical Therapy',

      /*
       * Psychiatric Unit intentionally
       * overlaps with Clinics.
       *
       * allied_health → Allied Health
       * physician/nurse → Clinics
       */
      'Psychiatric Unit',

      'Radiology',
      'Respiratory Therapy',
      'Social Services',
    ],
  },

  // ----------------------------------
  // Infection Control
  // ----------------------------------

  {
    key: 'infectionControl',

    workforceCategories: ['physician', 'nurse'],

    departments: ['Infection Control', 'Infection & Prevention Control'],
  },

  // ----------------------------------
  // Emergency Room
  // ----------------------------------

  {
    key: 'emergencyRoom',

    workforceCategories: ['physician', 'nurse'],

    departments: [
      'Emergency Room',
      'Emergency Room Ward',
      'Accident & Emergency',
    ],
  },

  // ----------------------------------
  // ICU
  // ----------------------------------

  {
    key: 'intensiveCareUnit',

    workforceCategories: ['physician', 'nurse'],

    departments: ['Intensive Care Unit'],
  },

  // ----------------------------------
  // PICU
  // ----------------------------------

  {
    key: 'pediatricIntensiveCareUnit',

    workforceCategories: ['physician', 'nurse'],

    departments: ['Pediatric Intensive Care Unit'],
  },

  // ----------------------------------
  // Operating Room
  // ----------------------------------

  {
    key: 'operatingRoom',

    workforceCategories: ['physician', 'nurse'],

    departments: ['Operating Room'],
  },

  // ----------------------------------
  // Labor & Delivery
  // ----------------------------------

  {
    key: 'laborDelivery',

    workforceCategories: ['physician', 'nurse'],

    departments: ['Labor & Delivery'],
  },

  // ----------------------------------
  // NICU
  // ----------------------------------

  {
    key: 'neonatalIntensiveCareUnit',

    workforceCategories: ['physician', 'nurse'],

    departments: ['Neonatal Intensive Care Unit'],
  },

  // ----------------------------------
  // Male Ward
  // ----------------------------------

  {
    key: 'maleWard',

    workforceCategories: ['physician', 'nurse'],

    departments: ['Male Ward', 'Male Medical Ward'],
  },

  // ----------------------------------
  // Female Ward
  // ----------------------------------

  {
    key: 'femaleWard',

    workforceCategories: ['physician', 'nurse'],

    departments: ['Female Ward', 'Femal Ward', 'Female Medical Ward'],
  },

  // ----------------------------------
  // Pediatric Ward
  // ----------------------------------

  {
    key: 'pediatricWard',

    workforceCategories: ['physician', 'nurse'],

    departments: ['Pediatric Ward'],
  },

  // ----------------------------------
  // Obstetrics & Gynecology
  // ----------------------------------

  {
    key: 'obstetricsGynecology',

    workforceCategories: ['physician', 'nurse'],

    departments: ['Obstetrics & Gynecology', 'Obstetrics Ward'],
  },

  // ----------------------------------
  // Nursing Office
  // ----------------------------------

  {
    key: 'nursingOffice',

    workforceCategories: ['nurse'],

    departments: [
      'Nursing Office & Academic Affairs',
      'Nursing Administration',
      'Academic Affairs & Training Administration',
    ],
  },

  // ----------------------------------
  // Administration
  // ----------------------------------

  {
    key: 'administration',

    workforceCategories: ['administrative'],
  },

  // ----------------------------------
  // Support Service
  // ----------------------------------

  {
    key: 'supportService',

    workforceCategories: ['support_service'],
  },
]

// ==================================
// WORKFORCE DISPLAY ORDER
// ==================================

const TURNOVER_WORKFORCE_ORDER: WorkforceCategory[] = [
  'physician',
  'nurse',
  'allied_health',
  'administrative',
  'support_service',
]

interface MonthlyTurnoverChartProps {
  rows: MonthlyTurnoverRow[]
  periodLabel: string
  isFetching: boolean
}

const MonthlyTurnoverChart = ({
  rows,
  periodLabel,
  isFetching,
}: MonthlyTurnoverChartProps) => {
  const locale = useLocale()

  const t = useTranslations('hrDashboard.admin')

  // ==================================
  // AGGREGATE GROUP + WORKFORCE
  // ==================================

  const chartData = useMemo(() => {
    if (!rows.length) {
      return []
    }

    type AggregatedTurnoverRow = {
      groupKey: TurnoverGroupKey

      workforceCategory: WorkforceCategory

      vacantPositions: number
      occupiedPositions: number
      establishedPositions: number

      departments: Set<string>
    }

    const aggregates = new Map<string, AggregatedTurnoverRow>()

    for (const row of rows) {
      let groupKey: TurnoverGroupKey = 'other'

      // ----------------------------------
      // Localized department name
      // ----------------------------------

      const displayDepartmentName =
        locale === 'ar'
          ? row.departmentNameAr?.trim() || row.departmentNameEn
          : row.departmentNameEn

      // ----------------------------------
      // Administration
      //
      // Aggregated hospital-wide.
      // ----------------------------------

      if (row.workforceCategory === 'administrative') {
        groupKey = 'administration'
      }

      // ----------------------------------
      // Support Service
      //
      // Aggregated hospital-wide.
      // ----------------------------------
      else if (row.workforceCategory === 'support_service') {
        groupKey = 'supportService'
      }

      // ----------------------------------
      // Clinical groups
      // ----------------------------------
      else {
        const normalizedDepartment = normalizeDepartmentName(
          row.departmentNameEn,
        )

        const matchingGroups = TURNOVER_GROUPS.filter((group) => {
          if (!group.departments?.length) {
            return false
          }

          if (!group.workforceCategories.includes(row.workforceCategory)) {
            return false
          }

          return group.departments.some(
            (department) =>
              normalizeDepartmentName(department) === normalizedDepartment,
          )
        })

        /*
         * Some departments intentionally
         * belong to more than one historical
         * reporting group.
         *
         * Psychiatric Unit:
         *
         * physician / nurse
         *   -> Clinics
         *
         * allied_health / Category 3000
         *   -> Allied Health
         */
        const matchedGroup =
          row.workforceCategory === 'allied_health'
            ? (matchingGroups.find((group) => group.key === 'alliedHealth') ??
              matchingGroups[0])
            : (matchingGroups.find((group) => group.key === 'clinics') ??
              matchingGroups[0])

        if (matchedGroup) {
          groupKey = matchedGroup.key
        }
      }

      // ----------------------------------
      // Group + workforce key
      // ----------------------------------

      const aggregateKey = `${groupKey}:${row.workforceCategory}`

      const existing = aggregates.get(aggregateKey)

      if (existing) {
        existing.vacantPositions += row.vacantPositions

        existing.occupiedPositions += row.occupiedPositions

        existing.establishedPositions += row.establishedPositions

        existing.departments.add(displayDepartmentName)

        continue
      }

      aggregates.set(aggregateKey, {
        groupKey,

        workforceCategory: row.workforceCategory,

        vacantPositions: row.vacantPositions,

        occupiedPositions: row.occupiedPositions,

        establishedPositions: row.establishedPositions,

        departments: new Set([displayDepartmentName]),
      })
    }

    // ----------------------------------
    // Workforce labels
    // ----------------------------------

    const workforceLabels: Record<WorkforceCategory, string> = {
      physician: t('staffTurnover.workforce.physician'),

      nurse: t('staffTurnover.workforce.nurse'),

      allied_health: t('staffTurnover.workforce.alliedHealth'),

      administrative: t('staffTurnover.workforce.administrative'),

      support_service: t('staffTurnover.workforce.supportService'),
    }

    // ----------------------------------
    // Group order
    // ----------------------------------

    const groupOrder = new Map<TurnoverGroupKey, number>(
      TURNOVER_GROUPS.map((group, index) => [group.key, index]),
    )

    groupOrder.set('other', TURNOVER_GROUPS.length)

    // ----------------------------------
    // Workforce order
    // ----------------------------------

    const workforceOrder = new Map<WorkforceCategory, number>(
      TURNOVER_WORKFORCE_ORDER.map((category, index) => [category, index]),
    )

    return (
      Array.from(aggregates.values())
        /*
         * Do not display workforce rows
         * without established positions.
         */
        .filter((row) => row.establishedPositions > 0)

        .map((row) => {
          const vacancyRate =
            (row.vacantPositions / row.establishedPositions) * 100

          const groupLabel = t(`staffTurnover.groups.${row.groupKey}`)

          const workforceLabel = workforceLabels[row.workforceCategory]

          const departments = Array.from(row.departments).sort((a, b) =>
            a.localeCompare(b, locale),
          )

          return {
            ...row,

            groupLabel,
            workforceLabel,

            departments,

            label: `${groupLabel} · ${workforceLabel}`,

            vacancyRate,

            /*
             * Example:
             *
             * 4 / 16 (25.0%)
             */
            vacancyDisplay: `${numberFormatter.format(
              row.vacantPositions,
            )} / ${numberFormatter.format(
              row.establishedPositions,
            )} (${vacancyRate.toFixed(1)}%)`,
          }
        })

        .sort((a, b) => {
          const aGroupOrder =
            groupOrder.get(a.groupKey) ?? Number.MAX_SAFE_INTEGER

          const bGroupOrder =
            groupOrder.get(b.groupKey) ?? Number.MAX_SAFE_INTEGER

          if (aGroupOrder !== bGroupOrder) {
            return aGroupOrder - bGroupOrder
          }

          const aWorkforceOrder =
            workforceOrder.get(a.workforceCategory) ?? Number.MAX_SAFE_INTEGER

          const bWorkforceOrder =
            workforceOrder.get(b.workforceCategory) ?? Number.MAX_SAFE_INTEGER

          return aWorkforceOrder - bWorkforceOrder
        })
    )
  }, [rows, locale, t])

  return (
    <div className='relative rounded-2xl border bg-[#ffeff6] p-6 shadow-sm dark:bg-muted/30'>
      {/* ==================================
          BACKGROUND REFRESH
      ================================== */}

      {isFetching && (
        <div className='absolute end-4 top-4 z-10 rounded-full bg-black/5 px-3 py-1 text-xs text-foreground dark:bg-white/10 dark:text-white'>
          {t('states.updating')}
        </div>
      )}

      {/* ==================================
          CHART HEADING
      ================================== */}

      <div className='mb-6 pe-24'>
        <div className='flex flex-wrap items-baseline gap-x-2 gap-y-1'>
          <h3 className='font-semibold'>
            {t('staffTurnover.monthly.chartTitle')}
          </h3>

          <span className='text-sm text-muted-foreground'>{periodLabel}</span>
        </div>

        <p className='mt-1 text-sm text-muted-foreground'>
          {t('staffTurnover.monthly.chartDescription')}
        </p>
      </div>

      {/* ==================================
          CHART
      ================================== */}

      <div className='overflow-x-auto'>
        <div className='min-w-[1050px]'>
          <ResponsiveContainer
            width='100%'
            height={Math.max(600, chartData.length * 42)}
            minWidth={0}
          >
            <BarChart
              data={chartData}
              layout='vertical'
              margin={{
                top: 8,
                right: 190,
                bottom: 8,
                left: 20,
              }}
            >
              <CartesianGrid
                strokeDasharray='3 3'
                stroke='rgba(148,163,184,0.25)'
                horizontal={false}
              />

              {/* ----------------------------------
                  Position count
              ---------------------------------- */}

              <XAxis
                type='number'
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{
                  fill: '#9ca3af',
                  fontSize: 12,
                }}
              />

              {/* ----------------------------------
                  Group + workforce
              ---------------------------------- */}

              <YAxis
                type='category'
                dataKey='label'
                width={320}
                interval={0}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{
                  fill: '#9ca3af',
                  fontSize: 12,
                }}
              />

              {/* ==================================
                  TOOLTIP
              ================================== */}

              <Tooltip
                cursor={{
                  fill: 'rgba(0,0,0,0.04)',
                }}
                wrapperStyle={{
                  zIndex: 50,
                  pointerEvents: 'none',
                }}
                content={<MonthlyTurnoverTooltip />}
              />

              <Legend />

              {/* ==================================
                  OCCUPIED

                  Occupied + Vacant =
                  Established
              ================================== */}

              <Bar
                dataKey='occupiedPositions'
                name={t('staffTurnover.monthly.metrics.occupied')}
                stackId='positions'
                fill='#22c55e'
                maxBarSize={24}
                animationDuration={700}
              />

              {/* ==================================
                  VACANT
              ================================== */}

              <Bar
                dataKey='vacantPositions'
                name={t('staffTurnover.monthly.metrics.vacant')}
                stackId='positions'
                fill='#f472b6'
                radius={[0, 7, 7, 0]}
                maxBarSize={24}
                animationDuration={700}
              >
                <LabelList
                  dataKey='vacancyDisplay'
                  position='right'
                  fill='#6b7280'
                  fontSize={11}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <p className='mt-4 text-xs text-muted-foreground'>
        {t('staffTurnover.monthly.chartValueNote')}
      </p>
    </div>
  )
}

export default MonthlyTurnoverChart
