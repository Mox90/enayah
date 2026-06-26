import { useState } from 'react'

export function useDialogState<T>() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<T | null>(null)

  const add = () => {
    setEditing(null)
    setOpen(true)
  }

  const edit = (item: T) => {
    setEditing(item)
    setOpen(true)
  }

  const close = () => {
    setOpen(false)
    setEditing(null)
  }

  return {
    open,
    setOpen,
    editing,
    add,
    edit,
    close,
  }
}
