"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Download, FileText, File } from "lucide-react"
import { DeckPreview } from "@/components/deck-preview"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface DeckData {
  projectTitle: string
  description: string
  targetAudience: string[]
  useCases: string[]
  features: string[]
  benefits: string[]
  loomUrl: string
}

const generateCleanPDF = async (deckData: DeckData) => {
  const { default: jsPDF } = await import("jspdf")

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 25
  const contentWidth = pageWidth - margin * 2
  let y = 35

  const checkPageBreak = (requiredSpace: number) => {
    if (y + requiredSpace > pageHeight - 30) {
      pdf.addPage()
      y = 35
      return true
    }
    return false
  }

  const addText = (
    text: string,
    x: number,
    fontSize: number,
    color: [number, number, number],
    fontStyle = "normal",
    maxWidth = contentWidth,
    align = "left",
  ) => {
    pdf.setFont("helvetica", fontStyle)
    pdf.setFontSize(fontSize)
    pdf.setTextColor(color[0], color[1], color[2])

    const lines = pdf.splitTextToSize(text, maxWidth)
    const lineHeight = fontSize * 0.4
    const totalHeight = lines.length * lineHeight + 3

    checkPageBreak(totalHeight)

    if (align === "center") {
      lines.forEach((line: string, index: number) => {
        const lineWidth = pdf.getTextWidth(line)
        const lineX = (pageWidth - lineWidth) / 2
        pdf.text(line, lineX, y + index * lineHeight)
      })
    } else {
      pdf.text(lines, x, y)
    }

    y += totalHeight
    return y
  }

  const addSectionHeader = (title: string, dotColor: [number, number, number], icon?: string) => {
    checkPageBreak(20)

    pdf.setFillColor(dotColor[0], dotColor[1], dotColor[2])
    pdf.circle(margin + 1, y - 1, 1, "F")

    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(16)
    pdf.setTextColor(30, 41, 59)
    pdf.text(title, margin + 8, y)
    y += 12
  }

  checkPageBreak(50)

  addText(deckData.projectTitle, 0, 20, [15, 23, 42], "bold", contentWidth, "center")
  y += 5

  const lineWidth = 24
  const lineX = (pageWidth - lineWidth) / 2
  pdf.setFillColor(37, 99, 235)
  pdf.rect(lineX, y, lineWidth, 1, "F")
  y += 20

  addSectionHeader("Description", [37, 99, 235])
  addText(deckData.description, margin, 13, [71, 85, 105], "normal")
  y += 20

  addSectionHeader("Key Features", [37, 99, 235])
  deckData.features.forEach((feature) => {
    checkPageBreak(12)

    pdf.setFillColor(34, 197, 94)
    pdf.circle(margin + 2, y - 1, 1.5, "F")
    pdf.setTextColor(255, 255, 255)
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(8)
    pdf.text("✓", margin + 1, y)

    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(12)
    pdf.setTextColor(51, 65, 85)
    const lines = pdf.splitTextToSize(feature, contentWidth - 15)
    pdf.text(lines, margin + 10, y)
    y += lines.length * 5 + 8
  })
  y += 12

  addSectionHeader("Benefits", [147, 51, 234])
  deckData.benefits.forEach((benefit, index) => {
    checkPageBreak(15)

    const cleanBenefit = benefit
    const lines = pdf.splitTextToSize(cleanBenefit, contentWidth - 8)
    const boxHeight = lines.length * 4 + 6

    pdf.setFillColor(250, 245, 255)
    pdf.roundedRect(margin, y - 3, contentWidth, boxHeight, 2, 2, "F")

    pdf.setDrawColor(196, 181, 253)
    pdf.setLineWidth(0.2)
    pdf.roundedRect(margin, y - 3, contentWidth, boxHeight, 2, 2, "S")

    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(11)
    pdf.setTextColor(107, 33, 168)
    pdf.text(lines, margin + 4, y + 1)
    y += boxHeight + 8
  })
  y += 12

  if (deckData.useCases && deckData.useCases.length > 0) {
    addSectionHeader("Use Cases", [34, 197, 94])

    deckData.useCases.forEach((useCase) => {
      checkPageBreak(12)

      pdf.setFillColor(34, 197, 94)
      pdf.circle(margin + 2, y - 1, 1.5, "F")
      pdf.setTextColor(255, 255, 255)
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(8)
      pdf.text("✓", margin + 1, y)

      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(12)
      pdf.setTextColor(51, 65, 85)
      const lines = pdf.splitTextToSize(useCase, contentWidth - 15)
      pdf.text(lines, margin + 10, y)
      y += lines.length * 5 + 8
    })

    y += 12
  }

  if (deckData.targetAudience && deckData.targetAudience.length > 0) {
    addSectionHeader("Target Audiences", [234, 88, 12])

    let badgeX = margin
    let badgeY = y
    const badgeSpacing = 3
    const lineHeight = 8

    deckData.targetAudience.forEach((audience, index) => {
      const cleanAudience = audience
      const textWidth = pdf.getTextWidth(cleanAudience) + 8

      if (badgeX + textWidth > pageWidth - margin) {
        badgeX = margin
        badgeY += lineHeight + badgeSpacing
      }

      pdf.setFillColor(255, 247, 237)
      pdf.roundedRect(badgeX, badgeY - 4, textWidth, 6, 2, 2, "F")

      pdf.setDrawColor(254, 215, 170)
      pdf.setLineWidth(0.2)
      pdf.roundedRect(badgeX, badgeY - 4, textWidth, 6, 2, 2, "S")

      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(10)
      pdf.setTextColor(154, 52, 18)
      pdf.text(cleanAudience, badgeX + 4, badgeY)

      badgeX += textWidth + badgeSpacing
    })

    y = badgeY + 20
  }

  if (deckData.loomUrl) {
    checkPageBreak(35)

    const buttonWidth = 50
    const buttonHeight = 10
    const buttonX = (pageWidth - buttonWidth) / 2

    pdf.setFillColor(37, 99, 235)
    pdf.roundedRect(buttonX, y, buttonWidth, buttonHeight, 3, 3, "F")

    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(11)
    pdf.setTextColor(255, 255, 255)
    const buttonText = "Watch Loom Video"
    const textWidth = pdf.getTextWidth(buttonText)
    const textX = buttonX + (buttonWidth - textWidth) / 2
    pdf.text(buttonText, textX, y + 6.5)

    pdf.link(buttonX, y, buttonWidth, buttonHeight, { url: deckData.loomUrl })
    console.log("Added clickable link to PDF:", deckData.loomUrl)

    y += 25
  }

  checkPageBreak(15)
  y = Math.max(y, pageHeight - 25)

  pdf.setDrawColor(226, 232, 240)
  pdf.setLineWidth(0.3)
  pdf.line(margin, y - 10, pageWidth - margin, y - 10)

  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(9)
  pdf.setTextColor(148, 163, 184)
  const footerText = `Generated from Loom video transcription • ${new Date().toLocaleDateString()}`
  addText(footerText, 0, 9, [148, 163, 184], "normal", contentWidth, "center")

  return pdf
}

export default function GeneratePage() {
  const [loomUrl, setLoomUrl] = useState("")
  const [transcription, setTranscription] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [deckData, setDeckData] = useState<DeckData | null>(null)
  const [error, setError] = useState("")
  const [isDownloading, setIsDownloading] = useState(false)

  const handleGenerate = async () => {
    if (!loomUrl.trim() || !transcription.trim()) {
      setError("Please provide both Loom URL and transcription")
      return
    }

    setIsGenerating(true)
    setError("")

    try {
      const response = await fetch("/api/generate-deck", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          loomUrl: loomUrl.trim(),
          transcription: transcription.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      setDeckData(data)
    } catch (err) {
      console.error("Generation error:", err)
      setError(`Failed to generate deck: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!deckData) return

    setIsDownloading(true)
    setError("")

    try {
      const pdf = await generateCleanPDF(deckData)
      const filename = `${deckData.projectTitle.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}-pitch-deck.pdf`
      pdf.save(filename)
      console.log("Clean PDF with functional video link generated successfully")
    } catch (err) {
      console.error("PDF generation error:", err)
      setError(`Failed to generate PDF: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleDownloadWord = async () => {
    if (!deckData) return

    setIsDownloading(true)
    setError("")

    try {
      console.log("Starting Word download...")
      const response = await fetch("/api/generate-word", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(deckData),
      })

      console.log("Word response status:", response.status)
      console.log("Word response headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const blob = await response.blob()
      console.log("Word blob size:", blob.size)
      console.log("Word blob type:", blob.type)

      if (blob.size === 0) {
        throw new Error("Received empty Word document")
      }

      if (!blob.type.includes("officedocument") && !blob.type.includes("application/octet-stream")) {
        console.warn("Unexpected blob type for Word document:", blob.type)
      }

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `${deckData.projectTitle.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}-pitch-deck.docx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      console.log("Word document downloaded successfully")
    } catch (err) {
      console.error("Word download error:", err)
      setError(`Failed to download Word document: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Pitch Deck Generator</h1>
            <p className="text-xl text-slate-600">Transform your Loom videos into professional pitch decks</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Generate Your Deck</CardTitle>
                <CardDescription>
                  Provide your Loom video URL and transcription to create a professional pitch deck
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="loom-url">Loom Video URL</Label>
                  <Input
                    id="loom-url"
                    type="url"
                    placeholder="https://www.loom.com/share/..."
                    value={loomUrl}
                    onChange={(e) => setLoomUrl(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transcription">Video Transcription</Label>
                  <Textarea
                    id="transcription"
                    placeholder="Paste your video transcription here..."
                    className="min-h-[200px]"
                    value={transcription}
                    onChange={(e) => setTranscription(e.target.value)}
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !loomUrl.trim() || !transcription.trim()}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Deck...
                    </>
                  ) : (
                    "Generate Pitch Deck"
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">Preview</h2>
                {deckData && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" disabled={isDownloading}>
                        {isDownloading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Downloading...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Download Deck
                          </>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleDownloadPDF}>
                        <FileText className="w-4 h-4 mr-2" />
                        Download as PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleDownloadWord}>
                        <File className="w-4 h-4 mr-2" />
                        Download as Word
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {deckData ? (
                <DeckPreview data={deckData} />
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-64">
                    <p className="text-slate-500">Generate a deck to see the preview</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
