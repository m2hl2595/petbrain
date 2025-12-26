/**
 * 今日卡片组件 - Inline Layout（信息密度优化 + 标签突出）
 * 水平行内布局：【标题】内容内容...
 * 标签加边框，符合Soft Brutalism风格
 */

'use client';

import { forwardRef } from 'react';

interface DailyFocusCardProps {
  focus?: string;
  forbidden?: string;
  reason?: string;
  isLoading?: boolean;
  onGenerate?: () => void;
}

const DailyFocusCard = forwardRef<HTMLDivElement, DailyFocusCardProps>(
  ({ focus, forbidden, reason, isLoading = false, onGenerate }, ref) => {
    const isEmpty = !focus && !forbidden && !reason;

    return (
      <div
        ref={ref}
        className="w-full bg-white rounded-lg p-8"
        style={{ border: '1.5px solid #E5E5E5' }}
      >
        {/* 标题行 */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-medium text-[#666666] uppercase tracking-wide">
            Today
          </h2>
          {!isEmpty && !isLoading && onGenerate && (
            <button
              onClick={onGenerate}
              className="text-xs text-[#A3A3A3] hover:text-[#666666] transition-colors duration-200"
            >
              重新生成
            </button>
          )}
        </div>

        {/* Loading 状态 */}
        {isLoading && <p className="text-sm text-[#A3A3A3]">生成中...</p>}

        {/* Empty 状态 */}
        {!isLoading && isEmpty && (
          <div>
            <p className="text-sm text-[#666666] mb-2">
              点击生成今天的关注重点
            </p>
            {onGenerate && (
              <button
                onClick={onGenerate}
                className="text-sm text-[#1A1A1A] hover:text-[#666666] underline transition-colors duration-200"
              >
                生成卡片
              </button>
            )}
          </div>
        )}

        {/* Filled 状态 - Inline Layout with 突出标签 */}
        {!isLoading && !isEmpty && (
          <div className="space-y-3 text-sm leading-relaxed">
            {/* Focus - 带边框标签 */}
            {focus && (
              <div className="flex gap-2 items-start">
                <span className="inline-flex px-2 py-0.5 border border-[#1A1A1A] text-[#1A1A1A] font-semibold text-xs rounded whitespace-nowrap">
                  最需关注
                </span>
                <p className="flex-1 text-[#1A1A1A]">{focus}</p>
              </div>
            )}

            {/* Forbidden - 带背景标签 */}
            {forbidden && (
              <div className="flex gap-2 items-start">
                <span className="inline-flex px-2 py-0.5 bg-[#1A1A1A] text-white font-semibold text-xs rounded whitespace-nowrap">
                  需要避免
                </span>
                <p className="flex-1 text-[#1A1A1A]">{forbidden}</p>
              </div>
            )}

            {/* Reason - 浅色背景标签 */}
            {reason && (
              <div className="flex gap-2 items-start">
                <span className="inline-flex px-2 py-0.5 bg-[#F5F5F5] border border-[#E5E5E5] text-[#666666] font-semibold text-xs rounded whitespace-nowrap">
                  原因
                </span>
                <p className="flex-1 text-[#666666]">{reason}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

DailyFocusCard.displayName = 'DailyFocusCard';

export default DailyFocusCard;
