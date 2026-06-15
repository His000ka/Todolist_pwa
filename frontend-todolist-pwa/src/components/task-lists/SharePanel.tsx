import { useState } from "react"
import type { TaskListMember } from "../../types/taskList"

type Friend = {
  id: string
  profile?: {
    id?: string
    username?: string | null
  }
}

type Props = {
  members: TaskListMember[]
  friendsNotInList: Friend[]
  hasFriends: boolean
  listId: string
  isOwner: boolean

  onRemoveMember: (listId: string, userId: string) => void | Promise<void>
  onAddMember: (friendId: string) => void | Promise<void>
}

export default function SharePanel({
  members,
  friendsNotInList,
  hasFriends,
  listId,
  isOwner,
  onRemoveMember,
  onAddMember,
}: Props) {
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())

  if (!isOwner) return null

  const withPending = async (id: string, action: () => void | Promise<void>) => {
    if (pendingIds.has(id)) return
    setPendingIds(prev => new Set(prev).add(id))
    try {
      await action()
    } finally {
      setPendingIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  return (
    <div className="lc-share-panel glass-panel">
      {/* MEMBERS */}
      <p className="lc-share-title">Membres actuels</p>

      {members.map((m) => (
        <div key={m.id} className="lc-member-row">
          <span className="lc-member-name">
            {m.username ?? "Utilisateur"}{" "}
            {m.role === "owner" ? "👑" : ""}
          </span>

          {m.role !== "owner" && (
            <button
              className="lc-member-remove"
              disabled={pendingIds.has(m.userId)}
              onClick={() => withPending(m.userId, () => onRemoveMember(listId, m.userId))}
            >
              Retirer
            </button>
          )}
        </div>
      ))}

      {/* FRIENDS */}
      {friendsNotInList.length > 0 ? (
        <>
          <p className="lc-share-title" style={{ marginTop: 12 }}>
            Ajouter un ami
          </p>

          {friendsNotInList.map((f) => (
            <div key={f.id} className="lc-member-row">
              <span className="lc-member-name">
                {f.profile?.username ?? "Ami"}
              </span>

              <button
                className="lc-member-add"
                disabled={pendingIds.has(f.id)}
                onClick={() => withPending(f.id, () => onAddMember(f.profile?.id ?? ""))}
              >
                + Ajouter
              </button>
            </div>
          ))}
        </>
      ) : (
        <p className="lc-share-empty">
          {hasFriends ? "Tous tes amis ont déjà accès" : "Ajoute des amis pour partager"}
        </p>
      )}
    </div>
  )
}