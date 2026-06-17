import { useState } from "react"
import Input from "../Input/Input"
import { LIST_EMOJIS } from "../../config/Constants"

type Props = {
  onCreate: (name: string, emoji: string) => void
  onClose: () => void
}

export default function CreateList({ onCreate, onClose }: Props) {
  const [name, setName] = useState("")
  const [emoji, setEmoji] = useState("📋")

  const handleSubmit = () => {
    if (!name.trim()) return
    onCreate(name.trim(), emoji)
    setName("")
    setEmoji("📋")
  }

  return (
    <div className="lc-new-list-form glass-panel">

      {/* EMOJIS */}
      <div className="lc-emoji-picker">
        {LIST_EMOJIS.map((e) => (
          <button
            key={e}
            className={`lc-emoji-btn ${e === emoji ? "active" : ""}`}
            onClick={() => setEmoji(e)}
          >
            {e}
          </button>
        ))}
      </div>

      {/* INPUT */}
      <div className="lc-new-list-input-row">
        <Input
          className="lc-new-list-input"
          value={name}
          placeholder="Nom de la liste..."
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          autoFocus
        />

        <button className="lc-new-list-confirm" onClick={handleSubmit}>
          Créer
        </button>

        <button className="lc-new-list-cancel" onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  )
}