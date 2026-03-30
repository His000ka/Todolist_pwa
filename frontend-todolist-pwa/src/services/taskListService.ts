import { supabase } from "../lib/supabase"

export const taskListService = {
  async fetchLists() {
    return supabase.from("task_lists").select("*").order("created_at")
  },

  async fetchMembers(listIds: string[]) {
    return supabase
      .from("list_members")
      .select("id, list_id, user_id, role")
      .in("list_id", listIds)
  },

  async fetchProfiles(userIds: string[]) {
    return supabase
      .from("profiles")
      .select("id, username")
      .in("id", userIds)
  },

  async fetchTasks(listIds: string[]) {
    return supabase
      .from("simple_tasks")
      .select("*")
      .in("list_id", listIds)
      .order("created_at")
  },

  // mutations
  createList(data: { owner_id: string; name: string; emoji: string }) {
    return supabase.from("task_lists").insert(data).select().single()
  },

  deleteList(listId: string) {
    return supabase.from("task_lists").delete().eq("id", listId)
  },

  addMember(listId: string, userId: string) {
    return supabase.from("list_members").insert({
      list_id: listId,
      user_id: userId,
      role: "editor",
    })
  },

  removeMember(listId: string, userId: string) {
    return supabase
      .from("list_members")
      .delete()
      .eq("list_id", listId)
      .eq("user_id", userId)
  },

    addTask(listId: string, userId: string, text: string) {
    return supabase
        .from('simple_tasks')
        .insert({ list_id: listId, created_by: userId, text })
        .select()
        .single()  // ← retourne la row avec le vrai id
    },

  toggleTask(taskId: string, done: boolean) {
    return supabase.from("simple_tasks").update({ done: !done }).eq("id", taskId)
  },

  deleteTask(taskId: string) {
    return supabase.from("simple_tasks").delete().eq("id", taskId)
  },
}