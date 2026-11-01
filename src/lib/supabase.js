import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Fallback bernilai null agar aplikasi tetap berjalan dengan penyimpanan lokal saat env belum terisi
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

const OFFLINE_QUEUE_KEY = "mytps_offline_voter_queue"

export function getOfflineQueue() {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveToOfflineQueue(payload) {
  if (typeof window === "undefined") return
  const current = getOfflineQueue()
  current.push({ ...payload, queued_at: new Date().toISOString() })
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(current))
}

export async function syncOfflineQueue() {
  if (!supabase || typeof window === "undefined") return { synced: 0 }
  const queue = getOfflineQueue()
  if (queue.length === 0) return { synced: 0 }

  const cleanPayloads = queue.map(({ queued_at, ...rest }) => rest)
  const { error } = await supabase.from("pemilih").insert(cleanPayloads)

  if (!error) {
    localStorage.removeItem(OFFLINE_QUEUE_KEY)
    return { synced: cleanPayloads.length }
  }
  return { synced: 0, error }
}
