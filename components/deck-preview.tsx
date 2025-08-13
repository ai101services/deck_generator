"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Star, Zap, ExternalLink } from "lucide-react"

interface DeckData {
  projectTitle: string
  description: string
  targetAudience?: string[]
  useCases?: string[]
  features: string[]
  benefits: string[]
  loomUrl: string
}

interface DeckPreviewProps {
  data: DeckData
}

export function DeckPreview({ data }: DeckPreviewProps) {
  const handleLoomClick = () => {
    if (data.loomUrl) {
      window.open(data.loomUrl, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-2xl">
      <CardContent className="p-8 bg-gradient-to-br from-white to-slate-50">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4 leading-tight">{data.projectTitle}</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-3 flex items-center">
            <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
            Project Overview
          </h2>
          <p className="text-slate-600 leading-relaxed text-lg">{data.description}</p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-blue-600" />
            Key Features
          </h2>
          <div className="space-y-3">
            {data.features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2 text-purple-600" />
            Benefits
          </h2>
          <div className="space-y-3">
            {data.benefits.map((benefit, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="block w-full text-left p-3 bg-purple-50 text-purple-800 border-purple-200"
              >
                {benefit}
              </Badge>
            ))}
          </div>
        </div>

        {data.useCases && data.useCases.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
              <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
              Use Cases
            </h2>
            <div className="space-y-3">
              {data.useCases.map((useCase, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700">{useCase}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.targetAudience && data.targetAudience.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
              <div className="w-2 h-2 bg-orange-600 rounded-full mr-3"></div>
              Target Audiences
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.targetAudience.map((audience, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-orange-50 text-orange-800 border-orange-200 px-3 py-1"
                >
                  {audience}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {data.loomUrl && (
          <div className="mt-8 text-center">
            <Button
              onClick={handleLoomClick}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Watch Loom Video
            </Button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-200 text-center">
          <p className="text-sm text-slate-500">
            Generated from Loom video transcription • {new Date().toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
