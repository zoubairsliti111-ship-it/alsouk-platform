"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Loader2, Sparkles, Plus } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

export default function AdminNewExhibitionPage() {
  const { lang, dir } = useLanguage()
  const isAr = lang === "ar"
  const router = useRouter()

  const [loading, setLoading] = useState(false)
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
      setLoading(true)
      const categories = formData.categoriesStr
        ? formData.categoriesStr.split(",").map((c) => c.trim()).filter(Boolean)
        : []

      const res = await fetch("/api/admin/exhibitions", {
        method: "POST",
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
        router.push("/admin/exhibitions")
      } else {
        alert(json.error || "Failed to create exhibition")
      }
      setLoading(false)
    } catch (err) {
      console.error("Exhibition creation error:", err)
      alert("Error occurred while creating exhibition.")
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8" dir={dir}>
      {/* HEADER NAVIGATION */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-5">
        <button
          onClick={() => router.push("/admin/exhibitions")}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"
        >
          <ArrowLeft className={`size-4.5 ${dir === "rtl" ? "rotate-180" : ""}`} />
        </button>
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-100 tracking-tight">
            {isAr ? "إضافة معرض تجاري جديد" : "Register Trade Show"}
          </h2>
          <p className="text-slate-400 text-xs font-semibold">
            {isAr ? "قم بتعبئة البيانات الأساسية لإطلاق معرض تجاري افتراضي فوري." : "Input core tradeshow attributes to host virtual booths instantly."}
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
            onClick={() => router.push("/admin/exhibitions")}
            className="rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-slate-100 px-5 py-3 text-xs font-black transition-all min-h-11"
          >
            {isAr ? "إلغاء" : "Cancel"}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 px-6 py-3 text-xs font-black transition-all shadow-lg shadow-teal-500/10 min-h-11 disabled:opacity-50"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            <span>{isAr ? "حفظ وإطلاق المعرض" : "Launch Exhibition"}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
