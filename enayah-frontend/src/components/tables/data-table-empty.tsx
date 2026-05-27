import { TableCell, TableRow } from '@/components/ui/table'

interface Props {
  columns: number
}

export function DataTableEmpty({ columns }: Props) {
  return (
    <TableRow>
      <TableCell
        colSpan={columns}
        className='h-24 text-center text-muted-foreground'
      >
        No records found.
      </TableCell>
    </TableRow>
  )
}
