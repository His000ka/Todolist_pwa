type Member = {
  id: string
  userId: string
  username?: string | null
  role: "owner" | "member" | string
}

type Friend = {
  id: string
  profile?: {
    id?: string
    username?: string | null
  }
}

type Props = {
  members: Member[]
  friendsNotInList: Friend[]
  listId: string
  isOwner: boolean

  onRemoveMember: (listId: string, userId: string) => void
  onAddMember: (friendId: string) => void
}

export default function SharePanel({
  members,
  friendsNotInList,
  listId,
  isOwner,
  onRemoveMember,
  onAddMember,
}: Props) {
  if (!isOwner) return null

  return (
    <div className="lc-share-panel">
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
              onClick={() => onRemoveMember(listId, m.userId)}
            >
              Retirer
            </button>
          )}
        </div>
      ))}

      {/* FRIENDS */}
      {friendsNotInList.length > 0 && (
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
                onClick={() => onAddMember(f.profile?.id ?? "")}
              >
                + Ajouter
              </button>
            </div>
          ))}
        </>
      )}
    </div>
  )
}