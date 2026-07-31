# ALSOUK — DESIGN SYSTEM SPECIFICATION (10_DESIGN_SYSTEM)

**Author:** Chief Product Officer & Lead UX Architect
**Status:** Approved Product Blueprint
**Target Audience:** Frontend Developers, UI Designers, Design System Engineers
**Document Scope:** Visual Guidelines, Token Definitions, UI Primitives, and RTL Logic

---

## 1. Visual Design Tokens

The ALSOUK visual design is tailored for mobile screens, emphasizing clarity, high contrast, and rapid scanning.

### 1.1 Typography Colors & Hierarchy
We prioritize clean sans-serif typography across Arabic, French, and English layouts.
*   **Primary Font Family:** System Sans-Serif (`system-ui, -apple-system, sans-serif`).
*   **Arabic Fallback Font:** `Cairo` (must be explicitly configured to display Arabic script elegantly).
*   **Hierarchy:**
    *   **Page Title (Hero Bold):** `24px` / `line-height: 32px` / Bold (`font-weight: 700`)
    *   **Section Heading:** `18px` / `line-height: 24px` / Semi-Bold (`font-weight: 600`)
    *   **Sub-heading:** `16px` / `line-height: 22px` / Medium (`font-weight: 500`)
    *   **Body Regular:** `14px` / `line-height: 20px` / Regular (`font-weight: 400`)
    *   **Caption/Small:** `12px` / `line-height: 16px` / Regular (`font-weight: 400`)

### 1.2 Spacing & Sizing Standards
Strict spacing tokens maintain layout integrity on mobile viewports:
*   **Section Padding:** `24px` (Tailwind `p-6` or logical equivalence) to frame screen boundaries.
*   **Card Container Padding:** `16px` (Tailwind `p-4`) for inner card contents.
*   **Element Spacing (Gap):** `16px` (Tailwind `gap-4`) standard spacing between cards.
*   **Tap Targets:** Minimum size `48px` height for buttons and links to ensure mobile touch accuracy.

### 1.3 Border Radius Tokens
We reject sharp corporate borders. The SOUKI philosophy celebrates smooth, rounded elements:
*   **Cards & Modals:** Strict **20px border radius** (`rounded-[20px]`).
*   **Buttons:** Standard **12px border radius** (`rounded-xl`).
*   **Inputs:** Standard **10px border radius** (`rounded-lg`).

---

## 2. Color Palette (Tailwind V4 Theme)

```
===================================================================
PRIMARY BRAND
[  #1D4ED8  ] -> Premium B2B Royal Blue (Primary Buttons, Headers)
[  #10B981  ] -> SOUKI Green (WhatsApp CTAs, Success Banners)
===================================================================
SURFACES & BACKGROUNDS
[  #F8FAFC  ] -> Light Background Gray (Slate 50)
[  #FFFFFF  ] -> Pure White Card Base
[  #0F172A  ] -> Premium Dark Mode Surface (Slate 900)
===================================================================
NEUTRALS & BORDERS
[  #64748B  ] -> Cool Text Muted Slate (Slate 500)
[  #E2E8F0  ] -> Card Border & Dividers (Slate 200)
===================================================================
```

*   **Primary Blue (Royal):** `#1D4ED8` (Tailwind `blue-700`). Anchors professional trust.
*   **WhatsApp Green:** `#10B981` (Tailwind `emerald-500`). Used exclusively for conversational commerce triggers.
*   **Dark Slate (Text):** `#0F172A` (Tailwind `slate-900`). Strong readability contrast.
*   **Neutral Gray (Borders):** `#E2E8F0` (Tailwind `slate-200`). Clean, subtle partitions.

---

## 3. UI Primitives & Components

### 3.1 Buttons
*   **Primary Solid Button:** Royal Blue background, white text, semi-bold font, `rounded-xl` (12px), `min-h-[48px]`.
*   **WhatsApp Conversational Button:** Emerald Green background, white text, includes the custom inline SVG WhatsApp logo, `rounded-xl` (12px), `min-h-[48px]`.
*   **Secondary Outline Button:** Transparent background, Royal Blue border (`border-2`), Royal Blue text. Labelled "Create Free Account" on login views to drive acquisition.

### 3.2 Form Inputs
*   **Standard Inputs:** Rounded 10px (`rounded-lg`), slate border (`border-slate-200`), large typography labels.
*   **Tunisian Phone Input Adornment:**
    *   Must display the Tunisian flag emoji (🇹🇳) and static prefix (+216) styled as a unified field adornment.
    *   Enforces `maxLength={8}` on input elements to ensure clean database entry.

### 3.3 Cards (The SOUKI Card)
*   **Specification:** Pure white background, `rounded-[20px]` (20px), subtle shadow, slate border (`border border-slate-100`).
*   **Images:** Rendered as square ratios with native cover layouts.

---

## 4. Multi-Language & RTL Layout Rules

To ensure a seamless experience in both LTR (English, French) and RTL (Arabic) languages, **all layout positioning must utilize Tailwind logical properties** instead of absolute physical directions.

```
PHYSICAL VALUES (Do NOT Use)            LOGICAL VALUES (MANDATORY)
+----------------------------+          +----------------------------+
| - ml-4 / mr-4              |   ==>    | - ms-4 / me-4  (Margin)    |
| - pl-2 / pr-2              |          | - ps-2 / pe-2  (Padding)   |
| - border-l / border-r      |          | - border-s / border-e      |
| - left-0 / right-0         |          | - start-0 / end-0          |
+----------------------------+          +----------------------------+
```

1.  **Logical Margins & Padding:** Use `ms-*` (start margin) and `me-*` (end margin) instead of `ml-*` and `mr-*`. Use `ps-*` and `pe-*` instead of `pl-*` and `pr-*`.
2.  **RTL Direction Integration:** The platform automatically injects `<html dir="rtl">` based on the active language state in `LanguageProvider`. Standard browser layouts auto-reverse physical structures accordingly.
3.  **Arabic Typography Adjustments:** Set `line-height` explicitly when displaying Arabic (Cairo font) to prevent character clipping on letters like (ج, خ, ي).

---

## 5. Custom Inline SVG Icons

To avoid build-time compilation failures, **do not import brand icons from `lucide-react`** (as brand icons like TikTok and Facebook are missing in our active library version). Instead, use the following custom inline SVG components:

### 5.1 WhatsApp Custom SVG
```jsx
<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
  <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12c0 2.17.61 4.2 1.68 5.94L2 22l4.19-1.35C7.91 21.36 9.9 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm1.11 14.11c-.34-.17-2.02-1-2.33-1.11-.31-.11-.54-.17-.77.17-.23.34-.89 1.11-1.08 1.32-.2.21-.4.23-.74.06-1.52-.76-2.52-1.34-3.52-3.07-.26-.45-.26-.86-.03-1.22l.53-.74c.16-.23.23-.4.34-.63.11-.23.06-.43-.03-.6-.09-.17-.77-1.85-1.05-2.54-.28-.68-.57-.59-.77-.6h-.66c-.23 0-.6.09-.91.43-.31.34-1.2 1.17-1.2 2.85s1.23 3.3 1.4 3.52c.17.23 2.42 3.69 5.87 5.18.82.35 1.46.56 1.96.72.83.26 1.58.22 2.17.14.66-.1 2.02-.83 2.31-1.63.29-.8.29-1.48.2-1.63-.09-.14-.34-.23-.68-.4z" clipRule="evenodd" />
</svg>
```

### 5.2 Facebook Custom SVG
```jsx
<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
</svg>
```

### 5.3 TikTok Custom SVG
```jsx
<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.01 1.63 4.13.99 1.08 2.37 1.77 3.84 1.95v3.91c-1.89-.01-3.71-.58-5.26-1.67-.09-.06-.15-.07-.18-.01-.06.84-.04 1.68-.04 2.52 0 3.71-1.65 7.15-5.11 8.35-3.01 1.13-6.66.42-8.91-1.78-2.61-2.43-2.91-6.75-.72-9.52 2.01-2.62 5.75-3.34 8.65-1.78.07.04.12.02.12-.07V1.12c-.01-.34-.01-.68-.01-1.02h2.01z" />
</svg>
```

---

## 6. Accessibility & Contrast

*   **Color Contrast:** Ensure a minimum contrast ratio of **4.5:1** for all text elements.
*   **Keyboard Navigation:** Interactive elements must support visible focus rings (`focus-visible:ring-2 focus-visible:ring-blue-600`) to enable seamless keyboard and screen-reader navigation.
*   **Touch Screen Safeguards:** Enforce strict padding between overlapping touch targets to prevent accidental clicks on dense mobile views.
