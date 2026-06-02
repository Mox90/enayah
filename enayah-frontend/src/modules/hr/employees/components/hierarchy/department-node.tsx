'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useLocale } from 'next-intl'

import { DepartmentHierarchyNode } from '../../types/employee-hierarchy.types'

interface Props {
  node: DepartmentHierarchyNode
}

export function DepartmentNode({ node }: Props) {
  const locale = useLocale()

  const isRTL = locale === 'ar'

  const [open, setOpen] = useState(false)

  return (
    <div className={isRTL ? 'mr-4' : 'ml-4'}>
      <button
        onClick={() => setOpen(!open)}
        className='flex items-center gap-2 font-semibold'
      >
        <ChevronDown
          className={`h-4 w-4 transition ${
            open ? '' : isRTL ? 'rotate-90' : '-rotate-90'
          }`}
        />

        <span>{isRTL ? node.nameAr : node.nameEn}</span>
      </button>

      {open && (
        <div className={isRTL ? 'mr-6 mt-2' : 'ml-6 mt-2'}>
          {/* PCNs */}
          {node.items.map((item) => (
            <div key={item.id} className='p-1 mb-2'>
              <div
                className={`font-medium ${item.status === 'filled' ? 'text-red-400' : 'text-green-600'}`}
              >
                {item.itemNumber} -{' '}
                {isRTL
                  ? item.positionTitleAr || item.positionTitleEn
                  : item.positionTitleEn}
              </div>

              <div className='text-sm text-muted-foreground'>
                {item.employee
                  ? `(${item.employee.employeeNumber}) ${
                      isRTL
                        ? item.employee.fullNameAr
                        : item.employee.fullNameEn
                    }`
                  : isRTL
                    ? 'شاغر'
                    : 'Vacant'}
              </div>
            </div>
          ))}

          {/* Children */}
          {node.children.map((child) => (
            <DepartmentNode key={child.id} node={child} />
          ))}
        </div>
      )}
    </div>
  )
}
