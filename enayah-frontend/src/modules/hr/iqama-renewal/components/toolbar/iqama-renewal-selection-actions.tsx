// enayah-frontend/src/modules/hr/iqama-renewal/components/toolbar/iqama-renewal-selection-actions.tsx

'use client'

import { useState } from 'react'

import {
  ChevronDown,
  Download,
  Eye,
  File,
  FileSpreadsheet,
  FileText,
  MoreHorizontal,
  Printer,
} from 'lucide-react'

import { useLocale, useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import type {
  IqamaRenewalCase,
  IqamaRenewalStatus,
} from '../../types/iqama-renewal.types'
import { toast } from 'sonner'

interface Props {
  selectedIds: string[]
  selectedCases: IqamaRenewalCase[]
  onOpen: (id: string) => void
}

const STATUS_LABELS: Record<
  IqamaRenewalStatus,
  {
    en: string
    ar: string
  }
> = {
  pending_upload: {
    en: 'Pending Upload',
    ar: 'بانتظار الرفع',
  },

  uploaded_to_mhrsd: {
    en: 'Uploaded to MHRSD',
    ar: 'تم الرفع إلى الموارد البشرية',
  },

  under_process: {
    en: 'Under Process',
    ar: 'قيد المعالجة',
  },

  approved_by_mhrsd: {
    en: 'Approved by MHRSD',
    ar: 'معتمد من الموارد البشرية',
  },

  denied_by_mhrsd: {
    en: 'Denied by MHRSD',
    ar: 'مرفوض من الموارد البشرية',
  },

  sent_to_government_relations: {
    en: 'Sent to Government Relations',
    ar: 'تم الإرسال إلى العلاقات الحكومية',
  },

  eoc_required: {
    en: 'EOC Required',
    ar: 'يتطلب إنهاء الخدمة',
  },

  completed: {
    en: 'Completed',
    ar: 'مكتمل',
  },

  cancelled: {
    en: 'Cancelled',
    ar: 'ملغى',
  },
}

function toExcelNumber(
  value: string | number | null | undefined,
): number | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined
  }

  const parsed = Number(value)

  return Number.isFinite(parsed) ? parsed : undefined
}

function formatDateTime(value: string | Date | null | undefined) {
  if (!value) {
    return ''
  }

  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}`
}

export function IqamaRenewalSelectionActions({
  selectedIds,
  selectedCases,
  onOpen,
}: Props) {
  const locale = useLocale()
  const isRtl = locale === 'ar'

  const t = useTranslations('common')
  const it = useTranslations('iqamaRenewal')

  const [isExportingExcel, setIsExportingExcel] = useState(false)
  const [isExportingPdf, setIsExportingPdf] = useState(false)

  if (selectedIds.length === 0) {
    return null
  }

  const singleSelected = selectedIds.length === 1

  const compactSelectedCount =
    selectedIds.length > 9 ? '+9' : String(selectedIds.length)

  const handleExportExcel = async () => {
    if (!selectedCases.length || isExportingExcel) {
      return
    }

    try {
      setIsExportingExcel(true)

      /*
       * Browser-only Excel implementation.
       *
       * Load write-excel-file only when an export is requested.
       */
      const { default: writeExcelFile } =
        await import('write-excel-file/browser')
      const align = isRtl ? ('right' as const) : ('left' as const)
      const label = (en: string, ar: string) => (isRtl ? ar : en)
      const getHeader = (value: string) => ({
        value,
        fontWeight: 'bold' as const,
        align,
      })

      const getEmployeeName = (renewalCase: IqamaRenewalCase) => {
        if (isRtl) {
          return renewalCase.employeeNameAr ?? renewalCase.employeeNameEn ?? ''
        }

        return renewalCase.employeeNameEn ?? renewalCase.employeeNameAr ?? ''
      }

      const getStatus = (status: IqamaRenewalStatus | null | undefined) => {
        if (!status) {
          return ''
        }

        const statusLabel = STATUS_LABELS[status]

        if (!statusLabel) {
          return status
        }

        return isRtl ? statusLabel.ar : statusLabel.en
      }

      const columns = [
        /*
         * Employee
         */
        {
          header: getHeader(label('Employee Number', 'رقم الموظف')),

          cell: (renewalCase: IqamaRenewalCase) => ({
            value: toExcelNumber(renewalCase.employeeNumber),
            type: Number,
            format: '0',
            align,
          }),

          width: 18,
        },

        {
          header: getHeader(label('Employee Name', 'اسم الموظف')),

          cell: (renewalCase: IqamaRenewalCase) => ({
            value: getEmployeeName(renewalCase),
            type: String,
            align,
          }),

          width: 36,
        },

        /*
         * Iqama
         */
        {
          header: getHeader(label('Iqama Number', 'رقم الإقامة')),

          cell: (renewalCase: IqamaRenewalCase) => ({
            value: toExcelNumber(renewalCase.iqamaNumber),
            type: Number,
            format: '0',
            align,
          }),

          width: 20,
        },

        {
          header: getHeader(label('Iqama Expiry Date', 'تاريخ انتهاء الإقامة')),

          cell: (renewalCase: IqamaRenewalCase) => ({
            value: renewalCase.expiryDate ?? '',
            type: String,
            align,
          }),

          width: 20,
        },

        /*
         * Workflow
         */
        {
          header: getHeader(label('Status', 'الحالة')),

          cell: (renewalCase: IqamaRenewalCase) => ({
            value: getStatus(renewalCase.status),
            type: String,
            align,
          }),

          width: 28,
        },

        {
          header: getHeader(
            label('MHRSD Uploaded At', 'تاريخ الرفع للموارد البشرية'),
          ),

          cell: (renewalCase: IqamaRenewalCase) => ({
            value: formatDateTime(renewalCase.mhrsdUploadedAt),
            type: String,
            align,
          }),

          width: 24,
        },

        {
          header: getHeader(
            label('MHRSD Approved At', 'تاريخ اعتماد الموارد البشرية'),
          ),

          cell: (renewalCase: IqamaRenewalCase) => ({
            value: formatDateTime(renewalCase.mhrsdApprovedAt),
            type: String,
            align,
          }),

          width: 24,
        },

        {
          header: getHeader(
            label('MHRSD Denied At', 'تاريخ رفض الموارد البشرية'),
          ),

          cell: (renewalCase: IqamaRenewalCase) => ({
            value: formatDateTime(renewalCase.mhrsdDeniedAt),
            type: String,
            align,
          }),

          width: 24,
        },

        {
          header: getHeader(label('Denial Reason', 'سبب الرفض')),

          cell: (renewalCase: IqamaRenewalCase) => ({
            value: renewalCase.denialReason ?? '',
            type: String,
            align,
          }),

          width: 36,
        },

        /*
         * Government Relations
         */
        {
          header: getHeader(label('Assigned To', 'مسند إلى')),

          cell: (renewalCase: IqamaRenewalCase) => ({
            value: renewalCase.assignedToName ?? '',
            type: String,
            align,
          }),

          width: 28,
        },

        {
          header: getHeader(
            label(
              'Government Relations Due Date',
              'تاريخ استحقاق العلاقات الحكومية',
            ),
          ),

          cell: (renewalCase: IqamaRenewalCase) => ({
            value: renewalCase.governmentRelationsDueDate ?? '',
            type: String,
            align,
          }),

          width: 28,
        },

        /*
         * Notes
         */
        {
          header: getHeader(label('Notes', 'ملاحظات')),

          cell: (renewalCase: IqamaRenewalCase) => ({
            value: renewalCase.notes ?? '',
            type: String,
            align,
          }),

          width: 40,
        },

        /*
         * Audit dates
         */
        {
          header: getHeader(label('Created At', 'تاريخ الإنشاء')),

          cell: (renewalCase: IqamaRenewalCase) => ({
            value: formatDateTime(renewalCase.createdAt),
            type: String,
            align,
          }),

          width: 22,
        },

        {
          header: getHeader(label('Updated At', 'تاريخ آخر تحديث')),

          cell: (renewalCase: IqamaRenewalCase) => ({
            value: formatDateTime(renewalCase.updatedAt),
            type: String,
            align,
          }),

          width: 22,
        },
      ]

      const workbook = await writeExcelFile(selectedCases, {
        columns,
        sheet: isRtl ? 'تجديد الإقامة' : 'Iqama Renewal',
        rightToLeft: isRtl,
        stickyRowsCount: 1,
        showGridLines: true,
      })

      const now = new Date()

      const dateStamp = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0'),
      ].join('-')

      await workbook.toFile(`iqama-renewal-${dateStamp}.xlsx`)
    } catch (error) {
      console.error(
        'Failed to export selected Iqama renewal cases to Excel:',
        error,
      )
      toast.error(t('excelExportFailed'))
    } finally {
      setIsExportingExcel(false)
    }
  }

  const handleExportPdf = async () => {
    if (!selectedCases.length || isExportingPdf) {
      return
    }

    try {
      setIsExportingPdf(true)

      const [{ jsPDF }, { autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
      ])

      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      })

      doc.setLanguage(isRtl ? 'ar-SA' : 'en')
      doc.setR2L(isRtl)

      const align = isRtl ? ('right' as const) : ('left' as const)

      const label = (en: string, ar: string) => (isRtl ? ar : en)

      const getEmployeeName = (renewalCase: IqamaRenewalCase) => {
        if (isRtl) {
          return renewalCase.employeeNameAr ?? renewalCase.employeeNameEn ?? ''
        }

        return renewalCase.employeeNameEn ?? renewalCase.employeeNameAr ?? ''
      }

      const getStatus = (status: IqamaRenewalStatus | null | undefined) => {
        if (!status) {
          return ''
        }

        const statusLabel = STATUS_LABELS[status]

        if (!statusLabel) {
          return status
        }

        return isRtl ? statusLabel.ar : statusLabel.en
      }

      /*
       * Document title
       */
      const title = label('Iqama Renewal Cases', 'حالات تجديد الإقامة')

      const pageWidth = doc.internal.pageSize.getWidth()

      doc.setFontSize(14)

      doc.text(title, isRtl ? pageWidth - 8 : 8, 10, {
        align,
      })

      /*
       * Table
       */
      autoTable(doc, {
        head: [
          [
            label('Employee No.', 'رقم الموظف'),
            label('Employee Name', 'اسم الموظف'),
            label('Iqama Number', 'رقم الإقامة'),
            label('Expiry Date', 'تاريخ الانتهاء'),
            label('Status', 'الحالة'),
            label('MHRSD Uploaded', 'تاريخ الرفع للموارد البشرية'),
            label('MHRSD Approved', 'تاريخ الاعتماد'),
            label('MHRSD Denied', 'تاريخ الرفض'),
            label('Denial Reason', 'سبب الرفض'),
            label('Assigned To', 'مسند إلى'),
            label('Government Relations Due', 'استحقاق العلاقات الحكومية'),
            label('Notes', 'ملاحظات'),
            label('Created', 'تاريخ الإنشاء'),
            label('Updated', 'آخر تحديث'),
          ],
        ],

        body: selectedCases.map((renewalCase) => [
          renewalCase.employeeNumber ?? '',
          getEmployeeName(renewalCase),
          renewalCase.iqamaNumber ?? '',
          renewalCase.expiryDate ?? '',
          getStatus(renewalCase.status),

          formatDateTime(renewalCase.mhrsdUploadedAt),

          formatDateTime(renewalCase.mhrsdApprovedAt),

          formatDateTime(renewalCase.mhrsdDeniedAt),

          renewalCase.denialReason ?? '',
          renewalCase.assignedToName ?? '',

          renewalCase.governmentRelationsDueDate ?? '',

          renewalCase.notes ?? '',

          formatDateTime(renewalCase.createdAt),

          formatDateTime(renewalCase.updatedAt),
        ]),

        startY: 15,

        theme: 'grid',

        styles: {
          fontSize: 6.5,
          cellPadding: 1.2,
          halign: align,
          valign: 'middle',
          overflow: 'linebreak',
        },

        headStyles: {
          fontStyle: 'bold',
          halign: align,
        },

        margin: {
          top: 15,
          right: 8,
          bottom: 10,
          left: 8,
        },

        /*
         * Repeat Employee Number + Employee Name
         * if the table needs horizontal splitting.
         */
        horizontalPageBreak: true,
        horizontalPageBreakRepeat: [0, 1],
        horizontalPageBreakBehaviour: 'afterAllRows',

        showHead: 'everyPage',

        didDrawPage: () => {
          const currentPage = doc.getCurrentPageInfo().pageNumber

          const pageHeight = doc.internal.pageSize.getHeight()

          doc.setFontSize(7)

          doc.text(String(currentPage), pageWidth / 2, pageHeight - 4, {
            align: 'center',
          })
        },
      })

      const now = new Date()

      const dateStamp = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0'),
      ].join('-')

      doc.save(`iqama-renewal-${dateStamp}.pdf`)
    } catch (error) {
      console.error(
        'Failed to export selected Iqama renewal cases to PDF:',
        error,
      )
    } finally {
      setIsExportingPdf(false)
    }
  }

  return (
    <div className='flex shrink-0 items-center gap-1.5 sm:gap-2'>
      {/* Selected count */}
      <div
        className='flex h-10 min-w-10 shrink-0 items-center justify-center rounded-xl border bg-muted/40 px-2 text-sm font-medium sm:px-3'
        title={`${selectedIds.length} ${t('selected')}`}
      >
        <span className='sm:hidden'>{compactSelectedCount}</span>

        <span className='hidden whitespace-nowrap sm:inline'>
          {selectedIds.length} {t('selected')}
        </span>
      </div>

      {/* Export */}
      <DropdownMenu dir={isRtl ? 'rtl' : 'ltr'}>
        <DropdownMenuTrigger asChild>
          <Button
            type='button'
            variant='outline'
            size='icon'
            className='h-10 w-10 shrink-0 rounded-xl md:w-auto md:px-4'
            aria-label={t('export')}
            title={t('export')}
          >
            <Download className='h-4 w-4 shrink-0' />

            <span className='ms-2 hidden md:inline'>{t('export')}</span>

            <ChevronDown className='ms-1.5 hidden h-4 w-4 opacity-60 md:block' />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align='start' className='w-44'>
          <DropdownMenuItem
            disabled={isExportingExcel || selectedCases.length === 0}
            onSelect={() => {
              void handleExportExcel()
            }}
            className='hover:text-emerald-400'
          >
            <FileSpreadsheet className='me-2 h-4 w-4' />

            {t('excel')}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => console.log('Export Iqama CSV', selectedIds)}
          >
            <File className='me-2 h-4 w-4' />

            {t('csv')}
          </DropdownMenuItem>

          <DropdownMenuItem
            disabled={isExportingPdf || selectedCases.length === 0}
            onSelect={() => {
              void handleExportPdf()
            }}
          >
            <FileText className='me-2 h-4 w-4' />

            {t('pdf')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Print */}
      <Button
        type='button'
        variant='outline'
        size='icon'
        className='h-10 w-10 shrink-0 rounded-xl md:w-auto md:px-4'
        onClick={() => console.log('Print Iqama cases', selectedIds)}
        aria-label={t('print')}
        title={t('print')}
      >
        <Printer className='h-4 w-4 shrink-0' />

        <span className='ms-2 hidden md:inline'>{t('print')}</span>
      </Button>

      {/* Actions */}
      {singleSelected && (
        <DropdownMenu dir={isRtl ? 'rtl' : 'ltr'}>
          <DropdownMenuTrigger asChild>
            <Button
              type='button'
              variant='outline'
              size='icon'
              className='h-10 w-10 shrink-0 rounded-xl md:w-auto md:px-4'
              aria-label={t('actions')}
              title={t('actions')}
            >
              <MoreHorizontal className='h-4 w-4 shrink-0' />

              <span className='ms-2 hidden md:inline'>{t('actions')}</span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align='end' className='w-52'>
            <DropdownMenuItem onClick={() => onOpen(selectedIds[0]!)}>
              <Eye className='me-2 h-4 w-4' />

              {it('open')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
