/**
 * 对话气泡组件 - Calm Tech + Soft Brutalism 设计（V2）
 * 更简洁、更克制的对话气泡
 */

interface ChatMessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatMessageBubble({
  role,
  content,
}: ChatMessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] md:max-w-[75%] px-4 py-2.5 rounded-lg text-sm ${
          isUser ? 'bg-[#1A1A1A] text-white' : 'bg-white text-[#1A1A1A]'
        }`}
        style={!isUser ? { border: '1.5px solid #E5E5E5' } : undefined}
      >
        <p className="leading-relaxed whitespace-pre-wrap">
          {content}
        </p>
      </div>
    </div>
  );
}
