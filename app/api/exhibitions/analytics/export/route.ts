import { NextResponse } from "next/server"
import { getOrganizerAnalytics, getExhibitorAnalytics } from "@/lib/services/exhibitions-service"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id") || "exh-101"
    const type = searchParams.get("type") || "organizer" // organizer or exhibitor
    const format = searchParams.get("format") || "csv" // csv, excel, pdf
    const range = searchParams.get("range") || "7days"
    const startDate = searchParams.get("startDate") || undefined
    const endDate = searchParams.get("endDate") || undefined

    let csvData = ""
    let filename = `exhibition_analytics_${type}_${range}`

    if (type === "organizer") {
      const stats = await getOrganizerAnalytics(id, range, startDate, endDate)
      if (format === "csv" || format === "excel") {
        csvData = [
          ["SOUK EXHIBITIONS - ORGANIZER ANALYTICS REPORT"],
          ["Exhibition ID", id],
          ["Date Range", range],
          [],
          ["METRIC", "VALUE"],
          ["Total Exhibitions", stats.totalExhibitions],
          ["Total Booths", stats.totalBooths],
          ["Active Booths", stats.activeBooths],
          ["Pending Applications", stats.pendingApplications],
          ["Approved Applications", stats.approvedApplications],
          ["Rejected Applications", stats.rejectedApplications],
          ["Total Visitors", stats.totalVisitors],
          ["Unique Visitors", stats.uniqueVisitors],
          ["Total Meetings", stats.totalMeetings],
          ["Completed Meetings", stats.completedMeetings],
          ["Total RFQs", stats.totalRfqs],
          ["Total Catalog Downloads", stats.totalCatalogDownloads],
          ["QR Scans", stats.qrScans],
          ["Average Session Duration (seconds)", stats.averageSessionDuration],
          [],
          ["TOP PERFORMING BOOTHS"],
          ["Booth Number", "Company Name", "Views", "Contacts", "Rating"],
          ...stats.topPerformingBooths.map((b) => [
            b.boothNumber,
            b.companyName,
            b.views,
            b.contacts,
            b.rating,
          ]),
          [],
          ["TOP CATEGORIES"],
          ["Category Name", "Count", "Percentage"],
          ...stats.topCategories.map((c) => [c.name, c.count, `${c.percentage}%`]),
          [],
          ["VISITOR COUNTRIES"],
          ["Country Code", "Country Name", "Count", "Percentage"],
          ...stats.visitorCountries.map((c) => [c.code, c.name, c.count, `${c.percentage}%`]),
        ]
          .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(format === "excel" ? "\t" : ","))
          .join("\n")
      } else {
        // PDF (Return beautiful printable HTML template)
        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Organizer Analytics Report</title>
            <style>
              body { font-family: sans-serif; padding: 40px; color: #1e293b; }
              h1 { color: #0284c7; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 30px; }
              th, td { border: 1px solid #cbd5e1; padding: 12px; text-align: left; }
              th { bg-color: #f8fafc; background: #f8fafc; font-weight: bold; }
              .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; }
              .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; background: #f8fafc; }
              .num { font-size: 24px; font-weight: bold; color: #0284c7; margin-top: 5px; }
              @media print {
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="no-print" style="margin-bottom: 20px; text-align: right;">
              <button onclick="window.print()" style="background: #0284c7; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Print / Save as PDF</button>
            </div>
            <h1>ALSOUK Virtual Exhibitions — Organizer Analytics Report</h1>
            <p><strong>Exhibition ID:</strong> ${id} | <strong>Range:</strong> ${range}</p>

            <div class="grid">
              <div class="card">
                <div>Total Exhibitions</div>
                <div class="num">${stats.totalExhibitions}</div>
              </div>
              <div class="card">
                <div>Total Booths (Active)</div>
                <div class="num">${stats.totalBooths} (${stats.activeBooths})</div>
              </div>
              <div class="card">
                <div>Applications (Pending/Approved/Rejected)</div>
                <div class="num">${stats.pendingApplications} / ${stats.approvedApplications} / ${stats.rejectedApplications}</div>
              </div>
              <div class="card">
                <div>Total Visitors (Unique)</div>
                <div class="num">${stats.totalVisitors} (${stats.uniqueVisitors})</div>
              </div>
              <div class="card">
                <div>B2B Meetings (Completed)</div>
                <div class="num">${stats.totalMeetings} (${stats.completedMeetings})</div>
              </div>
              <div class="card">
                <div>Total RFQs Received</div>
                <div class="num">${stats.totalRfqs}</div>
              </div>
            </div>

            <h2>Top Performing Booths</h2>
            <table>
              <thead>
                <tr>
                  <th>Booth #</th>
                  <th>Exhibitor Name</th>
                  <th>Views</th>
                  <th>Contacts</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                ${stats.topPerformingBooths.map(b => `
                  <tr>
                    <td>${b.boothNumber}</td>
                    <td>${b.companyName}</td>
                    <td>${b.views}</td>
                    <td>${b.contacts}</td>
                    <td>${b.rating} / 5.0</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>

            <h2>Top Categories</h2>
            <table>
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Booth Count</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                ${stats.topCategories.map(c => `
                  <tr>
                    <td>${c.name}</td>
                    <td>${c.count}</td>
                    <td>${c.percentage}%</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </body>
          </html>
        `
        return new NextResponse(html, {
          headers: { "Content-Type": "text/html" },
        })
      }
    } else {
      const stats = await getExhibitorAnalytics(id, range, startDate, endDate)
      if (format === "csv" || format === "excel") {
        csvData = [
          ["SOUK EXHIBITIONS - EXHIBITOR ANALYTICS REPORT"],
          ["Booth ID", id],
          ["Date Range", range],
          [],
          ["METRIC", "VALUE"],
          ["Booth Views", stats.boothViews],
          ["Unique Visitors", stats.uniqueVisitors],
          ["Exhibit Views", stats.exhibitViews],
          ["Catalog Downloads", stats.catalogDownloads],
          ["Gallery Views", stats.galleryViews],
          ["Video Views", stats.videoViews],
          ["QR Scans", stats.qrScans],
          ["RFQs Received", stats.rfqsReceived],
          ["Meeting Requests", stats.meetingRequests],
          ["Accepted Meetings", stats.acceptedMeetings],
          ["Rejected Meetings", stats.rejectedMeetings],
          ["Completed Meetings", stats.completedMeetings],
          ["WhatsApp Clicks", stats.whatsAppClicks],
          ["Email Clicks", stats.emailClicks],
          ["Website Clicks", stats.websiteClicks],
          ["Conversion Rate (%)", `${stats.conversionRate}%`],
          [],
          ["EXHIBITS PERFORMANCE"],
          ["Exhibit Name", "Views", "Downloads"],
          ...stats.exhibitsPerformance.map((e) => [e.name, e.views, e.downloads]),
        ]
          .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(format === "excel" ? "\t" : ","))
          .join("\n")
      } else {
        // PDF (Return beautiful printable HTML template)
        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Exhibitor Analytics Report</title>
            <style>
              body { font-family: sans-serif; padding: 40px; color: #1e293b; }
              h1 { color: #059669; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 30px; }
              th, td { border: 1px solid #cbd5e1; padding: 12px; text-align: left; }
              th { bg-color: #f8fafc; background: #f8fafc; font-weight: bold; }
              .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; }
              .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; background: #f8fafc; }
              .num { font-size: 24px; font-weight: bold; color: #059669; margin-top: 5px; }
              @media print {
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="no-print" style="margin-bottom: 20px; text-align: right;">
              <button onclick="window.print()" style="background: #059669; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Print / Save as PDF</button>
            </div>
            <h1>ALSOUK Virtual Exhibitions — Exhibitor Analytics Report</h1>
            <p><strong>Booth ID:</strong> ${id} | <strong>Range:</strong> ${range}</p>

            <div class="grid">
              <div class="card">
                <div>Booth Views</div>
                <div class="num">${stats.boothViews}</div>
              </div>
              <div class="card">
                <div>Unique Visitors</div>
                <div class="num">${stats.uniqueVisitors}</div>
              </div>
              <div class="card">
                <div>Exhibit Views</div>
                <div class="num">${stats.exhibitViews}</div>
              </div>
              <div class="card">
                <div>Catalog Downloads</div>
                <div class="num">${stats.catalogDownloads}</div>
              </div>
              <div class="card">
                <div>B2B Meetings (Completed)</div>
                <div class="num">${stats.meetingRequests} (${stats.completedMeetings})</div>
              </div>
              <div class="card">
                <div>RFQs Received</div>
                <div class="num">${stats.rfqsReceived}</div>
              </div>
              <div class="card">
                <div>Conversion Rate</div>
                <div class="num">${stats.conversionRate}%</div>
              </div>
              <div class="card">
                <div>Contact Clicks (WhatsApp/Email/Web)</div>
                <div class="num">${stats.whatsAppClicks} / ${stats.emailClicks} / ${stats.websiteClicks}</div>
              </div>
            </div>

            <h2>Exhibits Performance</h2>
            <table>
              <thead>
                <tr>
                  <th>Exhibit Name</th>
                  <th>Views</th>
                  <th>Downloads</th>
                </tr>
              </thead>
              <tbody>
                ${stats.exhibitsPerformance.map(e => `
                  <tr>
                    <td>${e.name}</td>
                    <td>${e.views}</td>
                    <td>${e.downloads}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </body>
          </html>
        `
        return new NextResponse(html, {
          headers: { "Content-Type": "text/html" },
        })
      }
    }

    const fileType = format === "excel" ? "xls" : "csv"
    const contentType = format === "excel" ? "application/vnd.ms-excel" : "text/csv"

    return new NextResponse(csvData, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}.${fileType}"`,
      },
    })
  } catch (err) {
    console.error("[api/analytics/export] Failed to export report:", err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
