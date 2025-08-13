import { type NextRequest, NextResponse } from "next/server"

interface DeckData {
  projectTitle: string
  description: string
  targetAudience?: string[]
  useCases?: string[]
  features: string[]
  benefits: string[]
  loomUrl: string
}

export async function POST(request: NextRequest) {
  try {
    console.log("PDF generation started")
    const deckData: DeckData = await request.json()
    console.log("Received deck data:", deckData.projectTitle)

    const isValidLoomUrl =
      deckData.loomUrl && (deckData.loomUrl.includes("loom.com") || deckData.loomUrl.startsWith("http"))

    // Generate HTML content for PDF
    const htmlContent = generatePDFHTML(deckData, isValidLoomUrl)
    console.log("Generated HTML content, length:", htmlContent.length)

    console.log("Returning HTML for client-side PDF generation")
    return new NextResponse(
      JSON.stringify({
        html: htmlContent,
        filename: `${deckData.projectTitle.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}-pitch-deck.pdf`,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  } catch (error) {
    console.error("PDF generation error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate PDF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

function generatePDFHTML(data: DeckData, isValidLoomUrl: boolean): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${data.projectTitle} - Pitch Deck</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #1e293b;
          background: white;
          padding: 40px 30px;
          font-size: 14px;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        .deck-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
        }
        
        /* Enhanced header styling with better alignment and spacing */
        .header {
          text-align: center;
          margin-bottom: 50px;
          padding-bottom: 30px;
          border-bottom: 3px solid #2563eb;
          page-break-after: avoid;
        }
        
        .badge {
          display: inline-block;
          padding: 10px 20px;
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          color: #1d4ed8;
          border-radius: 25px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.5px;
          margin-bottom: 20px;
          text-transform: uppercase;
          border: 2px solid #93c5fd;
        }
        
        .title {
          font-size: 42px;
          font-weight: 900;
          color: #0f172a;
          margin-bottom: 15px;
          line-height: 1.1;
          letter-spacing: -0.5px;
          text-align: center;
        }
        
        /* Professional section styling with consistent spacing */
        .section {
          margin-bottom: 35px;
          page-break-inside: avoid;
          padding: 0 5px;
        }
        
        .section-title {
          font-size: 24px;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 20px;
          padding: 15px 20px;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-left: 6px solid #2563eb;
          border-radius: 0 8px 8px 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-size: 18px;
        }
        
        .description-text {
          font-size: 16px;
          color: #475569;
          line-height: 1.8;
          margin-bottom: 20px;
          padding: 0 10px;
          text-align: left;
        }
        
        /* Enhanced audience tags with better visual hierarchy */
        .audience-section {
          margin-bottom: 25px;
        }
        
        .audience-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 20px;
          padding: 0 10px;
        }
        
        .audience-tag {
          background: linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%);
          color: #ea580c;
          padding: 10px 16px;
          border-radius: 20px;
          border: 2px solid #fdba74;
          font-size: 14px;
          font-weight: 600;
          text-transform: capitalize;
        }
        
        /* Improved list styling with better alignment and spacing */
        .list-container {
          padding: 0 10px;
        }
        
        .list-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 15px;
          padding: 12px 15px;
          background: #f8fafc;
          border-radius: 8px;
          border-left: 4px solid #10b981;
        }
        
        .list-icon {
          color: #10b981;
          font-weight: 900;
          font-size: 16px;
          margin-right: 15px;
          margin-top: 2px;
          min-width: 20px;
        }
        
        .list-text {
          font-size: 15px;
          color: #374151;
          line-height: 1.6;
          font-weight: 500;
        }
        
        /* Enhanced benefit items with better visual appeal */
        .benefit-item {
          background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
          color: #7c3aed;
          padding: 16px 20px;
          border-radius: 12px;
          border: 2px solid #c4b5fd;
          margin-bottom: 15px;
          font-weight: 600;
          font-size: 15px;
          line-height: 1.5;
          margin-left: 10px;
          margin-right: 10px;
        }
        
        /* Professional video section with functional clickable links */
        .loom-section {
          text-align: center;
          margin: 40px 0;
          padding: 30px 25px;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-radius: 15px;
          border: 3px solid #cbd5e1;
          page-break-inside: avoid;
        }
        
        .video-title {
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 20px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        /* Functional clickable video button with proper link styling */
        .loom-button {
          display: inline-block;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: white !important;
          padding: 16px 32px;
          border-radius: 12px;
          text-decoration: none !important;
          font-weight: 700;
          font-size: 18px;
          border: 3px solid #1e40af;
          transition: all 0.3s ease;
          cursor: pointer;
          margin: 10px 0;
          text-align: center;
          min-width: 200px;
        }
        
        .loom-button:hover {
          background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
          transform: translateY(-2px);
        }
        
        .video-url {
          margin-top: 15px;
          padding: 12px 20px;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          color: #64748b;
          word-break: break-all;
          text-align: center;
        }
        
        .video-instructions {
          margin-top: 15px;
          font-size: 14px;
          color: #64748b;
          font-style: italic;
          line-height: 1.5;
        }
        
        /* Professional footer with better spacing */
        .footer {
          margin-top: 50px;
          padding-top: 25px;
          border-top: 2px solid #e2e8f0;
          text-align: center;
          color: #64748b;
          font-size: 13px;
          font-weight: 500;
        }
        
        /* Enhanced print styles for better PDF rendering */
        @media print {
          body { 
            padding: 20px;
            font-size: 12px;
          }
          .section { 
            page-break-inside: avoid;
            margin-bottom: 25px;
          }
          .header {
            page-break-after: avoid;
          }
          .loom-section {
            page-break-inside: avoid;
          }
          .loom-button {
            color: white !important;
            text-decoration: none !important;
          }
        }
        
        /* Responsive adjustments for different PDF viewers */
        @page {
          margin: 20mm;
          size: A4;
        }
        
        /* Ensure proper spacing and alignment across all sections */
        .content-wrapper {
          max-width: 100%;
          margin: 0 auto;
        }
        
        .section-content {
          padding: 0 5px;
        }
      </style>
    </head>
    <body>
      <div class="deck-container">
        <div class="content-wrapper">
          <div class="header">
            <div class="badge">★ PROJECT PITCH DECK</div>
            <h1 class="title">${data.projectTitle}</h1>
          </div>
          
          <div class="section">
            <h2 class="section-title">📋 Project Overview</h2>
            <div class="section-content">
              <p class="description-text">${data.description}</p>
            </div>
          </div>
          
          ${
            data.targetAudience && data.targetAudience.length > 0
              ? `
          <div class="section audience-section">
            <h2 class="section-title">🎯 Target Audience</h2>
            <div class="section-content">
              <div class="audience-tags">
                ${data.targetAudience.map((audience) => `<span class="audience-tag">${audience}</span>`).join("")}
              </div>
            </div>
          </div>
          `
              : ""
          }
          
          ${
            data.useCases && data.useCases.length > 0
              ? `
          <div class="section">
            <h2 class="section-title">💡 Use Cases</h2>
            <div class="section-content">
              <div class="list-container">
                ${data.useCases
                  .map(
                    (useCase, index) => `
                  <div class="list-item">
                    <span class="list-icon">${index + 1}.</span>
                    <span class="list-text">${useCase}</span>
                  </div>
                `,
                  )
                  .join("")}
              </div>
            </div>
          </div>
          `
              : ""
          }
          
          <div class="section">
            <h2 class="section-title">⚡ Key Features</h2>
            <div class="section-content">
              <div class="list-container">
                ${data.features
                  .map(
                    (feature) => `
                  <div class="list-item">
                    <span class="list-icon">✓</span>
                    <span class="list-text">${feature}</span>
                  </div>
                `,
                  )
                  .join("")}
              </div>
            </div>
          </div>
          
          <div class="section">
            <h2 class="section-title">🚀 Benefits</h2>
            <div class="section-content">
              ${data.benefits
                .map(
                  (benefit) => `
                <div class="benefit-item">✨ ${benefit}</div>
              `,
                )
                .join("")}
            </div>
          </div>
          
          ${
            data.loomUrl && isValidLoomUrl
              ? `
          <div class="loom-section">
            <h2 class="video-title">🎥 Video Demonstration</h2>
            <a href="${data.loomUrl}" class="loom-button" target="_blank" rel="noopener noreferrer">
              ▶️ Watch Loom Video
            </a>
            <div class="video-url">
              <strong>Direct Link:</strong> ${data.loomUrl}
            </div>
            <p class="video-instructions">
              Click the button above or copy the direct link to view the video presentation.<br>
              This link will open in your default web browser.
            </p>
          </div>
          `
              : data.loomUrl
                ? `
          <div class="loom-section">
            <h2 class="video-title">🎥 Video Demonstration</h2>
            <div class="video-url">
              <strong>Video Link:</strong> ${data.loomUrl}
            </div>
            <p class="video-instructions">
              Copy and paste the link above into your web browser to view the video presentation.
            </p>
          </div>
          `
                : ""
          }
          
          <div class="footer">
            <p><strong>Generated from Loom Video Transcription</strong></p>
            <p>Created on ${new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}
