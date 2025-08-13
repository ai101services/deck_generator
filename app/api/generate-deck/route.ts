import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { loomUrl, transcription } = await request.json()

    if (!loomUrl || !transcription) {
      return NextResponse.json({ error: "Loom URL and transcription are required" }, { status: 400 })
    }

    const prompt = `
    Analyze the following video transcription and extract information to create a professional pitch deck. 
    
    Transcription: "${transcription}"
    
    Please extract and format the following information in JSON format:
    1. Project Title (create a compelling title if not explicitly mentioned)
    2. Project Description (2-3 sentences summarizing the project)
    3. Target Audience (list of 3-5 target audience segments)
    4. Use Cases (list of 3-5 specific use case scenarios)
    5. Key Features (list of 4-6 main features)
    6. Benefits (list of 3-5 key benefits)
    
    Make the language professional, clear, and compelling. Focus on value propositions and user benefits.
    
    Return ONLY a valid JSON object with this structure:
    {
      "projectTitle": "string",
      "description": "string",
      "targetAudience": ["string", "string", ...],
      "useCases": ["string", "string", ...], 
      "features": ["string", "string", ...],
      "benefits": ["string", "string", ...]
    }
    `

    // Try xAI API with correct model names
    if (process.env.XAI_API_KEY) {
      const modelNames = ["grok-2-1212", "grok-2", "grok-1", "grok"]

      for (const modelName of modelNames) {
        try {
          console.log(`Trying xAI model: ${modelName}`)

          const response = await fetch("https://api.x.ai/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.XAI_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: modelName,
              messages: [
                {
                  role: "system",
                  content: "You are a professional pitch deck creator. Always respond with valid JSON only.",
                },
                {
                  role: "user",
                  content: prompt,
                },
              ],
              temperature: 0.7,
              max_tokens: 1500,
            }),
          })

          if (response.ok) {
            const data = await response.json()
            const aiResponse = data.choices?.[0]?.message?.content

            if (aiResponse) {
              // Parse the AI response
              let deckData
              try {
                deckData = JSON.parse(aiResponse)
              } catch (parseError) {
                // If JSON parsing fails, try to extract JSON from the response
                const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
                if (jsonMatch) {
                  deckData = JSON.parse(jsonMatch[0])
                } else {
                  throw new Error("Failed to parse AI response")
                }
              }

              // Add the Loom URL to the response
              deckData.loomUrl = loomUrl

              // Validate the structure
              if (
                deckData.projectTitle &&
                deckData.description &&
                Array.isArray(deckData.features) &&
                Array.isArray(deckData.benefits)
              ) {
                console.log(`Successfully used xAI model: ${modelName}`)
                return NextResponse.json(deckData)
              }
            }
          } else {
            const errorText = await response.text()
            console.log(`Model ${modelName} failed: ${response.status} - ${errorText}`)
          }
        } catch (modelError) {
          console.log(`Model ${modelName} error:`, modelError)
          continue
        }
      }
    }

    // If all AI attempts fail, use intelligent content extraction
    console.log("AI API failed, using intelligent content extraction")
    const intelligentData = generateIntelligentDeckData(transcription, loomUrl)
    return NextResponse.json(intelligentData)
  } catch (error) {
    console.error("Deck generation error:", error)

    // Emergency fallback
    try {
      const { loomUrl, transcription } = await request.json()
      const mockData = generateIntelligentDeckData(transcription, loomUrl)
      return NextResponse.json(mockData)
    } catch (fallbackError) {
      return NextResponse.json({ error: "Failed to generate deck content" }, { status: 500 })
    }
  }
}

function generateIntelligentDeckData(transcription: string, loomUrl: string) {
  console.log("Generating intelligent deck data from transcription")

  // More intelligent content extraction
  const text = transcription.toLowerCase()
  const sentences = transcription.split(/[.!?]+/).filter((s) => s.trim().length > 10)

  // Extract project title with better logic
  let projectTitle = "Innovative Solution"

  // Look for common project name patterns
  const titlePatterns = [
    /(?:called|named|introducing|show you|present|built)\s+([A-Z][a-zA-Z]+)/gi,
    /([A-Z][a-zA-Z]+)(?:\s+is|\s+helps|\s+allows|\s+enables)/g,
    /(?:our|the|this)\s+([A-Z][a-zA-Z]+)\s+(?:platform|app|system|tool|solution)/gi,
    /([A-Z][a-zA-Z]+),?\s+(?:our|an?)\s+(?:innovative|new|advanced)/gi,
  ]

  for (const pattern of titlePatterns) {
    const matches = [...transcription.matchAll(pattern)]
    if (matches.length > 0) {
      const match = matches[0][1]
      if (match && match.length > 2 && match.length < 20 && !["Our", "The", "This", "An", "A"].includes(match)) {
        projectTitle = match
        break
      }
    }
  }

  // Extract description from first few sentences
  let description = sentences.slice(0, 2).join(". ").trim()
  if (description && !description.endsWith(".")) {
    description += "."
  }
  if (!description || description.length < 20) {
    description =
      "An innovative solution designed to address modern challenges and improve user experiences through advanced technology and intuitive design."
  }

  const targetAudience = []
  const audiencePatterns = [
    /(?:for|targeting|designed for|helps)\s+([^.]*?(?:businesses|companies|users|customers|professionals|teams|individuals)[^.]*)/gi,
    /([^.]*?(?:small business|enterprise|startup|freelancer|developer|manager|executive)[^.]*)/gi,
  ]

  for (const pattern of audiencePatterns) {
    const matches = [...transcription.matchAll(pattern)]
    for (const match of matches) {
      if (match[1] && match[1].length > 5 && match[1].length < 80) {
        let audience = match[1].trim()
        audience = audience.replace(/^(that|which|and|,)\s*/i, "")
        audience = audience.charAt(0).toUpperCase() + audience.slice(1)
        if (targetAudience.length < 5 && !targetAudience.includes(audience)) {
          targetAudience.push(audience)
        }
      }
    }
  }

  // Add default audiences if none found
  if (targetAudience.length === 0) {
    targetAudience.push("Small to medium businesses", "Professional teams", "Individual users", "Technology adopters")
  }

  const useCases = []
  const useCasePatterns = [
    /(?:use case|scenario|example|when you|you can use|perfect for)\s+([^.]*)/gi,
    /([^.]*?(?:workflow|process|task|activity|operation)[^.]*)/gi,
  ]

  for (const pattern of useCasePatterns) {
    const matches = [...transcription.matchAll(pattern)]
    for (const match of matches) {
      if (match[1] && match[1].length > 10 && match[1].length < 120) {
        let useCase = match[1].trim()
        useCase = useCase.replace(/^(that|which|and|,)\s*/i, "")
        useCase = useCase.charAt(0).toUpperCase() + useCase.slice(1)
        if (!useCase.endsWith(".")) useCase += "."
        if (useCases.length < 5 && !useCases.includes(useCase)) {
          useCases.push(useCase)
        }
      }
    }
  }

  // Add default use cases if none found
  if (useCases.length === 0) {
    useCases.push(
      "Streamlining daily operations and workflows.",
      "Improving team collaboration and communication.",
      "Automating repetitive tasks and processes.",
      "Enhancing data analysis and decision-making.",
    )
  }

  // Extract features based on keywords and context
  const features = []

  // Look for explicit feature mentions
  const featureIndicators = [
    /(?:features? include|key features|main features|includes?)[:\s]+(.*?)(?:\.|$)/gi,
    /(?:our|the)\s+([^.]*?(?:monitoring|tracking|reporting|analytics|optimization|management|integration|security)[^.]*)/gi,
    /([^.]*?(?:real-time|automated|smart|advanced|integrated|seamless)[^.]*)/gi,
  ]

  for (const pattern of featureIndicators) {
    const matches = [...transcription.matchAll(pattern)]
    for (const match of matches) {
      if (match[1] && match[1].length > 10 && match[1].length < 150) {
        let feature = match[1].trim()
        // Clean up the feature text
        feature = feature.replace(/^(that|which|and|,)\s*/i, "")
        feature = feature.charAt(0).toUpperCase() + feature.slice(1)
        if (!feature.endsWith(".")) feature += "."

        if (
          features.length < 6 &&
          !features.some((f) => f.toLowerCase().includes(feature.toLowerCase().substring(0, 20)))
        ) {
          features.push(feature)
        }
      }
    }
  }

  // Add contextual features if not enough found
  if (features.length < 4) {
    const contextualFeatures = []

    if (text.includes("monitor") || text.includes("track")) {
      contextualFeatures.push("Real-time monitoring and tracking capabilities.")
    }
    if (text.includes("report") || text.includes("analytic")) {
      contextualFeatures.push("Comprehensive reporting and analytics dashboard.")
    }
    if (text.includes("automat") || text.includes("smart")) {
      contextualFeatures.push("Automated intelligent processing and optimization.")
    }
    if (text.includes("integrat") || text.includes("connect")) {
      contextualFeatures.push("Seamless integration with existing systems.")
    }
    if (text.includes("user") || text.includes("interface")) {
      contextualFeatures.push("Intuitive user-friendly interface design.")
    }
    if (text.includes("secur") || text.includes("safe")) {
      contextualFeatures.push("Advanced security and data protection.")
    }

    // Add contextual features
    for (const feature of contextualFeatures) {
      if (features.length < 6 && !features.includes(feature)) {
        features.push(feature)
      }
    }
  }

  // Fill with default features if still not enough
  const defaultFeatures = [
    "User-friendly interface design.",
    "Real-time data processing and analytics.",
    "Seamless integration capabilities.",
    "Advanced security and privacy protection.",
    "Scalable architecture for future growth.",
    "Comprehensive reporting and insights.",
  ]

  while (features.length < 5) {
    for (const defaultFeature of defaultFeatures) {
      if (!features.includes(defaultFeature) && features.length < 5) {
        features.push(defaultFeature)
      }
    }
    break
  }

  // Extract benefits
  const benefits = []

  // Look for explicit benefit mentions
  const benefitIndicators = [
    /(?:benefit|advantage|result|impact|improvement)[s]?[:\s]+(.*?)(?:\.|$)/gi,
    /([^.]*?(?:\d+%|percent|save|reduce|increase|improve|boost|enhance)[^.]*)/gi,
    /([^.]*?(?:cost|time|efficiency|productivity|revenue|satisfaction)[^.]*)/gi,
  ]

  for (const pattern of benefitIndicators) {
    const matches = [...transcription.matchAll(pattern)]
    for (const match of matches) {
      if (match[1] && match[1].length > 10 && match[1].length < 120) {
        let benefit = match[1].trim()
        benefit = benefit.replace(/^(that|which|and|,)\s*/i, "")
        benefit = benefit.charAt(0).toUpperCase() + benefit.slice(1)
        if (!benefit.endsWith(".")) benefit += "."

        if (
          benefits.length < 5 &&
          !benefits.some((b) => b.toLowerCase().includes(benefit.toLowerCase().substring(0, 20)))
        ) {
          benefits.push(benefit)
        }
      }
    }
  }

  // Add contextual benefits
  if (benefits.length < 3) {
    const contextualBenefits = []

    if (text.includes("cost") || text.includes("save") || text.includes("money")) {
      contextualBenefits.push("Significant cost reduction and resource optimization.")
    }
    if (text.includes("time") || text.includes("faster") || text.includes("quick")) {
      contextualBenefits.push("Improved time efficiency and faster processes.")
    }
    if (text.includes("productiv") || text.includes("efficien")) {
      contextualBenefits.push("Increased productivity and operational efficiency.")
    }
    if (text.includes("user") || text.includes("experience") || text.includes("satisfaction")) {
      contextualBenefits.push("Enhanced user experience and satisfaction.")
    }
    if (text.includes("competitive") || text.includes("advantage") || text.includes("market")) {
      contextualBenefits.push("Competitive advantage in the marketplace.")
    }

    for (const benefit of contextualBenefits) {
      if (benefits.length < 5 && !benefits.includes(benefit)) {
        benefits.push(benefit)
      }
    }
  }

  // Fill with default benefits if needed
  const defaultBenefits = [
    "Increased operational efficiency and productivity.",
    "Significant cost reduction and resource optimization.",
    "Enhanced user experience and satisfaction.",
    "Improved decision-making with data-driven insights.",
    "Competitive advantage in the marketplace.",
  ]

  while (benefits.length < 4) {
    for (const defaultBenefit of defaultBenefits) {
      if (!benefits.includes(defaultBenefit) && benefits.length < 4) {
        benefits.push(defaultBenefit)
      }
    }
    break
  }

  const result = {
    projectTitle,
    description,
    targetAudience: targetAudience.slice(0, 5),
    useCases: useCases.slice(0, 5),
    features: features.slice(0, 6),
    benefits: benefits.slice(0, 5),
    loomUrl,
  }

  console.log("Generated deck data:", result)
  return result
}
