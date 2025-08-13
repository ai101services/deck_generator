import type jsPDF from "jspdf"

interface DeckData {
  projectTitle: string
  description: string
  targetAudience?: string[]
  useCases?: string[]
  features: string[]
  benefits: string[]
  loomUrl: string
}

export async function generatePDFWithClickableLinks(pdf: jsPDF, data: DeckData): Promise<void> {
  const pageWidth = 210 // A4 width in mm
  const pageHeight = 297 // A4 height in mm
  const margin = 20
  const contentWidth = pageWidth - margin * 2

  let yPosition = margin
  const lineHeight = 7
  const sectionSpacing = 15

  // Helper function to add text with word wrapping
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize = 12): number => {
    pdf.setFontSize(fontSize)
    const lines = pdf.splitTextToSize(text, maxWidth)
    pdf.text(lines, x, y)
    return y + lines.length * lineHeight
  }

  // Helper function to check if we need a new page
  const checkPageBreak = (requiredSpace: number): number => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      pdf.addPage()
      return margin
    }
    return yPosition
  }

  // Header with badge and title
  yPosition = checkPageBreak(40)

  // Badge
  pdf.setFillColor(219, 234, 254) // Light blue background
  pdf.setDrawColor(147, 197, 253) // Blue border
  pdf.roundedRect(margin + 50, yPosition, 110, 12, 3, 3, "FD")
  pdf.setTextColor(29, 78, 216) // Blue text
  pdf.setFontSize(10)
  pdf.setFont("helvetica", "bold")
  pdf.text("★ PROJECT PITCH DECK", pageWidth / 2, yPosition + 8, { align: "center" })

  yPosition += 20

  // Title
  pdf.setTextColor(15, 23, 42) // Dark text
  pdf.setFontSize(24)
  pdf.setFont("helvetica", "bold")
  const titleLines = pdf.splitTextToSize(data.projectTitle, contentWidth)
  pdf.text(titleLines, pageWidth / 2, yPosition, { align: "center" })
  yPosition += titleLines.length * 10 + sectionSpacing

  // Divider line
  pdf.setDrawColor(37, 99, 235)
  pdf.setLineWidth(1)
  pdf.line(margin, yPosition, pageWidth - margin, yPosition)
  yPosition += sectionSpacing

  // Project Overview Section
  yPosition = checkPageBreak(30)
  pdf.setTextColor(30, 41, 59)
  pdf.setFontSize(16)
  pdf.setFont("helvetica", "bold")
  pdf.text("📋 PROJECT OVERVIEW", margin, yPosition)
  yPosition += 12

  pdf.setTextColor(71, 85, 105)
  pdf.setFontSize(12)
  pdf.setFont("helvetica", "normal")
  yPosition = addWrappedText(data.description, margin, yPosition, contentWidth) + sectionSpacing

  // Target Audience Section
  if (data.targetAudience && data.targetAudience.length > 0) {
    yPosition = checkPageBreak(30)
    pdf.setTextColor(30, 41, 59)
    pdf.setFontSize(16)
    pdf.setFont("helvetica", "bold")
    pdf.text("🎯 TARGET AUDIENCE", margin, yPosition)
    yPosition += 12

    // Audience tags
    let xPos = margin
    const tagHeight = 8
    const tagPadding = 4

    data.targetAudience.forEach((audience) => {
      const tagWidth = pdf.getTextWidth(audience) + tagPadding * 2

      if (xPos + tagWidth > pageWidth - margin) {
        xPos = margin
        yPosition += tagHeight + 5
      }

      // Tag background
      pdf.setFillColor(255, 247, 237) // Light orange
      pdf.setDrawColor(253, 186, 116) // Orange border
      pdf.roundedRect(xPos, yPosition - tagHeight + 2, tagWidth, tagHeight, 2, 2, "FD")

      // Tag text
      pdf.setTextColor(234, 88, 12) // Orange text
      pdf.setFontSize(10)
      pdf.setFont("helvetica", "bold")
      pdf.text(audience, xPos + tagPadding, yPosition - 2)

      xPos += tagWidth + 8
    })

    yPosition += sectionSpacing
  }

  // Use Cases Section
  if (data.useCases && data.useCases.length > 0) {
    yPosition = checkPageBreak(30)
    pdf.setTextColor(30, 41, 59)
    pdf.setFontSize(16)
    pdf.setFont("helvetica", "bold")
    pdf.text("💡 USE CASES", margin, yPosition)
    yPosition += 12

    data.useCases.forEach((useCase, index) => {
      yPosition = checkPageBreak(15)

      // Background box
      const boxHeight = 12
      pdf.setFillColor(248, 250, 252) // Light gray
      pdf.setDrawColor(16, 185, 129) // Green border
      pdf.setLineWidth(0.5)
      pdf.rect(margin, yPosition - 8, contentWidth, boxHeight, "FD")
      pdf.line(margin, yPosition - 8, margin, yPosition + 4) // Left border

      // Number and text
      pdf.setTextColor(16, 185, 129)
      pdf.setFontSize(12)
      pdf.setFont("helvetica", "bold")
      pdf.text(`${index + 1}.`, margin + 3, yPosition - 2)

      pdf.setTextColor(55, 65, 81)
      pdf.setFont("helvetica", "normal")
      yPosition = addWrappedText(useCase, margin + 15, yPosition - 2, contentWidth - 15, 11) + 5
    })

    yPosition += sectionSpacing
  }

  // Key Features Section
  yPosition = checkPageBreak(30)
  pdf.setTextColor(30, 41, 59)
  pdf.setFontSize(16)
  pdf.setFont("helvetica", "bold")
  pdf.text("⚡ KEY FEATURES", margin, yPosition)
  yPosition += 12

  data.features.forEach((feature) => {
    yPosition = checkPageBreak(15)

    // Background box
    const boxHeight = 12
    pdf.setFillColor(248, 250, 252)
    pdf.setDrawColor(16, 185, 129)
    pdf.setLineWidth(0.5)
    pdf.rect(margin, yPosition - 8, contentWidth, boxHeight, "FD")
    pdf.line(margin, yPosition - 8, margin, yPosition + 4)

    // Checkmark and text
    pdf.setTextColor(16, 185, 129)
    pdf.setFontSize(12)
    pdf.setFont("helvetica", "bold")
    pdf.text("✓", margin + 3, yPosition - 2)

    pdf.setTextColor(55, 65, 81)
    pdf.setFont("helvetica", "normal")
    yPosition = addWrappedText(feature, margin + 15, yPosition - 2, contentWidth - 15, 11) + 5
  })

  yPosition += sectionSpacing

  // Benefits Section
  yPosition = checkPageBreak(30)
  pdf.setTextColor(30, 41, 59)
  pdf.setFontSize(16)
  pdf.setFont("helvetica", "bold")
  pdf.text("🚀 BENEFITS", margin, yPosition)
  yPosition += 12

  data.benefits.forEach((benefit) => {
    yPosition = checkPageBreak(20)

    // Benefit box with gradient-like effect
    const boxHeight = 15
    pdf.setFillColor(243, 232, 255) // Light purple
    pdf.setDrawColor(196, 181, 253) // Purple border
    pdf.setLineWidth(1)
    pdf.roundedRect(margin, yPosition - 10, contentWidth, boxHeight, 3, 3, "FD")

    // Sparkle icon and text
    pdf.setTextColor(124, 58, 237) // Purple text
    pdf.setFontSize(12)
    pdf.setFont("helvetica", "bold")
    pdf.text("✨", margin + 5, yPosition - 2)

    yPosition = addWrappedText(benefit, margin + 15, yPosition - 2, contentWidth - 15, 12) + 8
  })

  yPosition += sectionSpacing

  // Video Section with CLICKABLE LINK
  if (data.loomUrl && (data.loomUrl.includes("loom.com") || data.loomUrl.startsWith("http"))) {
    yPosition = checkPageBreak(60)

    // Video section background
    const sectionHeight = 50
    pdf.setFillColor(248, 250, 252) // Light gray background
    pdf.setDrawColor(203, 213, 225) // Gray border
    pdf.setLineWidth(1)
    pdf.roundedRect(margin, yPosition - 5, contentWidth, sectionHeight, 5, 5, "FD")

    // Video title
    pdf.setTextColor(30, 41, 59)
    pdf.setFontSize(16)
    pdf.setFont("helvetica", "bold")
    pdf.text("🎥 VIDEO DEMONSTRATION", pageWidth / 2, yPosition + 8, { align: "center" })

    // CLICKABLE VIDEO BUTTON
    const buttonY = yPosition + 18
    const buttonWidth = 60
    const buttonHeight = 12
    const buttonX = (pageWidth - buttonWidth) / 2

    // Button background
    pdf.setFillColor(37, 99, 235) // Blue background
    pdf.setDrawColor(30, 64, 175) // Darker blue border
    pdf.setLineWidth(1)
    pdf.roundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 3, 3, "FD")

    // Button text
    pdf.setTextColor(255, 255, 255) // White text
    pdf.setFontSize(14)
    pdf.setFont("helvetica", "bold")
    pdf.text("▶️ Watch Loom Video", pageWidth / 2, buttonY + 8, { align: "center" })

    pdf.link(buttonX, buttonY, buttonWidth, buttonHeight, { url: data.loomUrl })

    // Direct link text
    yPosition = buttonY + buttonHeight + 8
    pdf.setTextColor(100, 116, 139)
    pdf.setFontSize(10)
    pdf.setFont("helvetica", "normal")
    pdf.text("Direct Link:", pageWidth / 2, yPosition, { align: "center" })

    yPosition += 5
    pdf.setTextColor(59, 130, 246) // Blue link color
    pdf.setFont("helvetica", "normal")
    const urlLines = pdf.splitTextToSize(data.loomUrl, contentWidth - 20)
    pdf.text(urlLines, pageWidth / 2, yPosition, { align: "center" })

    const urlHeight = urlLines.length * 4
    pdf.link(margin + 10, yPosition - 3, contentWidth - 20, urlHeight, { url: data.loomUrl })

    yPosition += urlLines.length * 4 + 8

    // Instructions
    pdf.setTextColor(100, 116, 139)
    pdf.setFontSize(10)
    pdf.setFont("helvetica", "italic")
    const instructions =
      "Click the button above or the direct link to view the video presentation. Links will open in your default web browser."
    const instructionLines = pdf.splitTextToSize(instructions, contentWidth - 20)
    pdf.text(instructionLines, pageWidth / 2, yPosition, { align: "center" })

    yPosition += instructionLines.length * 4 + sectionSpacing
  }

  // Footer
  yPosition = checkPageBreak(20)
  if (yPosition < pageHeight - 40) {
    yPosition = pageHeight - 40
  }

  // Footer divider
  pdf.setDrawColor(226, 232, 240)
  pdf.setLineWidth(0.5)
  pdf.line(margin, yPosition, pageWidth - margin, yPosition)
  yPosition += 8

  // Footer text
  pdf.setTextColor(100, 116, 139)
  pdf.setFontSize(11)
  pdf.setFont("helvetica", "bold")
  pdf.text("Generated from Loom Video Transcription", pageWidth / 2, yPosition, { align: "center" })

  yPosition += 6
  pdf.setFont("helvetica", "normal")
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  pdf.text(`Created on ${currentDate}`, pageWidth / 2, yPosition, { align: "center" })
}
