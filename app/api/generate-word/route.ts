import { type NextRequest, NextResponse } from "next/server"
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ExternalHyperlink, BorderStyle } from "docx"

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
    console.log("Word generation started")
    const deckData: DeckData = await request.json()
    console.log("Received deck data:", deckData.projectTitle)

    // Create Word document
    const doc = await createWordDocument(deckData)
    console.log("Word document created successfully")

    // Generate buffer
    const buffer = await Packer.toBuffer(doc)
    console.log("Word buffer generated, size:", buffer.length)

    const filename = `${deckData.projectTitle.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}-pitch-deck.docx`

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("Word generation error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate Word document",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

async function createWordDocument(data: DeckData): Promise<Document> {
  const children: Paragraph[] = []

  // Header
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "★ PROJECT PITCH",
          bold: true,
          size: 20,
          color: "1D4ED8",
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: data.projectTitle,
          bold: true,
          size: 48,
          color: "0F172A",
        }),
      ],
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      border: {
        bottom: {
          color: "2563EB",
          space: 1,
          style: BorderStyle.SINGLE,
          size: 6,
        },
      },
    }),
  )

  // Project Overview
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Project Overview",
          bold: true,
          size: 32,
          color: "1E293B",
        }),
      ],
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 300, after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: data.description,
          size: 24,
          color: "475569",
        }),
      ],
      spacing: { after: 300 },
    }),
  )

  // Target Audience
  if (data.targetAudience && data.targetAudience.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Target Audience",
            bold: true,
            size: 32,
            color: "1E293B",
          }),
        ],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 200 },
      }),
    )

    data.targetAudience.forEach((audience) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `• ${audience}`,
              size: 24,
              color: "EA580C",
              bold: true,
            }),
          ],
          spacing: { after: 100 },
        }),
      )
    })

    children.push(new Paragraph({ spacing: { after: 200 } }))
  }

  // Use Cases
  if (data.useCases && data.useCases.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Use Cases",
            bold: true,
            size: 32,
            color: "1E293B",
          }),
        ],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 200 },
      }),
    )

    data.useCases.forEach((useCase) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "✓ ",
              size: 24,
              color: "10B981",
              bold: true,
            }),
            new TextRun({
              text: useCase,
              size: 24,
              color: "475569",
            }),
          ],
          spacing: { after: 150 },
        }),
      )
    })

    children.push(new Paragraph({ spacing: { after: 200 } }))
  }

  // Key Features
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Key Features",
          bold: true,
          size: 32,
          color: "1E293B",
        }),
      ],
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 300, after: 200 },
    }),
  )

  data.features.forEach((feature) => {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "✓ ",
            size: 24,
            color: "10B981",
            bold: true,
          }),
          new TextRun({
            text: feature,
            size: 24,
            color: "475569",
          }),
        ],
        spacing: { after: 150 },
      }),
    )
  })

  children.push(new Paragraph({ spacing: { after: 200 } }))

  // Benefits
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Benefits",
          bold: true,
          size: 32,
          color: "1E293B",
        }),
      ],
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 300, after: 200 },
    }),
  )

  data.benefits.forEach((benefit) => {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `• ${benefit}`,
            size: 24,
            color: "7C3AED",
            bold: true,
          }),
        ],
        spacing: { after: 150 },
      }),
    )
  })

  children.push(new Paragraph({ spacing: { after: 300 } }))

  // Loom Video Link
  if (data.loomUrl) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Video Demonstration",
            bold: true,
            size: 32,
            color: "1E293B",
          }),
        ],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 200 },
      }),
      new Paragraph({
        children: [
          new ExternalHyperlink({
            children: [
              new TextRun({
                text: "🎥 Watch Loom Video Presentation",
                bold: true,
                size: 28,
                color: "2563EB",
                underline: {},
              }),
            ],
            link: data.loomUrl,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: "Click the link above to view the video demonstration",
            size: 20,
            color: "64748B",
            italics: true,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
      }),
    )
  }

  // Footer
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Generated from Loom video transcription on ${new Date().toLocaleDateString()}`,
          size: 18,
          color: "64748B",
          italics: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 100 },
      border: {
        top: {
          color: "E2E8F0",
          space: 1,
          style: BorderStyle.SINGLE,
          size: 6,
        },
      },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "This document contains clickable links for enhanced interactivity",
          size: 18,
          color: "64748B",
          italics: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),
  )

  return new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  })
}
