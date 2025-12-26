/**
 * 今日卡片Overlay展开态
 * 悬浮在对话区域之上，带遮罩
 * 标签样式与DailyFocusCard保持一致
 */

'use client';

import { useEffect } from 'react';

interface DailyCardOverlayProps {
  focus?: string;
  forbidden?: string;
  reason?: string;
  onClose: () => void;
}

export default function DailyCardOverlay({
  focus,
  forbidden,
  reason,
  onClose,
}: DailyCardOverlayProps) {
  // ESC键关闭
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* 遮罩层 */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      {/* 卡片内容 - Soft Brutalism: 1.5px边框 + 32px留白 */}
      <div className="relative w-full max-w-lg bg-white rounded-lg p-8 animate-in fade-in slide-in-from-top-4 duration-200"
        style={{ border: '1.5px solid #E5E5E5' }}
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between mb-6 pb-4"
          style={{ borderBottom: '1.5px solid #E5E5E5' }}
        >
          <h2 className="text-sm font-medium text-[#666666] uppercase tracking-wide">
            Today
          </h2>
          <button
            onClick={onClose}
            className="text-[#A3A3A3] hover:text-[#666666] transition-colors duration-200"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 内容 - Inline Layout with 突出标签 */}
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
      </div>
    </div>
  );
}
