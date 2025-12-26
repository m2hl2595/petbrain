/**
 * 今日卡片 Bento Tab - 固定在右侧边缘
 * 垂直显示"今日焦点"，深灰蓝 #4A5568
 */

interface DailyCardBentoTabProps {
  onClick: () => void;
}

export default function DailyCardBentoTab({ onClick }: DailyCardBentoTabProps) {
  return (
    <button
      onClick={onClick}
      className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center justify-center gap-1 px-3 py-6 bg-[#4A5568] text-white rounded-l-lg shadow-none hover:bg-[#333333] transition-colors duration-200"
      style={{ writingMode: 'vertical-rl' }}
    >
      <span className="text-sm font-medium tracking-wider">今日焦点</span>
    </button>
  );
}
