import { useEffect } from "react"
import { createPortal } from "react-dom"
import "./ConfirmDialog.css"

type Props = {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Supprimer",
  cancelLabel = "Annuler",
  onConfirm,
  onCancel,
}: Props) {

  // Ferme avec Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, onCancel])

  return createPortal(
    <>
      <div className={`confirm-overlay ${open ? "show" : ""}`} onClick={onCancel} />

      <div className={`confirm-dialog glass-panel ${open ? "show" : ""}`}>
        {open && (
          <>
            <h2 className="confirm-dialog__title">{title}</h2>
            <p className="confirm-dialog__message">{message}</p>

            <div className="confirm-dialog__actions">
              <button className="confirm-dialog__btn-cancel" onClick={onCancel}>
                {cancelLabel}
              </button>
              <button className="confirm-dialog__btn-confirm" onClick={onConfirm}>
                {confirmLabel}
              </button>
            </div>
          </>
        )}
      </div>
    </>,
    document.body
  )
}
