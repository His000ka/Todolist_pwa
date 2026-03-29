export function mapTaskLists(
  listsData: any[],
  membersData: any[],
  profilesData: any[],
  tasksData: any[]
) {
  const profileMap = new Map(
    profilesData?.map((p: any) => [p.id, p]) ?? []
  )

  return listsData.map((l: any) => ({
    id: l.id,
    ownerId: l.owner_id,
    name: l.name,
    emoji: l.emoji ?? "📋",
    createdAt: l.created_at,

    members: (membersData ?? [])
      .filter((m: any) => m.list_id === l.id)
      .map((m: any) => ({
        id: m.id,
        userId: m.user_id,
        role: m.role,
        username: profileMap.get(m.user_id)?.username ?? undefined,
      })),

    tasks: (tasksData ?? [])
      .filter((t: any) => t.list_id === l.id)
      .map((t: any) => ({
        id: t.id,
        listId: t.list_id,
        createdBy: t.created_by,
        text: t.text,
        done: t.done,
        createdAt: t.created_at,
      })),
  }))
}