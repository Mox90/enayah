import { TableCell, TableRow } from '@/components/ui/table'

interface Props {
  columns: number
}

export function DataTableSkeleton({ columns }: Props) {
  return (
    <>
      {Array.from({ length: 10 }).map((_, row) => (
        <TableRow key={row}>
          {Array.from({ length: columns }).map((_, col) => (
            <TableCell key={col}>
              <div className='h-4 w-full animate-pulse rounded bg-muted' />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}
