export const getStatusVariant = (status: string) => {
  switch (status) {
    case 'vacant':
      return 'bg-green-100 text-green-800 border-green-300'

    case 'filled':
      return 'bg-red-100 text-red-800 border-red-300'

    case 'reserved':
      return 'bg-blue-100 text-blue-800 border-blue-300'

    case 'frozen':
      return 'bg-rose-200 text-rose-900 border-rose-400'

    default:
      return ''
  }
}
