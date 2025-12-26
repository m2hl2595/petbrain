/**
 * 今日卡片悬浮态 - 小型按钮/条
 * 滚动时自动显示，点击展开Overlay
 */

interface DailyCardFloatingProps {
  onClick: () => void;
  hasCard: boolean;
}

export default function DailyCardFloating({
  onClick,
  hasCard,
}: DailyCardFloatingProps) {
  if (!hasCard) return null;

  return (
    <button
      onClick={onClick}
      className="fixed top-4 right-4 z-40 flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E5E5] rounded-lg shadow-sm hover:border-[#666666] transition-all duration-200"
    >
      <span className="text-xs font-medium text-[#666666] uppercase tracking-wide">
        Today
      </span>
      <svg
        className="w-4 h-4 text-[#A3A3A3]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>
  );
}
