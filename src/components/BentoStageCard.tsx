/**
 * Bento Stage Card - 动态焦点手风琴卡片
 * Calm Tech + Soft Brutalism 设计
 * 支持悬停展开、详细说明淡入、CTA 按钮滑出、主题色光效
 */

'use client';

import { useState } from 'react';

interface BentoStageCardProps {
  stageNumber: number;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  onClick: () => void;
  themeColor: string; // 主题色（如 #64748B）
  isActive?: boolean;
  onHover?: (isHovered: boolean) => void;
}

export default function BentoStageCard({
  stageNumber,
  title,
  subtitle,
  description,
  buttonText,
  onClick,
  themeColor,
  isActive = false,
  onHover,
}: BentoStageCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHover?.(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onHover?.(false);
  };

  const isExpanded = isHovered || isActive;

  // 将 HEX 色值转为 RGBA（用于光晕效果）
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // 极淡的主题色背景（5% 透明度叠加白色）
  const lightThemeBg = hexToRgba(themeColor, 0.05);

  return (
    <div
      className="group relative overflow-hidden rounded-3xl transition-all duration-300"
      style={{
        flex: isExpanded ? 3 : 1,
        backgroundColor: isExpanded ? lightThemeBg : '#FFFFFF',
        border: isExpanded ? 'none' : '1.5px solid #E5E5E5',
        boxShadow: isExpanded
          ? `0 4px 20px -4px ${hexToRgba(themeColor, 0.4)}, 0 0 0 2px ${themeColor} inset`
          : 'none',
        transitionTimingFunction: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      tabIndex={0}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      role="button"
      aria-expanded={isExpanded}
    >
      <div className="p-8 md:p-10 h-full flex flex-col">
        {/* 阶段标题 */}
        <div className="space-y-2">
          <h3 className="text-2xl md:text-3xl font-bold text-[#1A1A1A]">
            {stageNumber}. {title}
          </h3>
          <p className="text-base md:text-lg text-[#666666] font-medium">
            {subtitle}
          </p>
        </div>

        {/* 详细说明 - 延迟淡入效果 */}
        <div
          className="mt-6 transition-all duration-300"
          style={{
            opacity: isExpanded ? 1 : 0,
            maxHeight: isExpanded ? '200px' : '0px',
            overflow: 'hidden',
            pointerEvents: isExpanded ? 'auto' : 'none',
            transitionDelay: isExpanded ? '0.1s' : '0s',
            transitionTimingFunction: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
          }}
        >
          <p className="text-sm md:text-base text-[#666666] leading-relaxed">
            {description}
          </p>
        </div>

        {/* CTA 按钮 - 滑出效果 */}
        <div
          className="mt-auto pt-6 transition-all duration-300"
          style={{
            opacity: isExpanded ? 1 : 0,
            transform: isExpanded ? 'translateY(0)' : 'translateY(20px)',
            pointerEvents: isExpanded ? 'auto' : 'none',
            transitionDelay: isExpanded ? '0.1s' : '0s',
            transitionTimingFunction: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
          }}
        >
          <button
            onClick={onClick}
            className="w-full h-14 text-white text-base font-semibold rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              backgroundColor: themeColor,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
