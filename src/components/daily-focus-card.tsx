"use client"

import type { ReactNode } from "react"

interface DailyFocusCardProps {
  focus?: string
  forbidden?: string
  reason?: string
  isLoading?: boolean
  onGenerate?: () => void
}

export function DailyFocusCard({ focus, forbidden, reason, isLoading = false, onGenerate }: DailyFocusCardProps) {
  const isEmpty = !focus && !forbidden && !reason && !isLoading

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8">
        {/* Card Title */}
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-6 sm:mb-8">今日卡片</h1>

        {isEmpty ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-12 sm:py-16">
            <p className="text-base sm:text-lg text-gray-600 mb-6">点击「生成今日卡片」按钮</p>
            <button
              onClick={onGenerate}
              className="bg-gray-900 text-white px-6 h-12 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              生成今日卡片
            </button>
          </div>
        ) : isLoading ? (
          // Loading State
          <div className="py-12 sm:py-16">
            <p className="text-base sm:text-lg text-gray-600 text-center">正在生成今日卡片...</p>
          </div>
        ) : (
          // Filled State
          <div className="space-y-6 sm:space-y-8">
            {/* Section 1: Focus */}
            <Section icon="✅" label="最需要关注" content={focus} />

            {/* Divider */}
            <div className="border-t border-gray-200" />

            {/* Section 2: Forbidden */}
            <Section icon="❌" label="容易犯的错误" content={forbidden} />

            {/* Divider */}
            <div className="border-t border-gray-200" />

            {/* Section 3: Reason */}
            <Section icon="ℹ️" label="为什么" content={reason} />
          </div>
        )}
      </div>
    </div>
  )
}

interface SectionProps {
  icon: ReactNode
  label: string
  content?: string
}

function Section({ icon, label, content }: SectionProps) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-lg">{icon}</span>
        <h2 className="text-lg sm:text-xl font-medium text-gray-900">{label}</h2>
      </div>
      <p className="text-base text-gray-700 leading-relaxed pl-7">{content}</p>
    </div>
  )
}
