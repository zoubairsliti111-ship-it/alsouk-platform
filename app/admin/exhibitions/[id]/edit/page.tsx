"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import type { Exhibition } from "@/lib/domains/exhibition/types"

export default function AdminEditExhibitionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { lang, dir } = useLanguage()
  const isAr = lang === "ar"
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saveLoading, setSaveLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    organizer: "",
    description: "",
    categoriesStr: "",
    startDate: "",
    endDate: "",
    country: "TN",
    city: "",
    coverUrl: "",
    logoUrl: "",
    contactEmail: "",
    contactPhone: "",
    website: ""
  })

  useEffect(() => {
    const loadExhibition = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/exhibitions")
        const json = await res.json()
        if (json.success && json.data) {
          const found = json.data.find((e: Exhibition) => e.id === id)
          if (found) {
            // Helper to format ISO dates into datetime-local format
            const formatDate = (isoStr: string) => {
              if (!isoStr) return ""
              return new Date(isoStr).toISOString().slice(0, 16)
            }

            setFormData({
              name: found.name || "",
              organizer: found.organizer || "",
              description: found.description || "",
              categoriesStr: found.categories ? found.categories.join(", ") : "",
              startDate: formatDate(found.startDate),
              endDate: formatDate(found.endDate),
              country: found.country || "TN",
              city: found.city || "",
              coverUrl: found.coverUrl || "",
              logoUrl: found.logoUrl || "",
              contactEmail: found.contactEmail || "",
              contactPhone: found.contactPhone || "",
              website: found.website || ""
            })
          } else {
            setError(isAr ? "لم يتم العثور على المعرض" : "Exhibition not found")
          }
        } else {
          setError(json.error || "Failed to load details")
        }
        setLoading(false)
      } catch (err) {
        console.error("Exhibition details load error:", err)
        setError("Failed to fetch details.")
        setLoading(false)
      }
    }

    loadExhibition()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.organizer.trim() || !formData.startDate || !formData.endDate) {
      alert(isAr ? "يرجى ملء جميع الحقول الإلزامية." : "Please fill in all required fields.")
      return
    }

    try {
      setSaveLoading(true)
      const categories = formData.categoriesStr
        ? formData.categoriesStr.split(",").map((c) => c.trim()).filter(Boolean)
        : []

      const res = await fetch(`/api/admin/exhibitions/${id}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          ...formData,
          categories
        })
      })

      const json = await res.json()
      if (json.success) {
        router.push(`/admin/exhibitions/${id}`)
      } else {
        alert(json.error || "Failed to save changes")
      }
      setSaveLoading(false)
    } catch (err) {
      console.error("Exhibition update error:", err)
      alert("Error occurred while saving modifications.")
      setSaveLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 className="size-9 text-teal-400 animate-spin" />
        <span className="text-xs font-bold text-slate-400">{isAr ? "جاري تحميل تفاصيل المعرض..." : "Fetching specifications..."}</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-5">
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-xs font-bold text-red-400">
          {error}
        </div>
        <button
          onClick={() => router.push("/admin/exhibitions")}
          className="rounded-xl bg-slate-900 border border-slate-800 text-slate-200 px-5 py-2.5 text-xs font-black"
        >
          {isAr ? "العودة لقائمة المعارض" : "Back to Exhibition List"}
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8" dir={dir}>
      {/* HEADER BAR */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-5">
        <button
          onClick={() => router.push(`/admin/exhibitions/${id}`)}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"
        >
          <ArrowLeft className={`size-4.5 ${dir === "rtl" ? "rotate-180" : ""}`} />
        </button>
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-100 tracking-tight">
            {isAr ? "تعديل المعرض التجاري" : "Configure Exhibition"}
          </h2>
          <p className="text-slate-400 text-xs font-semibold">
            {isAr ? "تعديل التواريخ، جهات الاتصال، ومقاييس العرض العام." : "Modify dates, focal categories, geographical details, and brand logos."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900/40 border border-slate-800 p-6 rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Exhibition Name */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-300">
              {isAr ? "اسم المعرض *" : "Exhibition Name *"}
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Tunisia Food Expo 2026"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs font-bold text-slate-100 focus:border-teal-500 focus:outline-none min-h-[44px]"
            />
          </div>

          {/* Organizer */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-300">
              {isAr ? "الجهة المنظمة *" : "Organizer *"}
            </label>
            <input
              type="text"
              name="organizer"
              required
              placeholder="e.g. APIA Tunisia"
              value={formData.organizer}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs font-bold text-slate-100 focus:border-teal-500 focus:outline-none min-h-[44px]"
            />
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-300">
              {isAr ? "تاريخ البدء *" : "Start Date *"}
            </label>
            <input
              type="datetime-local"
              name="startDate"
              required
              value={formData.startDate}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs font-bold text-slate-100 focus:border-teal-500 focus:outline-none min-h-[44px]"
            />
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-300">
              {isAr ? "تاريخ الانتهاء *" : "End Date *"}
            </label>
            <input
              type="datetime-local"
              name="endDate"
              required
              value={formData.endDate}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs font-bold text-slate-100 focus:border-teal-500 focus:outline-none min-h-[44px]"
            />
          </div>

          {/* City */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-300">
              {isAr ? "المدينة المستضيفة *" : "Hosting City *"}
            </label>
            <input
              type="text"
              name="city"
              required
              placeholder="e.g. Tunis, sfax, Sousse"
              value={formData.city}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs font-bold text-slate-100 focus:border-teal-500 focus:outline-none min-h-[44px]"
            />
          </div>

          {/* Country */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-300">
              {isAr ? "البلد *" : "Country *"}
            </label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs font-bold text-slate-100 focus:border-teal-500 focus:outline-none min-h-[44px]"
            >
              <option value="TN">Tunisia (🇹🇳)</option>
              <option value="FR">France (🇫🇷)</option>
              <option value="DZ">Algeria (🇩🇿)</option>
              <option value="LY">Libya (🇱🇾)</option>
            </select>
          </div>

          {/* Categories */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-black text-slate-300">
              {isAr ? "التخصصات / الفئات (مفصولة بفاصلة) *" : "Exhibition Focus Categories (comma separated) *"}
            </label>
            <input
              type="text"
              name="categoriesStr"
              placeholder="e.g. Olive Oil, Agri-Food, Eco-Packaging"
              value={formData.categoriesStr}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs font-bold text-slate-100 focus:border-teal-500 focus:outline-none min-h-[44px]"
            />
          </div>

          {/* Description */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-black text-slate-300">
              {isAr ? "وصف المعرض" : "Exhibition Overview"}
            </label>
            <textarea
              name="description"
              rows={4}
              placeholder={isAr ? "اكتب تفاصيل جدول الأعمال وأهداف المعرض..." : "Write objectives, trade show focus, and buyer agenda details..."}
              value={formData.description}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs font-bold text-slate-100 focus:border-teal-500 focus:outline-none min-h-[100px]"
            />
          </div>

          {/* Branding - Cover URL */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-300">
              {isAr ? "رابط صورة الغلاف" : "Cover Asset Image URL"}
            </label>
            <input
              type="url"
              name="coverUrl"
              placeholder="https://images.unsplash.com/... or cloud storage URL"
              value={formData.coverUrl}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs font-bold text-slate-100 focus:border-teal-500 focus:outline-none min-h-[44px]"
            />
          </div>

          {/* Branding - Logo URL */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-300">
              {isAr ? "رابط شعار المعرض" : "Brand Logo Image URL"}
            </label>
            <input
              type="url"
              name="logoUrl"
              placeholder="https://images.unsplash.com/... or logo image URL"
              value={formData.logoUrl}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs font-bold text-slate-100 focus:border-teal-500 focus:outline-none min-h-[44px]"
            />
          </div>

          {/* Contacts - Email */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-300">
              {isAr ? "البريد الإلكتروني للتواصل" : "Contact Email"}
            </label>
            <input
              type="email"
              name="contactEmail"
              placeholder="expo@alsouk.com"
              value={formData.contactEmail}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs font-bold text-slate-100 focus:border-teal-500 focus:outline-none min-h-[44px]"
            />
          </div>

          {/* Contacts - Phone */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-300">
              {isAr ? "الهاتف للتواصل" : "Contact Phone"}
            </label>
            <input
              type="text"
              name="contactPhone"
              placeholder="+216 71 000 000"
              value={formData.contactPhone}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs font-bold text-slate-100 focus:border-teal-500 focus:outline-none min-h-[44px]"
            />
          </div>

          {/* Contacts - Website */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-black text-slate-300">
              {isAr ? "موقع الويب الرسمي" : "Official Website URL"}
            </label>
            <input
              type="url"
              name="website"
              placeholder="https://tunisiafoodexpo.tn"
              value={formData.website}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs font-bold text-slate-100 focus:border-teal-500 focus:outline-none min-h-[44px]"
            />
          </div>
        </div>

        {/* SUBMIT ACTIONS */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-800">
          <button
            type="button"
            onClick={() => router.push(`/admin/exhibitions/${id}`)}
            className="rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-slate-100 px-5 py-3 text-xs font-black transition-all min-h-11"
          >
            {isAr ? "إلغاء" : "Cancel"}
          </button>
          <button
            type="submit"
            disabled={saveLoading}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 px-6 py-3 text-xs font-black transition-all shadow-lg shadow-teal-500/10 min-h-11 disabled:opacity-50"
          >
            {saveLoading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            <span>{isAr ? "حفظ التعديلات" : "Save Specifications"}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
