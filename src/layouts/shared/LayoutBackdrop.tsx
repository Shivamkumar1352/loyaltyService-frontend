type LayoutBackdropProps = {
  open: boolean
  onClose: () => void
}

export function LayoutBackdrop({ open, onClose }: LayoutBackdropProps) {
  if (!open) return null
  return <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} />
}
