import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const boothId = searchParams.get("boothId")
    if (!boothId) {
      return NextResponse.json({ success: false, error: "missing_booth_id" }, { status: 400 })
    }

    // Generate a high-fidelity mock SVG/DataURI for the booth QR code
    // In a real production deployment, this renders a standard QRCode. Here we return structured metadata + simulated SVG content.
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://alsouk.com"
    const boothUrl = `${siteUrl}/exhibitions/booths/${boothId}`

    // Render a beautifully styled mock QR Code inside an SVG format
    const svgCode = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <rect width="200" height="200" fill="#ffffff" rx="16"/>
        <g fill="#1E3A8A">
          <!-- Top Left Marker -->
          <rect x="20" y="20" width="40" height="40" rx="4"/>
          <rect x="28" y="28" width="24" height="24" fill="#ffffff" rx="2"/>
          <rect x="34" y="34" width="12" height="12" rx="1"/>

          <!-- Top Right Marker -->
          <rect x="140" y="20" width="40" height="40" rx="4"/>
          <rect x="148" y="28" width="24" height="24" fill="#ffffff" rx="2"/>
          <rect x="154" y="34" width="12" height="12" rx="1"/>

          <!-- Bottom Left Marker -->
          <rect x="20" y="140" width="40" height="40" rx="4"/>
          <rect x="28" y="148" width="24" height="24" fill="#ffffff" rx="2"/>
          <rect x="34" y="154" width="12" height="12" rx="1"/>

          <!-- Middle Logo placeholder -->
          <rect x="85" y="85" width="30" height="30" rx="6" fill="#3B82F6"/>
          <text x="100" y="104" font-family="system-ui, sans-serif" font-size="11" font-weight="black" fill="#ffffff" text-anchor="middle">SOUK</text>

          <!-- Simulated random pixel noise blocks -->
          <rect x="75" y="20" width="10" height="10"/>
          <rect x="95" y="30" width="15" height="10"/>
          <rect x="120" y="25" width="10" height="15"/>
          <rect x="75" y="45" width="20" height="10"/>
          <rect x="110" y="50" width="15" height="10"/>

          <rect x="20" y="75" width="10" height="10"/>
          <rect x="40" y="75" width="15" height="10"/>
          <rect x="25" y="95" width="10" height="15"/>
          <rect x="45" y="110" width="15" height="10"/>

          <rect x="140" y="75" width="10" height="10"/>
          <rect x="160" y="85" width="15" height="10"/>
          <rect x="145" y="105" width="10" height="15"/>
          <rect x="165" y="120" width="15" height="10"/>

          <rect x="75" y="140" width="10" height="10"/>
          <rect x="95" y="150" width="15" height="10"/>
          <rect x="120" y="145" width="10" height="15"/>
          <rect x="75" y="165" width="20" height="10"/>
          <rect x="110" y="170" width="15" height="10"/>
        </g>
      </svg>
    `.trim()

    return NextResponse.json({
      success: true,
      data: {
        boothId,
        url: boothUrl,
        svg: `data:image/svg+xml;utf8,${encodeURIComponent(svgCode)}`,
      }
    })
  } catch (err: any) {
    console.error("[api/exhibitions/visitor/qr] GET failed:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { qrText } = await request.json()
    if (!qrText) {
      return NextResponse.json({ success: false, error: "missing_text" }, { status: 400 })
    }

    // Process a mock scan code and return target booth ID
    // Support formats like "booth-medina", or url extracts
    let resolvedId = qrText.trim()
    if (qrText.includes("booths/")) {
      resolvedId = qrText.split("booths/")[1]?.split("?")[0] || qrText
    }

    return NextResponse.json({
      success: true,
      data: {
        resolvedId,
        redirectUrl: `/exhibitions/visitor?scanId=${resolvedId}`,
      }
    })
  } catch (err: any) {
    console.error("[api/exhibitions/visitor/qr] POST failed:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
