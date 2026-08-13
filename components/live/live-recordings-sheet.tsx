"use client"

import { useEffect, useState } from "react"
import { Film, Trash2, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type Company = { id: string; name: string }

type RecordingRow = {
  id: string
  title: string
  ended_at: string | null
  replay_url: string | null
}

/**
 * Minimal recordings list for Studio — just enough to reach "delete
 * recording" for an ended session. Not a full broadcast history: no replay
 * preview, no pagination, nothing beyond title + date + delete.
 */
export function LiveRecordingsSheet({ company, onClose }: { company: Company; onClose: () => void }) {
  const [loading, setLoading] = useState(true)
  const [recordings, setRecordings] = useState<RecordingRow[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const supabase = createClient()
    supabase
      .from("live_sessions")
      .select("id,title,ended_at,replay_url")
      .eq("company_id", company.id)
      .eq("status", "ended")
      .not("replay_url", "is", null)
      .order("ended_at", { ascending: false })
      .then(({ data }: { data: RecordingRow[] | null }) => {
        if (active) {
          setRecordings(data ?? [])
          setLoading(false)
        }
      })
    return () => {
      active = false
    }
  }, [company.id])

  const deleteRecording = async (recording: RecordingRow) => {
    if (!confirm("Delete this recording? This action cannot be undone.")) return
    setDeletingId(recording.id)
    const supabase = createClient()
    const path = `${company.id}/${recording.id}.webm`
    try {
      await supabase.storage.from("live-recordings").remove([path])
      await supabase.from("live_sessions").update({ replay_url: null }).eq("id", recording.id)
      setRecordings((prev) => prev.filter((r) => r.id !== recording.id))
    } catch (err) {
      console.error("[live] Failed to delete recording:", err)
      alert("Couldn't delete this recording. Please try again.")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="absolute inset-x-0 bottom-0 z-30 max-h-[70vh] rounded-t-3xl bg-white flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="flex items-center gap-2 text-sm font-black text-foreground">
          <Film className="size-4" />
          Recordings
        </h3>
        <button type="button" onClick={onClose} className="text-muted-foreground">
          <X className="size-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading ? (
          <p className="text-xs text-muted-foreground text-center py-6">Loading...</p>
        ) : recordings.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">No recordings yet.</p>
        ) : (
          recordings.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-foreground">{r.title}</p>
                <p className="text-[10px] text-muted-foreground">{r.ended_at ? new Date(r.ended_at).toLocaleString() : ""}</p>
              </div>
              <button
                type="button"
                onClick={() => deleteRecording(r)}
                disabled={deletingId === r.id}
                className="flex shrink-0 items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-[11px] font-bold text-red-600 disabled:opacity-50"
              >
                <Trash2 className="size-3.5" />
                {deletingId === r.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
