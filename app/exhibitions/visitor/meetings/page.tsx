"use client"

import React, { useEffect, useState } from "react"
import {
  Calendar,
  Loader2,
  Clock,
  MapPin,
  ExternalLink,
  X,
  Send,
  Trash2,
  Edit2
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { VisitorDashboardLayout } from "@/components/exhibition/visitor-layout"
import { MarketplaceShell } from "@/components/marketplace/shell"
import { fetchMeetings, patchCancelMeeting, patchRescheduleMeeting } from "@/lib/services/exhibitions-client"
import type { ExhibitionMeeting } from "@/lib/domains/exhibition/types"
import Link from "next/link"

export default function VisitorMeetingsPage() {
  return (
    <MarketplaceShell>
      <VisitorMeetingsContent />
    </MarketplaceShell>
  )
}

function VisitorMeetingsContent() {
  const { t, lang } = useLanguage()
  const exT = t.exhibitions
  const [loading, setLoading] = useState(true)
  const [meetings, setMeetings] = useState<ExhibitionMeeting[]>([])

  // Reschedule Modal states
  const [activeRescheduleMeeting, setActiveRescheduleMeeting] = useState<ExhibitionMeeting | null>(null)
  const [rescheduleDate, setRescheduleDate] = useState("")
  const [rescheduleTime, setRescheduleTime] = useState("10:00 - 11:00")
  const [rescheduleNotes, setRescheduleNotes] = useState("")
  const [rescheduleSubmitting, setRescheduleSubmitting] = useState(false)

  const visitorId = "visitor-local"

  useEffect(() => {
    let active = true

    async function loadMeets() {
      try {
        const data = await fetchMeetings(visitorId)
        if (!active) return
        setMeetings(data || [])
        setLoading(false)
      } catch (err) {
        console.error("Load meetings failure:", err)
        if (active) setLoading(false)
      }
    }

    loadMeets()
    return () => {
      active = false
    }
  }, [])

  const handleCancel = async (meetingId: string) => {
    if (!confirm(lang === "ar" ? "هل أنت متأكد من رغبتك في إلغاء هذا اللقاء؟" : "Etes-vous sûr de vouloir annuler ce rendez-vous?")) return
    try {
      const res = await patchCancelMeeting(meetingId)
      if (res) {
        setMeetings(prev => prev.map(m => m.id === meetingId ? { ...m, status: "Cancelled" as const } : m))
      }
    } catch (err) {
      console.error("Cancel meeting failure:", err)
    }
  }

  const handleOpenReschedule = (meet: ExhibitionMeeting) => {
    setActiveRescheduleMeeting(meet)
    setRescheduleDate(meet.preferredDate)
    setRescheduleTime(meet.preferredTime)
    setRescheduleNotes(meet.notes || "")
  }

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeRescheduleMeeting) return

    setRescheduleSubmitting(true)
    try {
      const res = await patchRescheduleMeeting(activeRescheduleMeeting.id, rescheduleDate, rescheduleTime, rescheduleNotes)
      if (res.data) {
        setMeetings(prev => prev.map(m => m.id === activeRescheduleMeeting.id ? { ...m, preferredDate: rescheduleDate, preferredTime: rescheduleTime, notes: rescheduleNotes } : m))
        setActiveRescheduleMeeting(null)
      }
    } catch (err) {
      console.error("Reschedule meeting failure:", err)
    } finally {
      setRescheduleSubmitting(false)
    }
  }

  if (loading) {
    return (
      <VisitorDashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="size-8 text-primary animate-spin" />
          <span className="text-xs font-bold text-muted-foreground">{t.marketplace.loading}</span>
        </div>
      </VisitorDashboardLayout>
    )
  }

  return (
    <VisitorDashboardLayout>
      <div className="space-y-8">

        {/* Intro */}
        <section className="bg-card border border-border rounded-[20px] p-6 shadow-xs">
          <h2 className="text-base font-black text-foreground flex items-center gap-2">
            <Calendar className="size-5 text-primary" />
            <span>{lang === "ar" ? "إدارة اللقاءات الثنائية B2B" : lang === "fr" ? "Gestion des Réunions B2B" : "My B2B Networking Schedule"}</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1.5 leading-normal">
            {lang === "ar"
              ? "تابع مواعيدك وجلسات التفاوض الافتراضية مع الموردين والمصدرين الموثوقين بالمعرض."
              : lang === "fr"
              ? "Suivez vos créneaux horaires, annulez ou reprogrammez vos rendez-vous d'affaires."
              : "Track confirmation statuses, manage schedule timing, or request slot adjustments."}
          </p>
        </section>

        {/* Meetings List */}
        <section className="space-y-4">
          {meetings.length === 0 ? (
            <div className="text-center py-16 bg-secondary/15 rounded-3xl border border-dashed border-border">
              <Calendar className="size-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
              <p className="text-sm font-bold text-foreground">{lang === "ar" ? "لا توجد مواعيد لقاءات" : lang === "fr" ? "Aucune réunion planifiée" : "No scheduled B2B meetings yet."}</p>
              <p className="text-xs text-muted-foreground mt-1">{lang === "ar" ? "تصفح الأجنحة لجدولة لقاء خاص." : "Enter booth profiles to request virtual private meetings."}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {meetings.map((meet) => {
                const b = meet.booth
                return (
                  <div
                    key={meet.id}
                    className="p-5 bg-card border border-border rounded-[20px] shadow-3xs flex flex-col sm:flex-row justify-between gap-5 transition-all hover:border-primary/25"
                  >
                    {/* Meeting detail */}
                    <div className="space-y-3 flex-1 min-w-0">
                      <div className="flex items-start justify-between sm:justify-start gap-3 flex-wrap">
                        <h4 className="text-sm font-black text-foreground truncate">{b?.title || b?.company?.name || "Premium Exhibitor"}</h4>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          meet.status === "Accepted"
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            : meet.status === "Rejected"
                            ? "bg-red-500/10 text-red-600 border border-red-500/20"
                            : meet.status === "Cancelled"
                            ? "bg-slate-500/10 text-slate-600 border border-slate-500/20"
                            : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                        }`}>
                          {meet.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-muted-foreground font-semibold">
                        <div className="flex items-center gap-2">
                          <Calendar className="size-4 text-primary shrink-0" />
                          <span>{meet.preferredDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="size-4 text-primary shrink-0" />
                          <span>{meet.preferredTime} <span className="text-[10px] text-muted-foreground/80">(GMT+1)</span></span>
                        </div>
                        <div className="sm:col-span-2 flex items-center gap-2">
                          <MapPin className="size-4 text-primary shrink-0" />
                          <span>{b?.category || "Pavilion Booth"} — Booth #{b?.boothNumber || "General"}</span>
                        </div>
                      </div>

                      {meet.notes && (
                        <div className="bg-secondary/10 border border-border/50 p-3 rounded-xl text-[11px] text-muted-foreground italic leading-relaxed">
                          &quot;{meet.notes}&quot;
                        </div>
                      )}
                    </div>

                    {/* Action buttons block */}
                    <div className="flex sm:flex-col justify-end items-center sm:items-end gap-2.5 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-border/50">
                      {meet.status === "Pending" && (
                        <>
                          <button
                            onClick={() => handleOpenReschedule(meet)}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card hover:bg-secondary/40 px-3 py-2 text-xs font-bold text-foreground transition-all cursor-pointer min-h-11"
                          >
                            <Edit2 className="size-3.5 text-primary" />
                            <span>{lang === "ar" ? "تعديل الموعد" : lang === "fr" ? "Reporter" : "Reschedule"}</span>
                          </button>
                          <button
                            onClick={() => handleCancel(meet.id)}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 px-3 py-2 text-xs font-bold text-muted-foreground transition-all cursor-pointer min-h-11"
                          >
                            <Trash2 className="size-3.5" />
                            <span>{lang === "ar" ? "إلغاء الطلب" : lang === "fr" ? "Annuler" : "Cancel"}</span>
                          </button>
                        </>
                      )}

                      {b && (
                        <Link
                          href={`/exhibitions/tunisia-food-expo-2026/booths/${b.id}`}
                          className="size-11 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/15 text-primary flex items-center justify-center transition-all cursor-pointer"
                        >
                          <ExternalLink className="size-4.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

      </div>

      {/* Reschedule Slot Dialog Modal Overlay */}
      {activeRescheduleMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <h3 className="text-base font-black text-foreground flex items-center gap-2">
                <Calendar className="size-5 text-primary" />
                <span>{lang === "ar" ? "إعادة جدولة اللقاء" : lang === "fr" ? "Changer de Créneau" : "Reschedule Meeting"}</span>
              </h3>
              <button
                onClick={() => setActiveRescheduleMeeting(null)}
                className="size-8 rounded-xl border border-border hover:bg-secondary/40 flex items-center justify-center text-muted-foreground cursor-pointer min-h-11"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground">
                  {exT.meetingDate} *
                </label>
                <input
                  type="date"
                  required
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full rounded-xl border border-border bg-secondary/15 px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-primary min-h-11"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground">
                  {exT.meetingTime} *
                </label>
                <select
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full rounded-xl border border-border bg-secondary/15 px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-primary min-h-11 pr-10"
                >
                  <option value="09:00 - 10:00">09:00 - 10:00 (GMT+1)</option>
                  <option value="10:00 - 11:00">10:00 - 11:00 (GMT+1)</option>
                  <option value="11:00 - 12:00">11:00 - 12:00 (GMT+1)</option>
                  <option value="14:00 - 15:00">14:00 - 15:00 (GMT+1)</option>
                  <option value="15:00 - 16:00">15:00 - 16:00 (GMT+1)</option>
                  <option value="16:00 - 17:00">16:00 - 17:00 (GMT+1)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground">
                  {lang === "ar" ? "ملاحظات إضافية" : lang === "fr" ? "Notes supplémentaires" : "Additional Agenda Notes"}
                </label>
                <textarea
                  value={rescheduleNotes}
                  onChange={(e) => setRescheduleNotes(e.target.value)}
                  placeholder="Update your goals or inquiry agenda..."
                  rows={3}
                  className="w-full rounded-xl border border-border bg-secondary/15 p-3 text-xs outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={rescheduleSubmitting}
                  className="flex-1 rounded-xl bg-gradient-to-r from-primary to-blue-600 py-3.5 text-xs font-black text-white hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-2 min-h-11"
                >
                  {rescheduleSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>{exT.meetingSubmitting}</span>
                    </>
                  ) : (
                    <>
                      <Send className="size-4" />
                      <span>{lang === "ar" ? "حفظ التغييرات" : lang === "fr" ? "Mettre à jour" : "Save Changes"}</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRescheduleMeeting(null)}
                  className="rounded-xl border border-border px-4 py-3.5 hover:bg-secondary/40 text-xs font-bold text-foreground transition-all cursor-pointer min-h-11"
                >
                  {exT.cancel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </VisitorDashboardLayout>
  )
}
